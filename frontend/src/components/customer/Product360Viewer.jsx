import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Product360Viewer — Interactive 360° product rotation viewer.
 * Extracts frames from a video and lets users drag to rotate.
 * Styled to match the Athenic / Klyra theme.
 *
 * Props:
 *   videoUrl    — Cloudinary video URL
 *   productName — Name shown in the viewer header
 *   onClose     — Callback to close the viewer modal
 */

const N_FRAMES = 72; // One frame every 5° → smoother rotation
const VIEWER_SIZE = 640;

const Product360Viewer = ({ videoUrl, productName = 'Product', onClose }) => {
    const canvasRef = useRef(null);
    const stageRef = useRef(null);

    const [state, setState] = useState('loading'); // 'loading' | 'ready'
    const [progress, setProgress] = useState(0);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [speedMs, setSpeedMs] = useState(130);
    const [hintVisible, setHintVisible] = useState(true);

    const framesRef = useRef([]);
    const draggingRef = useRef(false);
    const lastXRef = useRef(0);
    const dragAccumRef = useRef(0);
    const autoTimerRef = useRef(null);
    const currentFrameRef = useRef(0);

    useEffect(() => { currentFrameRef.current = currentFrame; }, [currentFrame]);

    // Draw frame
    const drawFrame = useCallback((index) => {
        const frames = framesRef.current;
        const n = frames.length;
        if (!n) return;
        const i = ((index % n) + n) % n;
        setCurrentFrame(i);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, VIEWER_SIZE, VIEWER_SIZE);
        ctx.drawImage(frames[i], 0, 0, VIEWER_SIZE, VIEWER_SIZE);
    }, []);

    // Extract frames from video
    useEffect(() => {
        if (!videoUrl) return;
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = videoUrl;
        video.load();

        video.addEventListener('loadedmetadata', () => {
            const duration = video.duration;
            const timestamps = Array.from({ length: N_FRAMES }, (_, i) => (i / N_FRAMES) * duration);
            const side = Math.max(video.videoWidth, video.videoHeight) || 720;
            const extractCanvas = document.createElement('canvas');
            extractCanvas.width = side;
            extractCanvas.height = side;
            const eCtx = extractCanvas.getContext('2d', { willReadFrequently: true });
            let idx = 0;
            const frames = [];

            const onSeeked = () => {
                const vw = video.videoWidth, vh = video.videoHeight;
                const s = Math.min(vw, vh);
                eCtx.clearRect(0, 0, side, side);
                eCtx.drawImage(video, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, side, side);
                const offC = document.createElement('canvas');
                offC.width = side;
                offC.height = side;
                offC.getContext('2d').drawImage(extractCanvas, 0, 0);
                frames.push(offC);
                idx++;
                setProgress(Math.round((idx / N_FRAMES) * 100));
                if (idx < timestamps.length) {
                    video.currentTime = timestamps[idx];
                } else {
                    video.removeEventListener('seeked', onSeeked);
                    framesRef.current = frames;
                    setState('ready');
                    drawFrame(0);
                    startAutoplay();
                }
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = timestamps[0];
        }, { once: true });

        return () => {
            stopAutoplay();
            video.src = '';
        };
    }, [videoUrl, drawFrame]);

    // Autoplay
    const startAutoplay = useCallback(() => {
        setIsSpinning(true);
        if (autoTimerRef.current) clearInterval(autoTimerRef.current);
        autoTimerRef.current = setInterval(() => {
            drawFrame(currentFrameRef.current + 1);
        }, speedMs);
    }, [speedMs, drawFrame]);

    const stopAutoplay = useCallback(() => {
        if (autoTimerRef.current) { clearInterval(autoTimerRef.current); autoTimerRef.current = null; }
        setIsSpinning(false);
    }, []);

    useEffect(() => { if (isSpinning) startAutoplay(); }, [speedMs]);
    useEffect(() => () => stopAutoplay(), [stopAutoplay]);

    // Drag
    const pixelsPerFrame = useCallback(() => {
        const w = stageRef.current?.getBoundingClientRect().width || 480;
        return Math.max(3, w / N_FRAMES);
    }, []);

    const handleDragStart = useCallback((x) => {
        draggingRef.current = true; lastXRef.current = x; dragAccumRef.current = 0;
        if (autoTimerRef.current) stopAutoplay();
        setHintVisible(false);
    }, [stopAutoplay]);

    const handleDragMove = useCallback((x) => {
        if (!draggingRef.current) return;
        dragAccumRef.current += x - lastXRef.current;
        lastXRef.current = x;
        const p = pixelsPerFrame();
        if (Math.abs(dragAccumRef.current) >= p) {
            const steps = Math.trunc(dragAccumRef.current / p);
            drawFrame(currentFrameRef.current + steps);
            dragAccumRef.current -= steps * p;
        }
    }, [drawFrame, pixelsPerFrame]);

    const handleDragEnd = useCallback(() => { draggingRef.current = false; }, []);

    const onPointerDown = useCallback((e) => { if (e.pointerType === 'touch') return; handleDragStart(e.clientX); stageRef.current?.setPointerCapture(e.pointerId); }, [handleDragStart]);
    const onPointerMove = useCallback((e) => { if (e.pointerType !== 'touch') handleDragMove(e.clientX); }, [handleDragMove]);
    const onPointerUp = useCallback((e) => { if (e.pointerType !== 'touch') handleDragEnd(); }, [handleDragEnd]);
    const onTouchStart = useCallback((e) => { e.preventDefault(); handleDragStart(e.touches[0].clientX); }, [handleDragStart]);
    const onTouchMove = useCallback((e) => { e.preventDefault(); handleDragMove(e.touches[0].clientX); }, [handleDragMove]);
    const onTouchEnd = useCallback((e) => { e.preventDefault(); handleDragEnd(); }, [handleDragEnd]);

    const frameLabel = `${String(currentFrame + 1).padStart(2, '0')} / ${String(N_FRAMES).padStart(2, '0')}`;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
            style={{ background: 'rgba(42,26,31,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-[600px] flex flex-col bg-white border border-[var(--athenic-gold)] shadow-2xl overflow-hidden"
                style={{ animation: 'viewer360SlideUp 0.35s ease-out' }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-mehron)]"
                    style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--mehron-soft) 100%)' }}>
                    <div>
                        <h2 className="text-lg font-serif tracking-[0.12em] text-[var(--mehron)] uppercase leading-tight">
                            {productName}
                        </h2>
                        <p className="text-[9px] font-serif tracking-[0.3em] text-[var(--gold)] uppercase mt-0.5 flex items-center gap-1.5">
                            <span>✦</span> 360° Interactive View <span>✦</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {state === 'ready' && (
                            <span className="text-[10px] font-serif tracking-[0.15em] text-[var(--muted)] uppercase">
                                {frameLabel}
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center border border-[var(--border-mehron)] text-[var(--muted)] hover:border-[var(--mehron)] hover:text-[var(--mehron)] hover:bg-[var(--mehron-soft)] text-sm font-serif"
                        >✕</button>
                    </div>
                </div>

                {/* ── Stage ── */}
                <div
                    ref={stageRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onTouchCancel={onTouchEnd}
                    className="relative w-full overflow-hidden"
                    style={{
                        aspectRatio: '1/1',
                        cursor: draggingRef.current ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        touchAction: 'none',
                        background: `
                            radial-gradient(ellipse 70% 35% at 50% 100%, rgba(201,168,76,0.06) 0%, transparent 70%),
                            radial-gradient(ellipse 120% 120% at 50% 40%, #faf6f0 0%, #f5efe6 40%, #ebe3d5 100%)`,
                    }}
                >
                    {/* Decorative gold corner accents */}
                    <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[var(--gold)] opacity-30 z-10 pointer-events-none" />
                    <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[var(--gold)] opacity-30 z-10 pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[var(--gold)] opacity-30 z-10 pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[var(--gold)] opacity-30 z-10 pointer-events-none" />

                    {/* Soft vignette */}
                    <div className="absolute inset-0 z-[2] pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(42,26,31,0.06) 100%)' }} />

                    {/* Subtle floor reflection */}
                    <div className="absolute bottom-0 left-0 right-0 h-[25%] z-[1] pointer-events-none"
                        style={{ background: 'linear-gradient(to top, rgba(235,227,213,0.8) 0%, transparent 100%)' }} />

                    {/* Loading overlay */}
                    {state === 'loading' && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-[var(--cream)]">
                            {/* Animated ring */}
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-2 border-[var(--gold-pale)]" />
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--gold)] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-serif text-[var(--mehron)] tracking-wider">{progress}%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-serif italic text-[var(--mehron)] tracking-wide">
                                    Preparing your view…
                                </p>
                                <p className="text-[9px] font-serif text-[var(--muted)] tracking-[0.2em] uppercase mt-1">
                                    Extracting {N_FRAMES} angles
                                </p>
                            </div>
                            {/* Progress bar */}
                            <div className="w-3/5 h-[2px] bg-[var(--gold-pale)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--gold)] rounded-full"
                                    style={{ width: `${progress}%`, transition: 'width 0.15s ease' }} />
                            </div>
                        </div>
                    )}

                    {/* Canvas */}
                    <canvas
                        ref={canvasRef}
                        width={VIEWER_SIZE}
                        height={VIEWER_SIZE}
                        style={{
                            width: '100%', height: '100%', display: 'block',
                            pointerEvents: 'none', position: 'relative', zIndex: 0,
                            opacity: state === 'ready' ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                        }}
                    />

                    {/* Drag hint */}
                    {state === 'ready' && hintVisible && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 pointer-events-none"
                            style={{ animation: 'hintPulse 2s ease-in-out infinite' }}>
                            <div className="w-6 h-[1px]" style={{ background: 'linear-gradient(to right, transparent, var(--gold))' }} />
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-[var(--gold)] border-opacity-30">
                                <span className="text-[var(--gold)] text-xs">☜</span>
                                <span className="text-[8px] font-serif tracking-[0.25em] text-[var(--mehron)] uppercase">
                                    Drag to Rotate
                                </span>
                                <span className="text-[var(--gold)] text-xs">☞</span>
                            </div>
                            <div className="w-6 h-[1px]" style={{ background: 'linear-gradient(to left, transparent, var(--gold))' }} />
                        </div>
                    )}
                </div>

                {/* ── Controls ── */}
                {state === 'ready' && (
                    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--border-mehron)] bg-[var(--cream)] flex-wrap">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { stopAutoplay(); drawFrame(0); }}
                                className="px-3 py-1.5 text-[9px] font-serif tracking-[0.15em] uppercase border border-[var(--border-mehron)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--mehron)] hover:bg-[var(--gold-pale)] transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => isSpinning ? stopAutoplay() : startAutoplay()}
                                className={`px-3 py-1.5 text-[9px] font-serif tracking-[0.15em] uppercase border transition-all ${isSpinning
                                    ? 'bg-[var(--mehron)] border-[var(--mehron)] text-white'
                                    : 'border-[var(--border-mehron)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--mehron)] hover:bg-[var(--gold-pale)]'
                                    }`}
                            >
                                {isSpinning ? '⏸ Pause' : '▶ Spin'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 flex-1 min-w-[100px] max-w-[200px]">
                            <span className="text-[8px] font-serif tracking-[0.15em] text-[var(--muted)] uppercase whitespace-nowrap">Speed</span>
                            <input
                                type="range"
                                min="40" max="300" value={speedMs} step="10"
                                onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
                                className="viewer360-range flex-1 h-[2px] appearance-none bg-[var(--gold-pale)] outline-none cursor-pointer rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* ── Footer accent ── */}
                <div className="h-[3px] w-full" style={{ background: 'linear-gradient(to right, var(--mehron), var(--gold), var(--mehron))' }} />
            </div>

            {/* Keyframe animations + range slider styles */}
            <style>{`
                @keyframes viewer360SlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes hintPulse {
                    0%, 100% { opacity: 0.9; }
                    50% { opacity: 0.4; }
                }
                .viewer360-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 12px; height: 12px; border-radius: 50%;
                    background: var(--gold);
                    border: 2px solid white;
                    box-shadow: 0 1px 4px rgba(201,168,76,0.4);
                    cursor: pointer;
                }
                .viewer360-range::-moz-range-thumb {
                    width: 12px; height: 12px; border: 2px solid white; border-radius: 50%;
                    background: var(--gold);
                    box-shadow: 0 1px 4px rgba(201,168,76,0.4);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Product360Viewer;
