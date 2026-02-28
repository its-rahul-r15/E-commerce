/**
 * ClothRenderer.jsx — Optimized 2D AR Clothing Overlay
 *
 * Performance & realism improvements:
 *  1. Removed expensive `destination-in` composite (caused transparency bugs + slow)
 *  2. Offscreen pre-baked clothing with soft edges (done once on image load, not every frame)
 *  3. Mobile-aware rendering: reduced shadow blur, skip double-pass on mobile
 *  4. Better torso alignment: neck anchor, hip-aware height, shoulder-width scaling
 *  5. EMA position smoothing: clothing position smoothed separately from landmarks
 *  6. Correct horizontal mirroring: ctx.scale(-1,1) — no double-mirror with CameraFeed
 */
import { useEffect, useRef } from 'react';

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const NOSE = 0;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;

const MIN_VISIBILITY = 0.4;

// Position EMA smoothing (separate from landmark smoothing)
const POS_ALPHA = 0.3;

const isMobile = () => window.innerWidth < 768;

/**
 * Pre-bake: draw clothing onto an OffscreenCanvas with soft edges
 * This is computed ONCE on image load, then reused every frame → huge perf win
 */
const prebakeClothingImage = (img) => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const oc = new OffscreenCanvas(w, h);
    const octx = oc.getContext('2d');

    // Draw image
    octx.drawImage(img, 0, 0, w, h);

    // Soft edge via destination-in + gradient (done once, not per-frame)
    const gx = octx.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, 'rgba(0,0,0,0)');
    gx.addColorStop(0.07, 'rgba(0,0,0,1)');
    gx.addColorStop(0.93, 'rgba(0,0,0,1)');
    gx.addColorStop(1, 'rgba(0,0,0,0)');
    octx.globalCompositeOperation = 'destination-in';
    octx.fillStyle = gx;
    octx.fillRect(0, 0, w, h);

    return oc;
};

const ClothRenderer = ({ canvasRef, videoRef, landmarks, product }) => {
    const clothingImageUrl = product?.tryOnImage || product?.images?.[0] || null;

    const clothImgRef = useRef(null);      // Original Image element
    const bakeRef = useRef(null);          // Pre-baked OffscreenCanvas
    const currentUrlRef = useRef(null);
    const animFrameRef = useRef(null);
    const alphaRef = useRef(0);            // Fade-in alpha

    // Smoothed position state refs
    const posRef = useRef({ x: 0, y: 0, w: 0, h: 0, angle: 0 });
    const posInitRef = useRef(false);

    const mobile = isMobile();

    // ── Load & pre-bake clothing image ──────────────────────────────────────
    useEffect(() => {
        if (!clothingImageUrl) {
            clothImgRef.current = null;
            bakeRef.current = null;
            currentUrlRef.current = null;
            alphaRef.current = 0;
            posInitRef.current = false;
            return;
        }
        if (clothingImageUrl === currentUrlRef.current) return;

        currentUrlRef.current = clothingImageUrl;
        alphaRef.current = 0;
        posInitRef.current = false;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = clothingImageUrl;
        img.onload = () => {
            clothImgRef.current = img;
            // Pre-bake once (OffscreenCanvas with soft edges)
            if (typeof OffscreenCanvas !== 'undefined') {
                bakeRef.current = prebakeClothingImage(img);
            } else {
                bakeRef.current = null; // Fallback: draw img directly
            }
        };
        img.onerror = () => {
            clothImgRef.current = null;
            bakeRef.current = null;
        };
    }, [clothingImageUrl]);

    // ── Render loop ─────────────────────────────────────────────────────────
    useEffect(() => {
        const draw = () => {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            if (!canvas || !video || video.readyState < 2) {
                animFrameRef.current = requestAnimationFrame(draw);
                return;
            }

            const vw = video.videoWidth || 640;
            const vh = video.videoHeight || 480;
            if (canvas.width !== vw) canvas.width = vw;
            if (canvas.height !== vh) canvas.height = vh;

            const ctx = canvas.getContext('2d', { alpha: false });

            // ── Draw mirrored video ───────────────────────────────────────
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -vw, 0, vw, vh);
            ctx.restore();

            // ── Skip overlay if no image or landmarks ─────────────────────
            if (!landmarks || !(clothImgRef.current || bakeRef.current)) {
                alphaRef.current = Math.max(0, alphaRef.current - 0.05);
                animFrameRef.current = requestAnimationFrame(draw);
                return;
            }

            const lm = landmarks;

            // Helper: normalize landmark to pixel coords, mirrored
            const px = (l) => ({ x: (1 - l.x) * vw, y: l.y * vh });

            const ls = px(lm[LEFT_SHOULDER]);
            const rs = px(lm[RIGHT_SHOULDER]);
            const nose = px(lm[NOSE]);
            const lh = px(lm[LEFT_HIP]);
            const rh = px(lm[RIGHT_HIP]);

            if (
                lm[LEFT_SHOULDER].visibility < MIN_VISIBILITY ||
                lm[RIGHT_SHOULDER].visibility < MIN_VISIBILITY
            ) {
                alphaRef.current = Math.max(0, alphaRef.current - 0.05);
                animFrameRef.current = requestAnimationFrame(draw);
                return;
            }

            // ── Geometry ─────────────────────────────────────────────────
            const sMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };

            const hipVisible =
                lm[LEFT_HIP].visibility > 0.3 && lm[RIGHT_HIP].visibility > 0.3;
            const hipMid = hipVisible
                ? { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 }
                : { x: sMid.x, y: sMid.y + vw * 0.28 };

            const torsoH = Math.hypot(hipMid.x - sMid.x, hipMid.y - sMid.y);
            const shoulderW = Math.hypot(rs.x - ls.x, rs.y - ls.y);

            const clothW = shoulderW * 2.15;
            const imgAR = clothImgRef.current.naturalHeight / clothImgRef.current.naturalWidth;
            const clothH = Math.min(clothW * imgAR, torsoH * 1.55);
            const tiltAngle = Math.atan2(rs.y - ls.y, rs.x - ls.x);

            // Neck anchor: between nose and shoulder midpoint
            const anchX = nose.x * 0.35 + sMid.x * 0.65;
            const anchY = nose.y * 0.35 + sMid.y * 0.65;

            // ── EMA position smoothing ────────────────────────────────────
            if (!posInitRef.current) {
                posRef.current = { x: anchX, y: anchY, w: clothW, h: clothH, angle: tiltAngle };
                posInitRef.current = true;
            } else {
                const p = posRef.current;
                const a = POS_ALPHA;
                posRef.current = {
                    x: p.x + a * (anchX - p.x),
                    y: p.y + a * (anchY - p.y),
                    w: p.w + a * (clothW - p.w),
                    h: p.h + a * (clothH - p.h),
                    angle: p.angle + a * (tiltAngle - p.angle),
                };
            }

            const { x, y, w, h, angle } = posRef.current;

            // ── Fade-in ───────────────────────────────────────────────────
            alphaRef.current = Math.min(0.93, alphaRef.current + 0.04);

            // ── Draw clothing ─────────────────────────────────────────────
            const drawSrc = bakeRef.current || clothImgRef.current;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Shadow (lighter on mobile for perf)
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = mobile ? 8 : 16;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 4;

            // Pass 1: multiply blend — fabric integrates with skin color
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = alphaRef.current;
            ctx.drawImage(drawSrc, -w / 2, 0, w, h);

            // Pass 2: source-over at lower alpha — restore color saturation (skip on mobile)
            if (!mobile) {
                ctx.shadowColor = 'transparent';
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = alphaRef.current * 0.5;
                ctx.drawImage(drawSrc, -w / 2, 0, w, h);
            }

            ctx.restore();

            animFrameRef.current = requestAnimationFrame(draw);
        };

        animFrameRef.current = requestAnimationFrame(draw);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [canvasRef, videoRef, landmarks, clothingImageUrl, mobile]);

    return null;
};

export default ClothRenderer;
