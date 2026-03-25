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

    // New UI state
    const [pincode, setPincode] = useState('');
    const [pincodeMessage, setPincodeMessage] = useState('');
    const [showProductDetails, setShowProductDetails] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);

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
                } catch { /* ignore */ }
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
        <div className="min-h-screen bg-white selection:bg-[var(--athenic-gold)] selection:text-white pb-20">

            {/* ─── Breadcrumb ─────────────────────────────────────── */}
            <div className="bg-[#faf8f5] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center py-3 text-xs text-gray-500 font-sans">
                        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-[var(--mehron)] transition-colors">Home</span>
                        <svg className="w-3 h-3 mx-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        <span className="cursor-pointer hover:text-[var(--mehron)] transition-colors">{product.category || 'Products'}</span>
                        <svg className="w-3 h-3 mx-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        <span className="text-[var(--mehron)] font-medium truncate max-w-[200px]">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* ─── Main Product Section ───────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ══════════════════════════════════════════════════════
                         LEFT SIDE — Image Gallery (Thumbnails + Main Image)
                         ══════════════════════════════════════════════════════ */}
                    <div className="lg:w-[58%] flex gap-3">

                        {/* Vertical Thumbnail Strip */}
                        <div className="hidden sm:flex flex-col gap-2 w-[72px] flex-shrink-0">
                            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                                {(product.images || []).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        onMouseEnter={() => setSelectedImage(idx)}
                                        className={`relative w-[68px] h-[82px] flex-shrink-0 overflow-hidden rounded-sm transition-all duration-200
                                            ${selectedImage === idx
                                                ? 'ring-2 ring-[var(--mehron)] shadow-md scale-[1.02]'
                                                : 'ring-1 ring-gray-200 hover:ring-[var(--gold)] opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}

                                {/* 360° View Button in thumbnail strip */}
                                {product.video360 && (
                                    <button
                                        onClick={() => setShow360(true)}
                                        className="w-[68px] h-[82px] flex-shrink-0 rounded-sm bg-[#1a1a2e] ring-1 ring-[var(--gold)] flex flex-col items-center justify-center gap-1 hover:scale-[1.02] transition-all"
                                    >
                                        <span className="text-lg">🔄</span>
                                        <span className="text-[7px] font-semibold text-[var(--gold)] uppercase tracking-wider">360°</span>
                                    </button>
                                )}

                                {/* Scroll indicator */}
                                {(product.images?.length || 0) > 6 && (
                                    <div className="flex justify-center pt-1">
                                        <svg className="w-4 h-4 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Image + Secondary Image Grid */}
                        <div className="flex-1 space-y-3">
                            {/* Main Image */}
                            <div
                                className="relative aspect-[3/4] overflow-hidden bg-[#f9f7f4] rounded-sm cursor-crosshair group"
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
                                    className="w-full h-full object-cover transition-transform duration-300 zoom-image"
                                />

                                {/* Discount badge */}
                                {originalPrice && (
                                    <div className="absolute top-4 left-4 bg-[var(--mehron)] text-white px-3 py-1.5 rounded-sm text-xs font-bold tracking-wide shadow-lg">
                                        {discountPercent}% OFF
                                    </div>
                                )}

                                {/* Zoom hint */}
                                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                    Click to zoom
                                </div>

                                {/* Wishlist button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                    <svg className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'}`} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>

                                {/* Image counter */}
                                {product.images?.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-full">
                                        {selectedImage + 1} / {product.images.length}
                                    </div>
                                )}
                            </div>

                            {/* Mobile horizontal thumbnails (visible on small screens only) */}
                            <div className="flex sm:hidden gap-2 overflow-x-auto no-scrollbar pb-1">
                                {(product.images || []).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-16 h-20 flex-shrink-0 overflow-hidden rounded-sm ${selectedImage === idx ? 'ring-2 ring-[var(--mehron)]' : 'ring-1 ring-gray-200 opacity-70'}`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Secondary images grid (2 column) */}
                            {product.images?.length > 1 && (
                                <div className="hidden lg:grid grid-cols-2 gap-3">
                                    {product.images.slice(0, 4).map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-[3/4] overflow-hidden bg-[#f9f7f4] rounded-sm cursor-pointer group/sub"
                                            onClick={() => { setZoomIndex(idx); setZoomOpen(true); }}
                                            onMouseEnter={() => setSelectedImage(idx)}
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} view ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover/sub:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* View all images link */}
                            {(product.images?.length || 0) > 4 && (
                                <button
                                    onClick={() => { setZoomIndex(0); setZoomOpen(true); }}
                                    className="w-full text-center text-sm text-[var(--mehron)] font-medium hover:underline py-2 flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    View All {product.images.length} Images
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════
                         RIGHT SIDE — Product Information
                         ══════════════════════════════════════════════════════ */}
                    <div className="lg:w-[42%] lg:sticky lg:top-24 lg:self-start">
                        <div className="lg:pl-4 space-y-0">

                            {/* Product Title & Brand */}
                            <div className="pb-4 border-b border-gray-100">
                                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug mb-2 font-sans">
                                    {product.name}
                                </h1>

                                {/* Brand / Shop */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm text-gray-500 font-sans">{product.shopId?.shopName || 'Brand'}</span>
                                    <button
                                        onClick={() => navigate(`/shop/${product.shopId?._id}`)}
                                        className="text-xs text-[var(--mehron)] font-medium hover:underline flex items-center gap-0.5"
                                    >
                                        View Full Collection
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>

                                {/* Price Section */}
                                <div className="flex items-baseline gap-3 mt-3">
                                    <span className="text-2xl font-bold text-gray-900">₹{price?.toLocaleString()}</span>
                                    {originalPrice && (
                                        <>
                                            <span className="text-base text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                                            <span className="text-sm font-semibold text-green-600">{discountPercent}% OFF</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes</p>
                            </div>

                            {/* ── Color Selection ────────────────────── */}
                            {product.colors?.length > 0 && (
                                <div className="py-5 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">
                                        Select Color
                                        {selectedColor && <span className="ml-2 font-normal text-gray-400 normal-case tracking-normal">— {selectedColor}</span>}
                                    </h3>
                                    <div className="flex gap-3">
                                        {product.colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-9 h-9 rounded-full transition-all duration-200 ${selectedColor === color
                                                    ? 'ring-2 ring-offset-2 ring-[var(--mehron)] scale-110'
                                                    : 'ring-1 ring-gray-200 hover:ring-gray-400'}`}
                                                style={{ backgroundColor: color.toLowerCase() }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Size Selection ─────────────────────── */}
                            <div className="py-5 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">Select Size</h3>
                                    <button className="text-xs text-[var(--mehron)] font-medium hover:underline flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        Size Chart
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {(product.sizes?.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL']).map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[48px] h-11 px-4 text-sm font-medium rounded-sm border-2 transition-all duration-200
                                                ${selectedSize === size
                                                    ? 'border-[var(--mehron)] bg-[var(--mehron)] text-white shadow-md'
                                                    : 'border-gray-200 text-gray-700 hover:border-[var(--mehron)] hover:text-[var(--mehron)]'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Quantity ── */}
                            <div className="py-5 border-b border-gray-100">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">Quantity</h3>
                                <div className="flex items-center gap-0 w-fit border border-gray-200 rounded-sm overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[var(--mehron)] transition-colors text-lg font-medium"
                                    >−</button>
                                    <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-gray-800 border-x border-gray-200 bg-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(10, q + 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[var(--mehron)] transition-colors text-lg font-medium"
                                    >+</button>
                                </div>
                            </div>

                            {/* ── Action Buttons ─────────────────────── */}
                            <div className="py-5 space-y-3 border-b border-gray-100">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="h-[52px] border-2 border-[var(--mehron)] text-[var(--mehron)] rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-[var(--mehron-blush)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        {addingToCart ? 'Adding...' : 'Add To Bag'}
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        className="h-[52px] bg-[var(--mehron)] text-white rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-[var(--mehron-deep)] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Buy Now
                                    </button>
                                </div>

                                {/* Row 2: Try-On / Tailoring / Compare */}
                                <div className="flex flex-wrap gap-2.5">
                                    {TRYON_CATEGORIES.includes(product.category) && (
                                        <button
                                            onClick={() => navigate(`/try-on?product=${product._id}`)}
                                            className="flex-1 min-w-[140px] h-11 text-xs font-semibold uppercase tracking-wider border-2 border-[var(--gold)] text-[var(--gold)] rounded-sm hover:bg-[var(--gold)] hover:text-white transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <span>👗</span> Virtual Try-On
                                        </button>
                                    )}

                                    {TAILORING_CATEGORIES.includes(product.category) && (
                                        <button
                                            onClick={() => navigate(`/tailoring?product=${product._id}`)}
                                            className="flex-1 min-w-[140px] h-11 text-xs font-semibold uppercase tracking-wider border-2 border-orange-800 text-orange-800 rounded-sm hover:bg-orange-800 hover:text-white transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <span>✂️</span> Custom Tailoring
                                        </button>
                                    )}

                                    {isAuthenticated && (
                                        <button
                                            onClick={() => setShowComparison(true)}
                                            className="flex-1 min-w-[140px] h-11 text-xs font-semibold uppercase tracking-wider border-2 border-gray-300 text-gray-600 rounded-sm hover:border-[var(--mehron)] hover:text-[var(--mehron)] transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <span>⚖️</span> Compare
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ── Delivery Section ───────────────────── */}
                            <div className="py-5 border-b border-gray-100">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Delivery
                                </h3>
                                <div className="flex items-stretch border border-gray-200 rounded-sm overflow-hidden">
                                    <input
                                        type="text"
                                        placeholder="Enter Pincode for Delivery Date"
                                        value={pincode}
                                        onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPincodeMessage(''); }}
                                        maxLength={6}
                                        className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                                    />
                                    <button
                                        onClick={handlePincodeCheck}
                                        className="px-5 py-3 text-sm font-semibold text-[var(--mehron)] hover:bg-[var(--mehron-blush)] transition-colors border-l border-gray-200"
                                    >
                                        Check
                                    </button>
                                </div>
                                {pincodeMessage && (
                                    <p className={`text-xs mt-2 ${pincodeMessage.includes('available') ? 'text-green-600' : 'text-red-500'}`}>{pincodeMessage}</p>
                                )}

                                {/* Shipping badges */}
                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        <span className="underline underline-offset-2 decoration-dotted cursor-help font-medium">All India Free Shipping</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        <span className="underline underline-offset-2 decoration-dotted cursor-help font-medium">{product.returnDays || 3} Day Returns</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Product Details (Expandable) ────────── */}
                            <div className="py-5 border-b border-gray-100">
                                <button
                                    onClick={() => setShowProductDetails(!showProductDetails)}
                                    className="w-full flex justify-between items-center group/toggle"
                                >
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Product Details</h3>
                                    <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showProductDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-500 ${showProductDetails ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
                                >
                                    {/* Description */}
                                    <p className="text-sm text-gray-600 leading-relaxed mb-5">
                                        {product.description || `Introducing ${product.name} made of the finest materials. This exquisite piece of craftsmanship comes from our curated collection. Bring home a piece of modern aesthetic, reflecting artisanal crafts.`}
                                    </p>

                                    {/* Specs Table */}
                                    <div className="space-y-0 border border-gray-100 rounded-sm overflow-hidden">
                                        {product.category && (
                                            <div className="flex border-b border-gray-100">
                                                <span className="w-[45%] text-xs text-gray-500 bg-[#faf8f5] px-4 py-3 font-medium">Category</span>
                                                <span className="flex-1 text-xs text-gray-800 px-4 py-3 font-semibold">{product.category}</span>
                                            </div>
                                        )}
                                        {product.ornamentation && (
                                            <div className="flex border-b border-gray-100">
                                                <span className="w-[45%] text-xs text-gray-500 bg-[#faf8f5] px-4 py-3 font-medium">Ornamentation</span>
                                                <span className="flex-1 text-xs text-gray-800 px-4 py-3 font-semibold">{product.ornamentation}</span>
                                            </div>
                                        )}
                                        {product.craft && (
                                            <div className="flex border-b border-gray-100">
                                                <span className="w-[45%] text-xs text-gray-500 bg-[#faf8f5] px-4 py-3 font-medium">Craft</span>
                                                <span className="flex-1 text-xs text-gray-800 px-4 py-3 font-semibold">{product.craft}</span>
                                            </div>
                                        )}
                                        <div className="flex border-b border-gray-100">
                                            <span className="w-[45%] text-xs text-gray-500 bg-[#faf8f5] px-4 py-3 font-medium">Return Days</span>
                                            <span className="flex-1 text-xs text-gray-800 px-4 py-3 font-semibold">{product.returnDays ?? 3}</span>
                                        </div>
                                        <div className="flex border-b border-gray-100">
                                            <span className="w-[45%] text-xs text-gray-500 bg-[#faf8f5] px-4 py-3 font-medium">COD Available</span>
                                            <span className="flex-1 text-xs text-gray-800 px-4 py-3 font-semibold">{product.codAvailable !== false ? 'YES' : 'NO'}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-[45%] text-xs text-gray-500 bg-[#faf8f5] px-4 py-3 font-medium">Dispatch Days</span>
                                            <span className="flex-1 text-xs text-gray-800 px-4 py-3 font-semibold">{product.dispatchDays ?? 2}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Trust Badges ───────────────────────── */}
                            <div className="py-5 grid grid-cols-3 gap-4">
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <div className="w-10 h-10 rounded-full bg-[#fef7ed] flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Authentic</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <div className="w-10 h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Free Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <div className="w-10 h-10 rounded-full bg-[#eff6ff] flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Easy Returns</span>
                                </div>
                            </div>
                        </div>
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
    );
};

export default ProductDetails;
