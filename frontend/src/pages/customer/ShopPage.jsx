import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shopService, productService } from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';

const ShopPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchShop();
        fetchProducts();
    }, [id]);

    const fetchShop = async () => {
        try {
            setLoading(true);
            const data = await shopService.getShopById(id);
            setShop(data.shop);
        } catch (error) {
            console.error('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setProductsLoading(true);
            const response = await productService.getShopProducts(id, {});
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setProductsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--athenic-bg)] text-[var(--athenic-gold)]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent"></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--athenic-bg)]">
                <div className="text-center font-serif uppercase tracking-widest">
                    <h2 className="text-2xl text-[var(--athenic-blue)] mb-6">Shop Not Found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-athenic-outline px-8 py-3 text-[10px]"
                    >
                        Return to Shops
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--athenic-bg)] selection:bg-[var(--athenic-gold)] selection:text-white pb-32">
            {/* Welcome Section (Hero) */}
            <div className="relative pt-24 pb-32 overflow-hidden border-b border-[var(--athenic-gold)] border-opacity-20 animate-fade-in">
                {/* Marble texture background overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/marble-white.png')]"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    {/* Centered Logo Circle */}
                    <div className="mb-10 inline-block relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[var(--athenic-gold)] p-2 bg-white shadow-xl animate-scale-in">
                            <div className="w-full h-full rounded-full border border-[var(--athenic-gold)] border-opacity-30 overflow-hidden flex items-center justify-center bg-[var(--athenic-bg)]">
                                {shop.images?.[0] ? (
                                    <img src={shop.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl">🏛️</span>
                                )}
                            </div>
                        </div>
                        {/* Laurel Wreath Ornament (CSS simulation or simplified) */}
                        <div className="absolute -inset-4 border-2 border-[var(--athenic-gold)] border-opacity-10 rounded-full pointer-events-none scale-110"></div>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <span className="h-[1px] w-8 bg-[var(--athenic-gold)] opacity-50"></span>
                            <span className="text-[10px] font-serif uppercase tracking-[0.4em] text-[var(--athenic-gold)]">Verified Local Shop</span>
                            <span className="h-[1px] w-8 bg-[var(--athenic-gold)] opacity-50"></span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-serif tracking-[0.15em] text-[var(--athenic-blue)] mb-8 uppercase leading-tight animate-slide-down">
                            {shop.shopName}
                        </h1>

                        <p className="text-xs md:text-sm font-serif italic text-gray-500 leading-relaxed tracking-wide mb-10 opacity-80 animate-fade-in-delayed">
                            "{shop.description || 'Quality products from our local shop to your doorstep.'}"
                        </p>

                        <div className="flex flex-wrap justify-center items-center gap-8 text-[10px] font-serif uppercase tracking-[0.2em] text-[var(--athenic-blue)]">
                            <div className="flex items-center space-x-2">
                                <span className="text-[var(--athenic-gold)]">★</span>
                                <span className="font-bold">{shop.rating || '5.0'}</span>
                                <span className="opacity-40">Rating</span>
                            </div>
                            <div className="hidden sm:block h-4 w-[1px] bg-gray-200"></div>
                            <div className="flex items-center space-x-2">
                                <span className="text-[var(--athenic-gold)]">🏛️</span>
                                <span className="font-bold">{shop.category}</span>
                            </div>
                            <div className="hidden sm:block h-4 w-[1px] bg-gray-200"></div>
                            <div className="flex items-center space-x-2">
                                <span className="text-[var(--athenic-gold)]">📍</span>
                                <span className="font-bold">{shop.address?.city || 'Local Area'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Product Gallery */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <div className="meander-border opacity-20 mb-10"></div>
                    <h2 className="text-3xl font-serif tracking-[0.2em] text-[var(--athenic-blue)] uppercase">
                        Our Products
                    </h2>
                    <p className="text-[8px] font-serif tracking-[0.3em] text-gray-400 uppercase mt-4">
                        Hand-selected pieces from {shop.shopName}
                    </p>
                </div>

                {productsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--athenic-gold)] border-t-transparent"></div>
                        <p className="text-[10px] font-serif uppercase tracking-widest text-gray-400">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-32 border border-[var(--athenic-gold)] border-opacity-10 bg-white">
                        <p className="text-[11px] font-serif uppercase tracking-[0.2em] text-gray-400">The shop is currently preparing its next collection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>

            {/* Shop Contact Information */}
            <div className="max-w-4xl mx-auto px-4 mt-20 pt-20 border-t border-[var(--athenic-gold)] border-opacity-20 text-center">
                <h3 className="text-[10px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-blue)] mb-8">Customer Assistance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400 italic">Location</p>
                        <p className="text-xs font-serif text-[var(--athenic-blue)] tracking-wide leading-relaxed">
                            {shop.address?.street}, {shop.address?.city}<br />
                            {shop.address?.state} {shop.address?.pincode}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400 italic">Call the Shop</p>
                        <p className="text-xs font-serif text-[var(--athenic-blue)] tracking-[0.1em]">
                            {shop.phone}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
