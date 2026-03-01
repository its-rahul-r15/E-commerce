/**
 * ImageZoomModal.jsx
 * Full-screen high-resolution image viewer with:
 *  - Scroll / pinch to zoom
 *  - Multi-angle thumbnail strip
 *  - Keyboard navigation (← → Esc)
 *  - Fabric detail badge overlays
 *  - Smooth animations matching Klyra design system
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const FABRIC_TAGS = [
    'Embroidery Detail',
    'Neckline View',
    'Fabric Texture',
    'Sleeve Finish',
    'Hemline Detail',
];

const ImageZoomModal = ({ images = [], initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
    const containerRef = useRef(null);

    const MIN_SCALE = 1;
    const MAX_SCALE = 4;

    // ── Keyboard navigation ───────────────────────────────────────────────────
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        // Prevent body scroll while modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [currentIndex]);

    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const goNext = useCallback(() => {
        setCurrentIndex(i => (i + 1) % images.length);
        resetZoom();
    }, [images.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex(i => (i - 1 + images.length) % images.length);
        resetZoom();
    }, [images.length]);

    const handleThumbnailClick = (idx) => {
        setCurrentIndex(idx);
        resetZoom();
    };

    // ── Scroll to zoom ────────────────────────────────────────────────────────
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        setScale(s => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)));
    };

    // ── Drag to pan (when zoomed) ─────────────────────────────────────────────
    const handleMouseDown = (e) => {
        if (scale <= 1) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPosition({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleDoubleClick = () => {
        if (scale > 1) resetZoom();
        else setScale(2.5);
    };

    if (!images.length) return null;

    const currentImage = images[currentIndex];
    const fabricTag = FABRIC_TAGS[currentIndex % FABRIC_TAGS.length];

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: 'rgba(10, 10, 14, 0.97)' }}
        >
            {/* ── Top Bar ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(197,165,95,0.2)' }}>
                <div className="flex items-center space-x-4">
                    <span className="text-[9px] font-serif tracking-[0.4em] text-[var(--athenic-gold)] uppercase opacity-70">
                        Klyra Studio
                    </span>
                    <span className="text-[9px] font-serif tracking-[0.3em] text-white uppercase opacity-40">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>
                <div className="flex items-center space-x-6">
                    <span className="text-[9px] font-serif text-white opacity-40 tracking-widest hidden sm:block">
                        Scroll to zoom · Drag to pan · Double-click to reset
                    </span>
                    {/* Zoom indicator */}
                    <span className="text-[10px] font-mono text-[var(--athenic-gold)] opacity-70">
                        {(scale * 100).toFixed(0)}%
                    </span>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-white opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* ── Main Image Area ───────────────────────────────────────────── */}
            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden flex items-center justify-center"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
            >
                <img
                    src={currentImage}
                    alt={`Product angle ${currentIndex + 1}`}
                    draggable={false}
                    onDoubleClick={handleDoubleClick}
                    style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease',
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                />

                {/* Fabric detail badge */}
                <div
                    className="absolute bottom-8 left-8 pointer-events-none"
                    style={{ opacity: scale > 1.5 ? 1 : 0.7, transition: 'opacity 0.3s' }}
                >
                    <span
                        className="text-[8px] font-serif tracking-[0.35em] uppercase px-3 py-1.5"
                        style={{
                            background: 'rgba(197,165,95,0.15)',
                            border: '1px solid rgba(197,165,95,0.4)',
                            color: 'var(--athenic-gold)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        {fabricTag}
                    </span>
                </div>

                {/* Prev / Next arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white opacity-50 hover:opacity-100 transition-opacity text-xl"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                        >
                            ‹
                        </button>
                        <button
                            onClick={goNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white opacity-50 hover:opacity-100 transition-opacity text-xl"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* ── Thumbnail Strip ───────────────────────────────────────────── */}
            {images.length > 1 && (
                <div
                    className="flex-shrink-0 flex items-center justify-center space-x-3 px-6 py-4 overflow-x-auto"
                    style={{ borderTop: '1px solid rgba(197,165,95,0.15)' }}
                >
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleThumbnailClick(idx)}
                            className="flex-shrink-0 transition-all duration-200"
                            style={{
                                width: '52px',
                                height: '62px',
                                border: idx === currentIndex
                                    ? '1.5px solid var(--athenic-gold)'
                                    : '1.5px solid rgba(255,255,255,0.12)',
                                opacity: idx === currentIndex ? 1 : 0.45,
                                transform: idx === currentIndex ? 'scale(1.08)' : 'scale(1)',
                                overflow: 'hidden',
                            }}
                        >
                            <img
                                src={img}
                                alt={`Angle ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* ── Zoom hint fade ────────────────────────────────────────────── */}
            {scale === 1 && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 pointer-events-none">
                    <p className="text-[8px] font-serif tracking-widest uppercase text-white opacity-30 text-center">
                        Scroll to zoom · Click angles below to switch view
                    </p>
                </div>
            )}
        </div>
    );
};

export default ImageZoomModal;
