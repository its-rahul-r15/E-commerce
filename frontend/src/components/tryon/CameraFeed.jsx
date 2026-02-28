/**
 * CameraFeed.jsx — Optimized camera + canvas setup
 *
 * Key improvements:
 *  - Mobile: requests 640x480 instead of 1280x720 (lower GPU/CPU load)
 *  - Removed CSS scaleX(-1) from canvas — mirroring is done in ClothRenderer
 *    via ctx.scale(-1,1) to avoid double-mirror artifacts
 *  - Canvas does NOT transform — only the hidden video has CSS mirror for debugging
 */
import { useEffect, useRef } from 'react';

const isMobile = () =>
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

const CameraFeed = ({ videoRef, canvasRef, isActive }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isActive || !videoRef.current) return;

        let stream = null;
        const mobile = isMobile();

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        // Lower resolution on mobile → less GPU work, less lag
                        width: { ideal: mobile ? 640 : 1280 },
                        height: { ideal: mobile ? 480 : 720 },
                        facingMode: 'user',
                        frameRate: { ideal: mobile ? 24 : 30 },
                    },
                    audio: false,
                });
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            } catch (err) {
                console.error('[CameraFeed] Camera error:', err);
            }
        };

        startCamera();

        return () => {
            if (stream) stream.getTracks().forEach((t) => t.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
        };
    }, [isActive, videoRef]);

    return (
        <div
            ref={containerRef}
            className="relative w-full rounded-none overflow-hidden bg-black"
            style={{ aspectRatio: '4/3', maxHeight: '75vh' }}
        >
            {/* Hidden video — feeds ClothRenderer canvas */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
                playsInline
                muted
            />

            {/* Canvas — ClothRenderer draws mirrored video + overlay here */}
            {/* NOTE: No CSS scaleX(-1) here — mirroring is done inside ctx.scale(-1,1) */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Inactive placeholder */}
            {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--mehron-deep)] to-[var(--charcoal)]">
                    <div className="w-24 h-24 rounded-full border-2 border-[var(--athenic-gold)] border-opacity-30 flex items-center justify-center mb-6">
                        <span className="text-5xl">📷</span>
                    </div>
                    <p className="text-[var(--gold-pale)] font-serif text-sm tracking-widest uppercase opacity-60">
                        Camera Inactive
                    </p>
                </div>
            )}

            {/* LIVE badge */}
            {isActive && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white text-[10px] tracking-widest uppercase font-serif">Live</span>
                </div>
            )}

            {/* Corner brackets */}
            {isActive && (
                <>
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[var(--athenic-gold)] opacity-50" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[var(--athenic-gold)] opacity-50" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[var(--athenic-gold)] opacity-50" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[var(--athenic-gold)] opacity-50" />
                </>
            )}
        </div>
    );
};

export default CameraFeed;
