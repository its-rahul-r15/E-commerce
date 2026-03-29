import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, cartService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/customer/ProductCard';
import ImageZoomModal from '../../components/customer/ImageZoomModal';
import Product360Viewer from '../../components/customer/Product360Viewer';
import ProductComparison from '../../components/customer/ProductComparison';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [moreFromShop, setMoreFromShop] = useState([]);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(0);
    const [show360, setShow360] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    // Clothing categories that support virtual try-on
    const TRYON_CATEGORIES = ['Kurta', 'Saree', 'Lehenga', 'Salwar Suit', 'Sherwani', 'Dress', 'Top', 'Shirt', 'Jacket', 'Ethnic Wear', 'Western Wear', 'Clothing', 'Fashion'];
    const TAILORING_CATEGORIES = ['Kurta', 'Saree', 'Lehenga', 'Salwar Suit', 'Sherwani', 'Dress', 'Ethnic Wear'];

    // Selected variants
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductById(id);
            setProduct(data.product);

            if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);
            if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);

            // Fetch related products (from same shop + same category)
            fetchRelatedProducts(data.product.shopId?._id, data.product.category);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (shopId, category) => {
        try {
            let related = [];
            const existingIds = new Set([id]);

            const extractProducts = (res) => {
                if (Array.isArray(res?.data)) return res.data;
                if (Array.isArray(res?.data?.products)) return res.data.products;
                if (Array.isArray(res)) return res;
                return [];
            };

            if (shopId) {
                try {
                    const shopData = await productService.getProducts({ shopId: shopId, limit: 10 });
                    const shopProducts = extractProducts(shopData).filter(p => !existingIds.has(p._id));
                    shopProducts.forEach(p => existingIds.add(p._id));
                    related = [...related, ...shopProducts];
                } catch { /* ignore */ }
            }

            if (related.length < 5 && category) {
                try {
                    const catData = await productService.getProducts({ category: category, limit: 10 });
                    const catProducts = extractProducts(catData).filter(p => !existingIds.has(p._id));
                    catProducts.forEach(p => existingIds.add(p._id));
                    related = [...related, ...catProducts];
                } catch { /* ignore */ }
            }

            if (related.length < 5) {
                try {
                    const allData = await productService.getProducts({ limit: 10 });
                    const allProducts = extractProducts(allData).filter(p => !existingIds.has(p._id));
                    related = [...related, ...allProducts];
                } catch { 
                    console.log(error)
                 }
            }

            setMoreFromShop(related.slice(0, 5));
        } catch (error) {
            console.error('Error fetching related products:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        setAddingToCart(true);
        try {
            await cartService.addToCart(id, quantity);
            alert('Added to your wardrobe successfully!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            await cartService.addToCart(id, quantity);
            navigate('/cart');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to process request');
        }
    };

    const handlePincodeCheck = () => {
        if (!pincode || pincode.length !== 6) {
            setPincodeMessage('Please enter a valid 6-digit pincode');
            return;
        }
        setPincodeMessage(`Delivery available to ${pincode}. Expected by ${new Date(Date.now() + (product?.dispatchDays || 3) * 86400000 + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--athenic-bg)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--athenic-gold)] border-t-transparent"></div>
        </div>
    );

    if (!product) return null;

    const price = product.discountedPrice || product.price;
    const originalPrice = product.discountedPrice ? product.price : null;
    const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen bg-[var(--athenic-bg)] selection:bg-[var(--athenic-gold)] selection:text-white pb-20 pt-10">
            <div className="max-w-7xl mx-auto px-4">
                {/* Modern Breadcrumb */}
                <nav className="flex items-center text-[10px] font-serif tracking-[0.3em] text-gray-400 mb-10 uppercase">
                    <span onClick={() => navigate('/')} className="cursor-pointer hover:text-[var(--athenic-gold)]">Collections</span>
                    <span className="mx-3 opacity-30">/</span>
                    <span className="cursor-pointer hover:text-[var(--athenic-gold)]">{product.category || 'Athenic Wear'}</span>
                    <span className="mx-3 opacity-30">/</span>
                    <span className="text-[var(--athenic-blue)] font-bold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-32">

                    {/* Left: Statuesque Gallery (Col 1-5) */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Main Image — hover to zoom like Amazon */}
                        <div
                            className="relative aspect-[3/4] overflow-hidden bg-white border border-[var(--athenic-gold)] border-opacity-10 shadow-lg group cursor-crosshair"
                            onClick={() => { setZoomIndex(selectedImage); setZoomOpen(true); }}
                            onMouseMove={(e) => {
                                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                                const x = ((e.clientX - left) / width) * 100;
                                const y = ((e.clientY - top) / height) * 100;
                                const img = e.currentTarget.querySelector('img.zoom-image');
                                if (img) {
                                    img.style.transformOrigin = `${x}% ${y}%`;
                                    img.style.transform = 'scale(2.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                const img = e.currentTarget.querySelector('img.zoom-image');
                                if (img) {
                                    img.style.transformOrigin = 'center center';
                                    img.style.transform = '';
                                }
                            }}
                        >
                            <img
                                src={product.images?.[selectedImage] || '/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 zoom-image group-hover:scale-105"
                            />
                            {/* Zoom badge */}
                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1.5 px-3 py-1.5 pointer-events-none"
                                style={{ background: 'rgba(10,10,14,0.65)', backdropFilter: 'blur(6px)', border: '1px solid rgba(197,165,95,0.35)' }}>
                                <span className="text-[var(--athenic-gold)] text-xs">🔍</span>
                                <span className="text-[8px] font-serif tracking-[0.3em] text-white uppercase">Zoom</span>
                            </div>
                            {originalPrice && (
                                <div className="absolute top-6 right-6 bg-[#E5C369] text-[var(--athenic-blue)] px-4 py-2 font-serif text-[10px] tracking-widest uppercase shadow-md animate-pulse pointer-events-none">
                                    Gold tier 15% off
                                </div>
                            )}
                        </div>

                        {/* Secondary Gallery — all images as clickable angle thumbnails */}
                        <div className="grid grid-cols-3 gap-4">
                            {(product.images || []).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setSelectedImage(idx); }}
                                    onDoubleClick={() => { setZoomIndex(idx); setZoomOpen(true); }}
                                    className={`relative aspect-square overflow-hidden bg-white shadow-sm transition-all hover:shadow-md focus:outline-none ${selectedImage === idx
                                        ? 'border-2 border-[var(--athenic-gold)]'
                                        : 'border border-[var(--athenic-gold)] border-opacity-20 hover:border-opacity-60'
                                        }`}
                                >
                                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                    <p className="absolute bottom-2 left-2 text-[7px] font-serif uppercase tracking-widest text-white mix-blend-difference italic">
                                        {['Front', 'Detail', 'Side', 'Back', 'Close-up'][idx] || `View ${idx + 1}`}
                                    </p>
                                </button>
                            ))}

                            {/* 360° View Thumbnail — shown when product has a 360° video */}
                            {product.video360 && (
                                <button
                                    onClick={() => setShow360(true)}
                                    className="relative aspect-square overflow-hidden bg-[#0a0a0e] shadow-sm transition-all hover:shadow-lg focus:outline-none border-2 border-[var(--athenic-gold)] border-opacity-40 hover:border-opacity-100 group"
                                >
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                                        <div className="w-10 h-10 rounded-full border border-[var(--athenic-gold)] flex items-center justify-center text-[var(--athenic-gold)] text-lg bg-black/40 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                            🔄
                                        </div>
                                        <p className="text-[8px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-gold)] opacity-80 group-hover:opacity-100">
                                            360° View
                                        </p>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                </button>
                            )}
                        </div>

                        {/* Open full gallery hint */}
                        {(product.images?.length || 0) > 1 && (
                            <button
                                onClick={() => { setZoomIndex(0); setZoomOpen(true); }}
                                className="w-full text-[8px] font-serif tracking-[0.35em] uppercase text-[var(--athenic-gold)] opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 py-2"
                            >
                                <span>🖼</span>
                                <span>View All {product.images.length} Images in Full-Screen</span>
                            </button>
                        )}
                    </div>

                    {/* Right: Product Info (Col 6-12) */}
                    <div className="lg:col-span-7 lg:sticky lg:top-32 lg:pl-10">
                        <div className="mb-12">
                            <h1 className="text-5xl md:text-6xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] mb-6 uppercase leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline space-x-4 mb-4">
                                <span className="text-3xl font-serif text-[var(--athenic-blue)] tracking-wider">
                                    ₹{price.toLocaleString()}
                                </span>
                                {originalPrice && (
                                    <span className="text-lg text-gray-300 line-through font-serif italic">
                                        ₹{originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs font-serif italic text-gray-500 leading-relaxed tracking-wide max-w-md">
                                "{product.description || 'Hand-woven silk, meticulously pleated in Athens for the modern goddess.'}"
                            </p>
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-10 mb-12">
                            {/* Colors */}
                            {product.colors?.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-blue)]">Select Color</h3>
                                    <div className="flex space-x-4">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-6 h-6 rounded-full border-2 transition-all p-0.5 ${selectedColor === color ? 'border-[var(--athenic-gold)] scale-125' : 'border-transparent'}`}
                                                style={{ backgroundColor: color.toLowerCase() }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-[10px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-blue)]">Select Size</h3>
                                    <button className="text-[8px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-gold)] border-b border-[var(--athenic-gold)] pb-0.5 hover:opacity-70">
                                        Drapery Guide
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {(product.sizes?.length > 0 ? product.sizes : ['S', 'M', 'L']).map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`py-4 text-xs font-serif tracking-widest uppercase transition-all border ${selectedSize === size
                                                ? 'border-[var(--athenic-gold)] bg-[#fdfdfa] text-[var(--athenic-gold)] shadow-sm'
                                                : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons — 2x2 Grid */}
                        <div className="mb-16 space-y-4">
                            {/* Row 1: Add to Cart + Buy Now */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="btn-athenic-gold py-5 text-[11px] tracking-[0.2em] uppercase flex items-center justify-center space-x-2 athenic-shadow"
                                >
                                    <span className="text-lg">🛒</span>
                                    <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    className="btn-athenic-outline py-5 text-[11px] tracking-[0.2em] uppercase flex items-center justify-center space-x-2"
                                >
                                    <span className="text-lg">💳</span>
                                    <span>Buy Now</span>
                                </button>
                            </div>

                            {/* Row 2: Try-On / Tailoring / Compare (2-col grid) */}
                            <div className="grid grid-cols-2 gap-3">
                                {TRYON_CATEGORIES.includes(product.category) && (
                                    <button
                                        onClick={() => navigate(`/try-on?product=${product._id}`)}
                                        className="py-5 text-[11px] tracking-[0.2em] uppercase flex items-center justify-center space-x-2 border-2 border-[var(--athenic-gold)] text-[var(--athenic-gold)] hover:bg-[var(--athenic-gold)] hover:text-white transition-all"
                                    >
                                        <span className="text-lg">👗</span>
                                        <span>Virtual Try-On</span>
                                    </button>
                                )}

                                {TAILORING_CATEGORIES.includes(product.category) && (
                                    <button
                                        onClick={() => navigate(`/tailoring?product=${product._id}`)}
                                        className="py-5 text-[11px] tracking-[0.2em] uppercase flex items-center justify-center space-x-2 border-2 border-[var(--mehron-deep,#7c2d12)] text-[var(--mehron-deep,#7c2d12)] hover:bg-[var(--mehron-deep,#7c2d12)] hover:text-white transition-all"
                                    >
                                        <span className="text-lg">✂️</span>
                                        <span>Custom Tailoring</span>
                                    </button>
                                )}

                                {isAuthenticated && (
                                    <button
                                        onClick={() => setShowComparison(true)}
                                        className="py-5 text-[11px] tracking-[0.2em] uppercase flex items-center justify-center space-x-2 border-2 border-[var(--athenic-gold)] text-[var(--athenic-gold)] hover:bg-[var(--athenic-gold)] hover:text-white transition-all group"
                                    >
                                        <span className="text-lg group-hover:scale-110 transition-transform">⚖️</span>
                                        <span>Compare Products</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Return Policy Badge */}
                        <div className="flex items-center space-x-6 py-6 border-y border-gray-100 mb-8">
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">🔄</span>
                                <div>
                                    <p className="text-[10px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-blue)] font-semibold">
                                        {(product.returnDays ?? 7) > 0
                                            ? `${product.returnDays ?? 7} Day Easy Returns`
                                            : 'No Returns'}
                                    </p>
                                    <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest mt-0.5">
                                        {(product.returnDays ?? 7) > 0
                                            ? 'Hassle-free return policy'
                                            : 'This product is non-returnable'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">🛡️</span>
                                <div>
                                    <p className="text-[10px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-blue)] font-semibold">Authentic Product</p>
                                    <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest mt-0.5">Quality Guaranteed</p>
                                </div>
                            </div>
                        </div>

                        {/* Philosophy & Details */}
                        <div className="space-y-8 pt-10 border-t border-gray-100">
                            <div className="flex items-start space-x-4">
                                <span className="text-[var(--athenic-gold)] text-xl mt-1">☀️</span>
                                <div>
                                    <h4 className="text-[10px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-blue)] mb-1">The Art of The Fold</h4>
                                    <p className="text-[9px] font-serif text-gray-500 uppercase tracking-widest leading-relaxed">
                                        Each garment is meticulously pleated by hand using ancient techniques preserved by Greek artisans.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <span className="text-[var(--athenic-gold)] text-xl mt-1">⚜️</span>
                                <div>
                                    <h4 className="text-[10px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-blue)] mb-1">100% Mulberry Silk</h4>
                                    <p className="text-[9px] font-serif text-gray-500 uppercase tracking-widest leading-relaxed">
                                        Ethically sourced, heavy-weight 40mm silk with a liquid-like sheen and organic dyes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Shop Link */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 border border-[var(--athenic-gold)] flex items-center justify-center text-[var(--athenic-gold)] font-serif text-xl">
                                    🏛️
                                </div>
                                <div>
                                    <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400">Athenic Boutique</p>
                                    <h4 className="text-xs font-serif tracking-widest text-[var(--athenic-blue)] uppercase">{product.shopId?.shopName || 'Classical Atelier'}</h4>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/shop/${product.shopId?._id}`)}
                                className="text-[9px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-gold)] border-b border-[var(--athenic-gold)] pb-0.5 hover:opacity-70"
                            >
                                View Shop
                            </button>
                        </div>
                    </div>
                </div>

            {/* ─── Related Products ───────────────────────────────── */}
            <div className="bg-[#faf8f5] py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-serif tracking-wide text-gray-900 mb-2">
                            You May Also Like
                        </h2>
                        <div className="w-16 h-0.5 bg-[var(--mehron)] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        {moreFromShop.map((item) => (
                            <ProductCard key={item._id} product={item} />
                        ))}
                        {moreFromShop.length === 0 && (
                            <div className="col-span-full py-10 text-center text-gray-400 text-sm">
                                Discovering related pieces...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Login Prompt Modal ─────────────────────────────── */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowLoginPrompt(false)}>
                    <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-[var(--mehron-blush)] flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-[var(--mehron)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Sign In Required</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Please sign in to add items to your bag or make a purchase.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="py-3 rounded-sm border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="py-3 rounded-sm bg-[var(--mehron)] text-white text-sm font-medium hover:bg-[var(--mehron-deep)] transition-colors shadow-md"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Image Zoom Modal ──────────────────────────────────── */}
            {zoomOpen && (
                <ImageZoomModal
                    images={product.images || []}
                    initialIndex={zoomIndex}
                    onClose={() => setZoomOpen(false)}
                />
            )}

            {/* ── 360° Product Viewer Modal ──────────────────────────── */}
            {show360 && product.video360 && (
                <Product360Viewer
                    videoUrl={product.video360}
                    productName={product.name}
                    onClose={() => setShow360(false)}
                />
            )}

            {/* ── Personalized Comparison Modal ──────────────────────── */}
            <ProductComparison
                productId={product._id}
                isOpen={showComparison}
                onClose={() => setShowComparison(false)}
            />
            </div>
        </div>
    );
};

export default ProductDetails;
