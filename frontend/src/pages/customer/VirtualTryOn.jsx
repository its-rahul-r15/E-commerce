/**
 * VirtualTryOn.jsx
 * Main Virtual Try-On Studio page.
 * Assembles CameraFeed, ClothRenderer, usePoseDetector and ProductSelector
 * into a premium UI matching the Klyra athenic design system.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cartService, productService } from '../../services/api';
import CameraFeed from '../../components/tryon/CameraFeed';
import ClothRenderer from '../../components/tryon/ClothRenderer';
import ProductSelector from '../../components/tryon/ProductSelector';
import usePoseDetector from '../../components/tryon/usePoseDetector';

const VirtualTryOn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const urlProductId = searchParams.get('product');

    // Refs for camera / canvas
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // State
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [cameraDenied, setCameraDenied] = useState(false);

    // Auto-select product from URL ?product= param
    useEffect(() => {
        if (!urlProductId || selectedProduct) return;
        productService.getProductById(urlProductId)
            .then(d => setSelectedProduct(d.product))
            .catch(() => { });
    }, [urlProductId]);

    // Pose landmarks from MediaPipe
    const { landmarks, isReady, status } = usePoseDetector(videoRef, isCameraActive);

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleStartCamera = async () => {
        setCameraError(null);
        setCameraDenied(false);
        // Check browser support
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Your browser does not support camera access.');
            return;
        }
        try {
            // Quick permission check before activating
            await navigator.mediaDevices.getUserMedia({ video: true });
            setIsCameraActive(true);
        } catch (err) {
            const msg =
                err.name === 'NotAllowedError'
                    ? 'Camera permission denied. Please allow camera access in your browser settings.'
                    : err.name === 'NotFoundError'
                        ? 'No camera found on this device.'
                        : 'Unable to access camera. Please try again.';
            setCameraError(msg);
            if (err.name === 'NotAllowedError') setCameraDenied(true);
        }
    };

    const handleStopCamera = useCallback(() => {
        setIsCameraActive(false);
        setCapturedImage(null);
    }, []);

    const handleScreenshot = useCallback(() => {
        if (!canvasRef.current) return;
        // Get PNG data URL from canvas (already has clothing overlay drawn on it)
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setCapturedImage(dataUrl);
        // Trigger download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `klyra-tryon-${Date.now()}.png`;
        link.click();
    }, []);

    const handleAddToCart = async () => {
        if (!selectedProduct) {
            alert('Please select a garment first!');
            return;
        }
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        setAddingToCart(true);
        try {
            await cartService.addToCart(selectedProduct._id, 1);
            alert(`✨ "${selectedProduct.name}" added to your wardrobe!`);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

    // Status badge config
    const statusConfig = {
        idle: { label: 'Camera Off', color: 'bg-gray-400' },
        initializing: { label: 'Loading AI...', color: 'bg-yellow-400 animate-pulse' },
        detecting: { label: 'Pose Detected ✓', color: 'bg-emerald-500' },
        error: { label: 'AI Unavailable', color: 'bg-red-500' },
    };
    const currentStatus = statusConfig[status] || statusConfig.idle;

    return (
        <div className="min-h-screen bg-[var(--athenic-bg)]">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-[var(--mehron-deep)] to-[var(--mehron)] py-10 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-[var(--gold-pale)] text-[9px] tracking-[0.5em] font-serif uppercase mb-3 opacity-70">
                        Klyra AR Studio
                    </p>
                    <h1 className="text-3xl md:text-5xl font-serif tracking-[0.1em] text-white uppercase">
                        Virtual Try-On
                    </h1>
                    <div className="w-16 h-[1px] bg-[var(--athenic-gold)] mx-auto mt-4 mb-4" />
                    <p className="text-[var(--gold-pale)] text-[11px] font-serif italic tracking-wide opacity-80">
                        Experience garments on your body — in real time, powered by AI
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* ── Error Banner ──────────────────────────────────────────────── */}
                {cameraError && (
                    <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 text-xs font-serif tracking-wide flex items-start space-x-3">
                        <span className="text-lg">⚠️</span>
                        <span>{cameraError}</span>
                    </div>
                )}

                {/* ── Main Layout: Camera + Controls ───────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* Camera Feed (2/3 width on desktop) */}
                    <div className="lg:col-span-2">
                        <CameraFeed
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                            isActive={isCameraActive}
                        />
                        {/* ClothRenderer is logic-only, no DOM */}
                        {isCameraActive && (
                            <ClothRenderer
                                canvasRef={canvasRef}
                                videoRef={videoRef}
                                landmarks={landmarks}
                                product={selectedProduct}
                            />
                        )}
                    </div>

                    {/* Controls Panel (1/3 width on desktop) */}
                    <div className="lg:col-span-1 flex flex-col space-y-4">

                        {/* Status Card */}
                        <div className="bg-white border border-[var(--athenic-gold)] border-opacity-30 p-5">
                            <h3 className="font-serif text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-4">
                                Studio Status
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-serif text-gray-500 uppercase tracking-widest">Camera</span>
                                    <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-serif text-gray-500 uppercase tracking-widest">Pose AI</span>
                                    <span className={`w-2 h-2 rounded-full ${currentStatus.color}`} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-serif text-gray-500 uppercase tracking-widest">Overlay</span>
                                    <span className={`w-2 h-2 rounded-full ${selectedProduct ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100">
                                <p className="text-[9px] font-serif text-gray-400 tracking-widest uppercase">
                                    {!isCameraActive
                                        ? 'Click "Try On" to begin'
                                        : status === 'initializing'
                                            ? 'Loading pose detection AI...'
                                            : status === 'detecting'
                                                ? 'Tracking your pose — move freely!'
                                                : status === 'error'
                                                    ? 'Pose detection unavailable'
                                                    : 'Stand in front of the camera'}
                                </p>
                            </div>
                            {/* MediaPipe credit */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-[7px] font-serif text-gray-300 tracking-widest uppercase text-center">
                                    Powered by MediaPipe AI · Google
                                </p>
                            </div>
                        </div>

                        {/* Selected Product Info */}
                        {selectedProduct && (
                            <div className="bg-white border border-[var(--athenic-gold)] border-opacity-30 p-5">
                                <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest mb-2">
                                    Currently trying
                                </p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-14 bg-gray-50 overflow-hidden flex-shrink-0">
                                        {selectedProduct.images?.[0] ? (
                                            <img
                                                src={selectedProduct.images[0]}
                                                alt={selectedProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-serif text-[var(--athenic-blue)] font-semibold leading-tight">
                                            {selectedProduct.name}
                                        </p>
                                        <p className="text-[10px] font-serif text-[var(--athenic-gold)] mt-1">
                                            ₹{(selectedProduct.discountedPrice || selectedProduct.price)?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Size Confidence Panel */}
                        {selectedProduct && selectedProduct.sizes?.length > 0 && (
                            <div className="bg-white border border-[var(--athenic-gold)] border-opacity-30 p-5">
                                <h3 className="font-serif text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-3">
                                    📏 Size Guide
                                </h3>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {selectedProduct.sizes.map(size => (
                                        <span key={size} className="text-[8px] font-serif tracking-widest uppercase px-2 py-1 border border-[var(--athenic-gold)] border-opacity-40 text-[var(--athenic-gold)]">
                                            {size}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[8px] font-serif text-gray-400 tracking-widest uppercase leading-relaxed">
                                    Select your size when adding to cart. Fits vary — check measurements on the product page.
                                </p>
                                <button
                                    onClick={() => navigate(`/product/${selectedProduct._id}`)}
                                    className="mt-3 w-full text-[8px] font-serif uppercase tracking-widest text-[var(--athenic-gold)] border border-[var(--athenic-gold)] border-opacity-40 py-2 hover:bg-[var(--athenic-gold)] hover:text-white transition-all"
                                >
                                    Full Size Chart →
                                </button>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-white border border-[var(--athenic-gold)] border-opacity-30 p-5">
                            <h3 className="font-serif text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-3">
                                How To Use
                            </h3>
                            <ol className="space-y-2">
                                {[
                                    '1. Click "Try On" to open camera',
                                    '2. Allow camera permission',
                                    '3. Select a garment below',
                                    '4. Stand ~2m from camera',
                                    '5. See the magic! 📷',
                                ].map((step) => (
                                    <li key={step} className="text-[9px] font-serif text-gray-400 tracking-widest uppercase flex items-start space-x-2">
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>

                {/* ── Action Buttons ────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {/* Try On / Stop Camera */}
                    {!isCameraActive ? (
                        <button
                            onClick={handleStartCamera}
                            className="col-span-2 sm:col-span-1 btn-athenic-gold py-4 text-[10px] tracking-[0.25em] uppercase flex items-center justify-center space-x-2"
                        >
                            <span>📷</span>
                            <span>Try On</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleStopCamera}
                            className="col-span-2 sm:col-span-1 py-4 bg-gray-800 text-white text-[10px] tracking-[0.25em] uppercase flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors"
                        >
                            <span>⏹</span>
                            <span>Stop Camera</span>
                        </button>
                    )}

                    {/* Screenshot */}
                    <button
                        onClick={handleScreenshot}
                        disabled={!isCameraActive}
                        className="py-4 btn-athenic-outline text-[10px] tracking-[0.25em] uppercase flex items-center justify-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <span>🖼️</span>
                        <span>Screenshot</span>
                    </button>

                    {/* View Product */}
                    <button
                        onClick={() => selectedProduct && navigate(`/product/${selectedProduct._id}`)}
                        disabled={!selectedProduct}
                        className="py-4 btn-athenic-outline text-[10px] tracking-[0.25em] uppercase flex items-center justify-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <span>👁</span>
                        <span>View Details</span>
                    </button>

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || !selectedProduct}
                        className="py-4 btn-athenic-primary text-[10px] tracking-[0.25em] uppercase flex items-center justify-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <span>🛒</span>
                        <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                    </button>
                </div>

                {/* ── Product Selector ─────────────────────────────────────────── */}
                <div className="border border-[var(--athenic-gold)] border-opacity-20">
                    <ProductSelector
                        selectedProduct={selectedProduct}
                        onSelect={setSelectedProduct}
                    />
                </div>

                {/* ── Camera Denied Fallback / Tips Banner ─────────────────── */}
                {cameraDenied && !isCameraActive ? (
                    <div className="mt-6 p-6 border border-[var(--athenic-gold)] border-opacity-30 bg-white">
                        <div className="flex items-start space-x-4">
                            <span className="text-3xl flex-shrink-0">👗</span>
                            <div className="flex-1">
                                <h3 className="font-serif text-[10px] tracking-[0.25em] uppercase text-[var(--athenic-blue)] mb-2">
                                    Garment Preview (Static)
                                </h3>
                                <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest leading-relaxed mb-4">
                                    Camera access was denied. Allow camera in browser settings and refresh to use Live AR. You can still browse and view garments below.
                                </p>
                                {selectedProduct && (
                                    <div className="flex space-x-3">
                                        {selectedProduct.images?.slice(0, 2).map((img, i) => (
                                            <img key={i} src={img} alt={`View ${i + 1}`} className="w-24 h-32 object-cover border border-[var(--athenic-gold)] border-opacity-30" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-5 bg-[var(--ivory)] border border-[var(--athenic-gold)] border-opacity-20">
                        <p className="text-[9px] font-serif uppercase tracking-widest text-center text-[var(--athenic-gold)]">
                            ✨ Pro Tip: Ensure good lighting and stand in front of a plain background for best results
                        </p>
                    </div>
                )}
            </div>

            {/* ── Screenshot Preview Modal ──────────────────────────────────── */}
            {capturedImage && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-[var(--athenic-gold)] p-6 max-w-sm w-full shadow-2xl">
                        <h2 className="text-sm font-serif uppercase tracking-widest text-[var(--athenic-blue)] text-center mb-4">
                            Screenshot Saved
                        </h2>
                        <img src={capturedImage} alt="Try-on result" className="w-full rounded-sm mb-4" />
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setCapturedImage(null)}
                                className="py-3 border border-gray-200 text-[9px] font-serif uppercase tracking-widest hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <a
                                href={capturedImage}
                                download={`klyra-tryon-${Date.now()}.png`}
                                className="py-3 bg-[var(--athenic-gold)] text-white text-[9px] font-serif uppercase tracking-widest text-center flex items-center justify-center"
                            >
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Login Prompt Modal ────────────────────────────────────────── */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-[var(--athenic-gold)] p-10 max-w-sm w-full text-center shadow-2xl">
                        <span className="text-4xl mb-4 block">🏛️</span>
                        <h2 className="text-xl font-serif tracking-widest text-[var(--athenic-blue)] mb-4 uppercase">
                            Login Required
                        </h2>
                        <p className="text-[10px] font-serif text-gray-500 uppercase tracking-widest mb-8 leading-loose">
                            Join Klyra to save your look and add to your wardrobe.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="py-3 border border-gray-100 text-[9px] font-serif uppercase tracking-widest hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="py-3 bg-[var(--athenic-blue)] text-white text-[9px] font-serif uppercase tracking-widest hover:opacity-90"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VirtualTryOn;
