import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, cartService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/customer/ProductCard';

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

            if (data.product?.shopId?._id) {
                fetchMoreFromShop(data.product.shopId._id);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreFromShop = async (shopId) => {
        try {
            const data = await productService.getProducts({ shop: shopId, limit: 10 });
            setMoreFromShop(data.products?.filter(p => p._id !== id).slice(0, 5) || []);
        } catch (error) {
            console.error('Error fetching shop products:', error);
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
                        <div className="relative aspect-[3/4] overflow-hidden bg-white border border-[var(--athenic-gold)] border-opacity-10 shadow-lg group">
                            <img
                                src={product.images?.[selectedImage] || '/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            {originalPrice && (
                                <div className="absolute top-6 right-6 bg-[#E5C369] text-[var(--athenic-blue)] px-4 py-2 font-serif text-[10px] tracking-widest uppercase shadow-md animate-pulse">
                                    Gold tier 15% off
                                </div>
                            )}
                        </div>

                        {/* Secondary Gallery */}
                        <div className="grid grid-cols-2 gap-8">
                            {product.images?.slice(1, 3).map((img, idx) => (
                                <div key={idx} className="relative aspect-square overflow-hidden bg-white border border-[var(--athenic-gold)] border-opacity-10 shadow-sm transition-all hover:shadow-md">
                                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                                    <p className="absolute bottom-4 left-4 text-[8px] font-serif uppercase tracking-widest text-white mix-blend-difference italic">
                                        {idx === 0 ? 'Detail: The Art of the Fold' : 'Silhouette: Classical Structure'}
                                    </p>
                                </div>
                            ))}
                        </div>
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

                        {/* Action Buttons */}
                        <div className="space-y-4 mb-16">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="w-full btn-athenic-gold py-6 text-[11px] tracking-[0.3em] uppercase flex items-center justify-center space-x-3 athenic-shadow"
                            >
                                <span className="text-lg">✨</span>
                                <span>{addingToCart ? 'Preserving...' : 'Add to Wardrobe'}</span>
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="w-full btn-athenic-outline py-6 text-[11px] tracking-[0.3em] uppercase flex items-center justify-center space-x-3"
                            >
                                <span>Secure the Sculpture</span>
                            </button>
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
        </div>
    );
};

export default ProductDetails;
