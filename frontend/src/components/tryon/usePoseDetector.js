/**
 * usePoseDetector.js — Optimized for performance + mobile
 *
 * Key improvements:
 *  - Mobile detection → modelComplexity 0 (lite) on mobile, 1 (full) on desktop
 *  - Frame throttling → pose runs at 20fps on mobile, 30fps on desktop (not 60fps)
 *  - Exponential moving average (EMA) smoothing on landmarks → no jitter
 *  - Prevents overlapping pose.send() calls via busy flag
 */
import { useEffect, useRef, useState, useCallback } from 'react';

// Target pose detection intervals (ms)
const MOBILE_FPS_INTERVAL = 50;   // ~20 fps on mobile
const DESKTOP_FPS_INTERVAL = 33;  // ~30 fps on desktop

// Exponential Moving Average factor for landmark smoothing (0=no smooth, 1=frozen)
const EMA_ALPHA = 0.35;

/** Detect mobile device */
const isMobile = () =>
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

/** Apply EMA smoothing to landmarks */
const smoothLandmarks = (prev, next, alpha) => {
    if (!prev) return next;
    return next.map((lm, i) => ({
        x: prev[i].x + alpha * (lm.x - prev[i].x),
        y: prev[i].y + alpha * (lm.y - prev[i].y),
        z: prev[i].z + alpha * (lm.z - prev[i].z),
        visibility: prev[i].visibility + alpha * (lm.visibility - prev[i].visibility),
    }));
};

const usePoseDetector = (videoRef, isActive) => {
    const poseRef = useRef(null);
    const animFrameRef = useRef(null);
    const lastRunRef = useRef(0);   // Timestamp of last pose.send()
    const isBusyRef = useRef(false); // Prevent overlapping calls
    const smoothedLandmarksRef = useRef(null);

    const [landmarks, setLandmarks] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [status, setStatus] = useState('idle');

    const mobile = isMobile();
    const fpsInterval = mobile ? MOBILE_FPS_INTERVAL : DESKTOP_FPS_INTERVAL;

    // ── Initialize MediaPipe Pose ──────────────────────────────────────────
    useEffect(() => {
        if (!isActive) {
            setLandmarks(null);
            setIsReady(false);
            setStatus('idle');
            smoothedLandmarksRef.current = null;
            return;
        }

        if (typeof window.Pose === 'undefined') {
            console.error('[usePoseDetector] MediaPipe Pose not loaded via CDN');
            setStatus('error');
            return;
        }

        setStatus('initializing');

        const pose = new window.Pose({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
            modelComplexity: mobile ? 0 : 1, // 0=lite (fast mobile), 1=full (desktop)
            smoothLandmarks: true,            // MediaPipe built-in temporal smoothing
            enableSegmentation: false,
            minDetectionConfidence: mobile ? 0.5 : 0.6,
            minTrackingConfidence: mobile ? 0.4 : 0.5,
        });

        pose.onResults((results) => {
            isBusyRef.current = false;
            if (results.poseLandmarks) {
                // Apply EMA smoothing on top of MediaPipe smoothing for extra stability
                smoothedLandmarksRef.current = smoothLandmarks(
                    smoothedLandmarksRef.current,
                    results.poseLandmarks,
                    EMA_ALPHA
                );
                setLandmarks([...smoothedLandmarksRef.current]);
                setStatus('detecting');
                setIsReady(true);
            } else {
                setLandmarks(null);
                setStatus('initializing');
            }
        });

        poseRef.current = pose;

        return () => {
            if (poseRef.current) {
                poseRef.current.close();
                poseRef.current = null;
            }
            smoothedLandmarksRef.current = null;
            setIsReady(false);
            setLandmarks(null);
            setStatus('idle');
        };
    }, [isActive, mobile]);

    // ── Throttled detection loop ───────────────────────────────────────────
    const detect = useCallback(() => {
        const now = performance.now();

        if (
            !poseRef.current ||
            !videoRef.current ||
            videoRef.current.readyState < 2 ||
            !isActive ||
            isBusyRef.current ||           // Skip if previous frame still processing
            now - lastRunRef.current < fpsInterval  // Throttle to target FPS
        ) {
            animFrameRef.current = requestAnimationFrame(detect);
            return;
        }

        lastRunRef.current = now;
        isBusyRef.current = true;

        poseRef.current.send({ image: videoRef.current }).catch(() => {
            isBusyRef.current = false; // Reset on error
        });

        animFrameRef.current = requestAnimationFrame(detect);
    }, [videoRef, isActive, fpsInterval]);

    useEffect(() => {
        if (isActive) {
            animFrameRef.current = requestAnimationFrame(detect);
        }
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isActive, detect]);

    return { landmarks, isReady, status };
};

export default usePoseDetector;
