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

    // UI redesign state
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const [openAccordion, setOpenAccordion] = useState('Product Details');
    
    // Zoom state
    const [magnifierStyle, setMagnifierStyle] = useState({ display: 'none' });

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
            const existingIds = new Set([id]); // always exclude current product

            // Helper to extract products array from API response
            // getProducts returns { success, data: [...products], pagination }
            const extractProducts = (res) => {
                if (Array.isArray(res?.data)) return res.data;
                if (Array.isArray(res?.data?.products)) return res.data.products;
                if (Array.isArray(res)) return res;
                return [];
            };

            // Pass 1: products from same shop
            if (shopId) {
                try {
                    const shopData = await productService.getProducts({ shopId: shopId, limit: 10 });
                    const shopProducts = extractProducts(shopData).filter(p => !existingIds.has(p._id));
                    shopProducts.forEach(p => existingIds.add(p._id));
                    related = [...related, ...shopProducts];
                } catch { /* ignore */ }
            }

            // Pass 2: same category products
            if (related.length < 5 && category) {
                try {
                    const catData = await productService.getProducts({ category: category, limit: 10 });
                    const catProducts = extractProducts(catData).filter(p => !existingIds.has(p._id));
                    catProducts.forEach(p => existingIds.add(p._id));
                    related = [...related, ...catProducts];
                } catch { /* ignore */ }
            }

            // Pass 3: any available products (broadest fallback)
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--athenic-bg)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--athenic-gold)] border-t-transparent"></div>
        </div>
    );

    if (!product) return null;

    const price = product.discountedPrice || product.price;
    const originalPrice = product.discountedPrice ? product.price : null;

    return (
        <div className="min-h-screen bg-[#fafafa] selection:bg-[var(--athenic-gold)] selection:text-white pb-20 pt-6 font-sans">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                {/* Modern Breadcrumb */}
                <nav className="flex items-center text-xs text-gray-500 mb-8 border-b border-gray-100 pb-3 font-medium">
                    <span onClick={() => navigate('/')} className="cursor-pointer hover:text-gray-900 transition-colors">Home</span>
                    <span className="mx-2 font-light">›</span>
                    <span className="cursor-pointer hover:text-gray-900 transition-colors">{product.category || 'Women Clothing'}</span>
                    <span className="mx-2 font-light">›</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start mb-24">
                    
                    {/* LEFT: Image Gallery */}
                    <div className="w-full lg:w-[60%] flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-8">
                        {/* Thumbnails (Vertical on desktop) */}
                        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto w-full md:w-24 shrink-0 no-scrollbar pr-1 md:pr-0 md:pb-1 h-auto md:max-h-[800px]">
                            {(product.images || []).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-20 md:w-full aspect-[3/4] shrink-0 border-2 transition-all ${selectedImage === idx ? 'border-gray-900' : 'border-transparent hover:border-gray-200'}`}
                                >
                                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                            {/* 360 Video Thumbnail */}
                            {product.video360 && (
                                <button
                                    onClick={() => setShow360(true)}
                                    className="relative w-20 md:w-full aspect-[3/4] shrink-0 border border-gray-200 bg-gray-50 flex flex-col items-center justify-center hover:border-gray-400 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full border border-gray-900 flex items-center justify-center text-gray-900 mb-1 group-hover:scale-110 transition-transform">
                                        🔄
                                    </div>
                                    <span className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold">360° View</span>
                                </button>
                            )}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 relative bg-gray-50 aspect-[3/4] md:aspect-auto md:min-h-[600px] cursor-crosshair overflow-hidden"
                             onClick={() => { setZoomIndex(selectedImage); setZoomOpen(true); }}
                             onMouseMove={(e) => {
                                 const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                                 const x = ((e.clientX - left) / width) * 100;
                                 const y = ((e.clientY - top) / height) * 100;
                                 
                                 const cursorX = e.clientX - left;
                                 const cursorY = e.clientY - top;

                                 setMagnifierStyle({
                                     display: 'block',
                                     left: `${cursorX - 100}px`, // 100 is half lens size
                                     top: `${cursorY - 100}px`,
                                     backgroundPosition: `${x}% ${y}%`,
                                     backgroundImage: `url(${product.images?.[selectedImage] || '/placeholder.png'})`,
                                     backgroundSize: `${width * 2.5}px ${height * 2.5}px` // 2.5x zoom
                                 });
                             }}
                             onMouseLeave={() => setMagnifierStyle({ display: 'none' })}
                             onMouseEnter={() => setMagnifierStyle(prev => ({ ...prev, display: 'block' }))}
                        >
                            <img
                                src={product.images?.[selectedImage] || '/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Circular Magnifier */}
                            <div 
                                className="absolute pointer-events-none rounded-full shadow-2xl z-20 border-2 border-white"
                                style={{
                                    ...magnifierStyle,
                                    width: '200px',
                                    height: '200px',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundColor: 'white'
                                }}
                            />

                            {/* Heart Action */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); /* Add logic here */ }}
                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform text-xl text-gray-500 hover:text-red-500 z-30"
                            >
                                ♡
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="w-full lg:w-[40%] flex flex-col pt-2 lg:pt-0">
                        {/* Title & Brand */}
                        <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-2 leading-snug">
                            {product.name}
                        </h1>
                        <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">
                            {product.shopId?.shopName || 'Premium Collection'}
                            <span className="text-[10px] ml-2 text-gray-400 lowercase font-normal cursor-pointer hover:underline border-l border-gray-300 pl-2">View Full Collection ›</span>
                        </p>

                        {/* Pricing */}
                        <div className="flex items-baseline flex-wrap gap-2 md:gap-3 mt-2 border-b border-gray-200 pb-5 mb-6">
                            <span className="text-2xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
                            {originalPrice && (
                                <>
                                    <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                                    <span className="text-sm font-semibold text-[#c88d5e]">
                                        {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                                    </span>
                                </>
                            )}
                            <p className="w-full text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                        </div>

                        {/* Color Selection */}
                        {product.colors?.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-3">
                                    <span className="text-sm font-medium text-gray-900">Color:</span>
                                    <span className="text-sm text-gray-600 capitalize">{selectedColor || product.colors[0]}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full border border-gray-200 p-0.5 transition-all ${selectedColor === color ? 'ring-2 ring-gray-900 ring-offset-1' : 'hover:scale-110'}`}
                                            title={color}
                                        >
                                            <div className="w-full h-full rounded-full" style={{ backgroundColor: color.toLowerCase() }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-sm font-medium text-gray-900">Select Size:</span>
                                <button className="text-[11px] font-semibold text-gray-800 underline hover:text-gray-600 transition-colors">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(product.sizes?.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL']).map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`min-w-[44px] h-10 px-3 text-xs font-semibold uppercase transition-all border ${
                                            selectedSize === size
                                                ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                                : 'border-gray-200 text-gray-700 hover:border-gray-500 bg-white'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery / Pincode */}
                        <div className="mb-8">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Delivery</h4>
                            <div className="relative max-w-sm bg-gray-50 flex border border-gray-100 p-1">
                                <input 
                                    type="text" 
                                    placeholder="Enter Pincode for Delivery Date" 
                                    className="w-full px-3 py-2 bg-transparent focus:outline-none text-xs text-gray-700 placeholder:text-gray-400"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <button 
                                    className="px-4 text-xs font-semibold text-gray-800 hover:text-black border-l border-gray-200"
                                    onClick={() => {
                                        if(pincode.length === 6) setDeliveryStatus({ text: 'Expected delivery by 3rd Apr', color: 'text-green-700' });
                                        else setDeliveryStatus({ text: 'Enter valid 6-digit PIN', color: 'text-red-500' });
                                    }}
                                >
                                    Check
                                </button>
                            </div>
                            {deliveryStatus && (
                                <p className={`text-xs mt-2 ${deliveryStatus.color} font-medium`}>{deliveryStatus.text}</p>
                            )}
                            <div className="flex gap-6 mt-4 pb-4 border-b border-gray-200">
                                <div className="text-[10px] uppercase font-semibold text-gray-600 flex items-center gap-1 hover:text-gray-900 cursor-pointer underline underline-offset-2">100% Purchase Protection</div>
                                <div className="text-[10px] uppercase font-semibold text-gray-600 flex items-center gap-1 hover:text-gray-900 cursor-pointer underline underline-offset-2">5 Days easy returns</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 mb-10">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="flex-1 py-4 border border-[#b25746] text-[#b25746] text-sm font-semibold tracking-wide hover:bg-[#b25746] hover:text-white transition-colors"
                                >
                                    {addingToCart ? 'Adding...' : 'Add To Bag'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 py-4 bg-[#b25746] text-white text-sm font-semibold tracking-wide hover:bg-[#914638] transition-colors"
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Additional Tools row */}
                            <div className="flex gap-2 mt-2">
                                {TRYON_CATEGORIES.includes(product.category) && (
                                    <button onClick={() => navigate(`/try-on?product=${product._id}`)} className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex justify-center items-center gap-1.5">
                                        <span className="text-xs">👗</span> Try-On
                                    </button>
                                )}
                                {TAILORING_CATEGORIES.includes(product.category) && (
                                    <button onClick={() => navigate(`/tailoring?product=${product._id}`)} className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex justify-center items-center gap-1.5">
                                        <span className="text-xs">✂️</span> Tailor
                                    </button>
                                )}
                                {isAuthenticated && (
                                    <button onClick={() => setShowComparison(true)} className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex justify-center items-center gap-1.5">
                                        <span className="text-xs">⚖️</span> Compare
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Accordion Details */}
                        <div>
                            {[
                                { title: 'Product Details', content: product.description || 'Introducing our exclusive collection made of the finest materials. This exquisite piece of craftsmanship brings home a piece of modern aesthetic. Explore more artisanal finds from our wide range.' },
                                { title: 'Delivery & Returns', content: `Dispatch in 2 Days. ${(product.returnDays ?? 7) > 0 ? `${product.returnDays ?? 7} Day Easy Returns.` : 'This product is non-returnable.'}` },
                                { title: 'Style & Fit Tips', content: 'Runs true to size. For a more relaxed fit, consider sizing up. Style with minimal accessories for an elegant look.' },
                                { title: 'FAQs', content: 'Crafted ethically paying fair wages to artisans. Dry clean only recommended.' }
                            ].map((section, idx) => (
                                <div key={idx} className="border-b border-gray-200">
                                    <button 
                                        className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                                        onClick={() => setOpenAccordion(openAccordion === section.title ? '' : section.title)}
                                    >
                                        <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                                        <span className="text-lg font-light text-gray-600 group-hover:text-black mt-[-4px]">
                                            {openAccordion === section.title ? '−' : '+'}
                                        </span>
                                    </button>
                                    {openAccordion === section.title && (
                                        <div className="pb-4">
                                            <p className="text-xs text-gray-600 leading-relaxed max-w-[90%]">{section.content}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-20">
                    <div className="text-center mb-16">
                        <div className="meander-border opacity-20 mb-10"></div>
                        <h2 className="text-3xl font-serif tracking-[0.2em] text-[var(--athenic-blue)] italic font-normal">
                            Complements Your Silhouette
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                        {moreFromShop.map((item) => (
                            <ProductCard key={item._id} product={item} />
                        ))}
                        {moreFromShop.length === 0 && (
                            <div className="col-span-full py-10 text-center text-gray-400 font-serif uppercase tracking-widest text-[10px]">
                                Discovering related pieces...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white border border-[var(--athenic-gold)] p-10 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 border border-[var(--athenic-gold)] flex items-center justify-center mx-auto mb-6 text-2xl text-[var(--athenic-gold)]">
                            🏛️
                        </div>
                        <h2 className="text-xl font-serif tracking-widest text-[var(--athenic-blue)] mb-4 uppercase">Royal Access Only</h2>
                        <p className="text-[10px] font-serif text-gray-500 uppercase tracking-widest mb-8 leading-loose px-4">
                            Please join the Athenic Tradition to add this masterpiece to your wardrobe.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="py-3 border border-gray-100 text-[9px] font-serif uppercase tracking-widest hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="py-3 bg-[var(--athenic-blue)] text-white text-[9px] font-serif uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Image Zoom Modal ──────────────────────────────────────── */}
            {zoomOpen && (
                <ImageZoomModal
                    images={product.images || []}
                    initialIndex={zoomIndex}
                    onClose={() => setZoomOpen(false)}
                />
            )}

            {/* ── 360° Product Viewer Modal ──────────────────────────────── */}
            {show360 && product.video360 && (
                <Product360Viewer
                    videoUrl={product.video360}
                    productName={product.name}
                    onClose={() => setShow360(false)}
                />
            )}

            {/* ── Personalized Comparison Modal ──────────────────────────── */}
            <ProductComparison
                productId={product._id}
                isOpen={showComparison}
                onClose={() => setShowComparison(false)}
            />
        </div>
    );
};

export default ProductDetails;
