import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, cartService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/customer/ProductCard';
import Product360Viewer from '../../components/customer/Product360Viewer';
import ImageZoomModal from '../../components/customer/ImageZoomModal';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    
    // Pincode states
    const [pincode, setPincode] = useState('');
    const [pincodeMessage, setPincodeMessage] = useState('Valid 6-digit PIN required');
    const [pincodeError, setPincodeError] = useState(true);

    const [addingToCart, setAddingToCart] = useState(false);
    const [moreFromShop, setMoreFromShop] = useState([]);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    
    // Accordion state
    const [openAccordion, setOpenAccordion] = useState('');
    
    // Zoom/360 states
    const [zoomOpen, setZoomOpen] = useState(false);
    const [show360, setShow360] = useState(false);

    // Clothing categories that support virtual try-on
    const TRYON_CATEGORIES = ['Kurta', 'Saree', 'Lehenga', 'Salwar Suit', 'Sherwani', 'Dress', 'Top', 'Shirt', 'Jacket', 'Ethnic Wear', 'Western Wear', 'Clothing', 'Fashion'];
    const TAILORING_CATEGORIES = ['Kurta', 'Saree', 'Lehenga', 'Salwar Suit', 'Sherwani', 'Dress', 'Ethnic Wear'];

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductById(id);
            setProduct(data.product);

            if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);

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

            setMoreFromShop(related.slice(0, 5));
        } catch (error) {
            console.error('Error fetching related products:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) return setShowLoginPrompt(true);
        if (!selectedSize) return alert('Please select a size first');
        
        setAddingToCart(true);
        try {
            await cartService.addToCart(id, 1, { size: selectedSize });
            alert('Added to cart successfully!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) return setShowLoginPrompt(true);
        if (!selectedSize) return alert('Please select a size first');
        
        try {
            await cartService.addToCart(id, 1, { size: selectedSize });
            navigate('/cart');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to process request');
        }
    };

    const handlePincodeCheck = () => {
        if (!pincode || pincode.length !== 6) {
            setPincodeMessage('Please enter a valid 6-digit pincode');
            setPincodeError(true);
            return;
        }
        setPincodeError(false);
        setPincodeMessage(`Delivery available to ${pincode}. Expected by ${new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`);
    };

    const toggleAccordion = (section) => {
        setOpenAccordion(prev => prev === section ? '' : section);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
        </div>
    );

    if (!product) return null;

    const price = product.discountedPrice || product.price;

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-20 pt-10 font-sans">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* LEFT COLUMN: Thumbnails (Hidden on mobile) */}
                    <div className="hidden lg:flex flex-col gap-3 w-20 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
                        {(product.images || ['/placeholder.png']).map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`w-full aspect-[3/4] overflow-hidden border ${selectedImage === idx ? 'border-gray-900 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'} transition-all`}
                            >
                                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* MIDDLE COLUMN: Main Image */}
                    <div className="flex-1">
                        <div 
                            className="relative w-full bg-[#f4f3f1] aspect-[3/4] cursor-none overflow-hidden group"
                            onClick={() => setZoomOpen(true)}
                            onMouseMove={(e) => {
                                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - left;
                                const y = e.clientY - top;
                                
                                const bgX = (x / width) * 100;
                                const bgY = (y / height) * 100;
                                
                                const magnifier = e.currentTarget.querySelector('.circular-magnifier');
                                if (magnifier) {
                                    magnifier.style.opacity = '1';
                                    magnifier.style.left = `${x - 125}px`;
                                    magnifier.style.top = `${y - 125}px`;
                                    magnifier.style.backgroundPosition = `${bgX}% ${bgY}%`;
                                    magnifier.style.backgroundSize = `${width * 2.5}px ${height * 2.5}px`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                const magnifier = e.currentTarget.querySelector('.circular-magnifier');
                                if (magnifier) {
                                    magnifier.style.opacity = '0';
                                }
                            }}
                        >
                            <img
                                src={product.images?.[selectedImage] || '/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Circular Magnifier Overlay */}
                            <div 
                                className="circular-magnifier pointer-events-none absolute rounded-full border border-gray-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] bg-white z-50 transition-opacity duration-150"
                                style={{
                                    width: '250px',
                                    height: '250px',
                                    opacity: 0,
                                    backgroundImage: `url(${product.images?.[selectedImage] || '/placeholder.png'})`,
                                    backgroundRepeat: 'no-repeat',
                                }}
                            />
                        </div>
                        {/* Mobile Thumbnails */}
                        <div className="flex lg:hidden gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {(product.images || []).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-16 flex-shrink-0 aspect-[3/4] overflow-hidden border ${selectedImage === idx ? 'border-gray-900' : 'border-transparent'}`}
                                >
                                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details */}
                    <div className="w-full lg:w-[450px] flex-shrink-0 lg:sticky lg:top-24">
                        
                        {/* Header: Title & Icons */}
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-xl lg:text-2xl font-medium tracking-wide">
                                {product.name}
                            </h1>
                            <div className="flex gap-4 text-gray-400">
                                <button className="hover:text-red-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                </button>
                                <button className="hover:text-gray-900 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* Style Num */}
                        <div className="text-sm font-medium text-gray-500 italic mb-4">
                            Style No {product._id?.substring(0,8).toUpperCase() || 'SG382817'}
                        </div>

                        {/* Price */}
                        <div className="mb-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm text-gray-500 font-medium">MRP</span>
                                <span className="text-2xl font-bold">₹{price.toLocaleString()}</span>
                            </div>
                            <span className="text-xs text-gray-400">Inclusive Of All Taxes</span>
                        </div>

                        {/* Size Section */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-base font-medium">Size:</span>
                                <span className="text-sm font-medium underline text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">Size Guide</span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-5">
                                {(product.sizes?.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']).map((size, idx) => {
                                    const isLowStock = idx === 0 || idx === 2; // Mocking low stock for UI visually
                                    const isSelected = selectedSize === size;
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`relative h-12 min-w-[3rem] px-3 rounded-full border text-sm font-medium flex items-center justify-center transition-all ${isSelected ? 'border-gray-900 border-2' : 'border-gray-300 hover:border-gray-900'}`}
                                        >
                                            {size}
                                            {isLowStock && (
                                                <div className="absolute -bottom-2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap z-10 font-bold flex items-center gap-0.5">
                                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" /></svg>
                                                    1 left
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="w-full h-14 bg-white border border-gray-900 text-gray-900 font-medium uppercase text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                                {addingToCart ? 'ADDING...' : (
                                    <>ADD TO CART <span className="font-bold text-xs">●</span> ₹{price.toLocaleString()}</>
                                )}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="w-full h-14 bg-[#1A2E28] text-white font-medium uppercase text-sm hover:bg-opacity-90 transition-colors shadow-lg shadow-[#1a2e2830]"
                            >
                                BUY IT NOW
                            </button>
                        </div>

                        {/* Additional Actions */}
                        {(TRYON_CATEGORIES.includes(product.category) || TAILORING_CATEGORIES.includes(product.category)) && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {TRYON_CATEGORIES.includes(product.category) && (
                                    <button
                                        onClick={() => navigate(`/try-on?product=${product._id}`)}
                                        className="py-4 border text-[11px] font-medium tracking-wide uppercase flex items-center justify-center gap-2 border-[#1A2E28] text-[#1A2E28] hover:bg-[#1A2E28] hover:text-white transition-colors"
                                    >
                                        <span className="text-base">👗</span>
                                        <span className="truncate">Try-On</span>
                                    </button>
                                )}

                                {TAILORING_CATEGORIES.includes(product.category) && (
                                    <button
                                        onClick={() => navigate(`/tailoring?product=${product._id}`)}
                                        className="py-4 border text-[11px] font-medium tracking-wide uppercase flex items-center justify-center gap-2 border-amber-800 text-amber-800 hover:bg-amber-800 hover:text-white transition-colors"
                                    >
                                        <span className="text-base">✂️</span>
                                        <span className="truncate">Tailoring</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Trust info underneath buttons */}
                        <div className="flex flex-col items-center gap-3 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                86 people are viewing this item. Don't wait!
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                Estimated delivery : Saturday, 28 Mar 2026
                            </div>
                        </div>

                        {/* Perks Grid */}
                        <div className="grid grid-cols-2 gap-y-4 py-6 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                <span className="bg-gray-100 p-1 rounded-full"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></span>
                                100% Purchase Protection
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                <span className="bg-gray-100 p-1 rounded-full"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></span>
                                5 Days easy returns*
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                <span className="bg-gray-100 p-1 rounded-full"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15l-3-3m0 0l3-3m-3 3h8M22 12A10 10 0 112 12A10 10 0 0122 12z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></span>
                                Assured Quality
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                <span className="bg-gray-100 p-1 rounded-full"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></span>
                                Free shipping*
                            </div>
                        </div>

                        {/* Accordions */}
                        <div className="flex flex-col text-sm border-b border-gray-200">
                            {[
                                { title: 'Product Details', content: product.description || 'Premium quality fabric and vibrant colors to make you stand out. Hand-stitched detailing and perfect fit.' },
                                { title: 'Style & Fit Tips', content: 'Runs true to size. For a more relaxed fit, consider sizing up. Pair with statement jewelry and heels.' },
                                { title: 'Shipping & Returns', content: 'Free express shipping on all orders. Easy 5-day returns with home pickup. Final sale items excluded.' },
                                { title: 'FAQs', content: 'Q: Is the color exact? A: We shoot in natural light to be as accurate as possible. Slight variations may occur.' }
                            ].map(({title, content}) => (
                                <div key={title} className="border-t border-gray-100 relative">
                                    <button 
                                        className="w-full py-5 flex justify-between items-center text-left font-medium hover:text-gray-600 transition-colors bg-white focus:outline-none"
                                        onClick={() => toggleAccordion(title)}
                                    >
                                        {title}
                                        <span className="text-xl font-light leading-none">{openAccordion === title ? '-' : '+'}</span>
                                    </button>
                                    {openAccordion === title && (
                                        <div className="pb-5 pr-5 text-gray-600 leading-relaxed animate-fadeIn">
                                            {content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Related Products ───────────────────────────────── */}
            <div className="bg-[#fcfbf9] py-16 border-t border-gray-100">
                <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-serif text-gray-900 mb-2">You May Also Like</h2>
                        <div className="w-16 h-0.5 bg-gray-900 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-2xl">
                        <h2 className="text-xl font-medium text-gray-900 mb-2">Sign In Required</h2>
                        <p className="text-sm text-gray-500 mb-6">Please sign in to continue with your purchase.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLoginPrompt(false)} className="flex-1 py-3 border text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button onClick={() => navigate('/login')} className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800">Sign In</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {zoomOpen && (
                <ImageZoomModal
                    images={product.images || []}
                    initialIndex={selectedImage}
                    onClose={() => setZoomOpen(false)}
                />
            )}
        </div>
    );
};

export default ProductDetails;
