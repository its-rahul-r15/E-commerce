import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService, shopService, couponService } from '../../services/api';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ShopCard from '../../components/customer/ShopCard';
import ProductCard from '../../components/customer/ProductCard';

const HOME_CATEGORIES = [
    { name: 'Kurta', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?fit=crop&w=200&h=200', path: '/products?categories=Kurta' },
    { name: 'Saree', image: 'https://res.cloudinary.com/dpfls0d1n/image/upload/v1771648885/813vHDLsKVL._SY741__ccfa9b.jpg', path: '/products?categories=Saree' },
    { name: 'Lehenga', image: 'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?fit=crop&w=200&h=200', path: '/products?categories=Lehenga' },
    { name: 'Shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?fit=crop&w=200&h=200', path: '/products?categories=Shirt' },
    { name: 'Dress', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?fit=crop&w=200&h=200', path: '/products?categories=Dress' },
    { name: 'Accessories', image: 'https://res.cloudinary.com/dpfls0d1n/image/upload/v1771649060/martin-de-arriba-uf_IDewI6iQ-unsplash_mayt5i.jpg', path: '/products?categories=Accessories' },
    { name: 'Ethnic', image: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?fit=crop&w=200&h=200', path: '/products?categories=Ethnic%20Wear' },
];

const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [nearbyShops, setNearbyShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopsLoading, setShopsLoading] = useState(true);

    useEffect(() => {
        getUserLocation();
        fetchData();
    }, []);

    const getUserLocation = useCallback(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchNearbyShops(latitude, longitude);
                },
                () => fetchAllShops()
            );
        } else {
            fetchAllShops();
        }
    }, []);

    const fetchNearbyShops = async (lat, lng) => {
        try {
            setShopsLoading(true);
            const data = await shopService.getNearbyShops(lat, lng);
            setNearbyShops(data?.shops || []);
        } catch (error) {
            setNearbyShops([]);
        } finally {
            setShopsLoading(false);
        }
    };

    const fetchAllShops = async () => {
        try {
            setShopsLoading(true);
            const data = await shopService.getPublicShops(1, 10);
            setNearbyShops((data.shops || []).slice(0, 3));
        } catch (error) {
            console.error(error);
        } finally {
            setShopsLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await productService.getProducts({ limit: 10 });
            setProducts(data?.data || []);
        } catch (error) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--athenic-bg)]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--athenic-gold)] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--athenic-bg)] selection:bg-[var(--athenic-gold)] selection:text-white">

            {/* Hero Section */}
            <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
                        alt="Klyra Luxury"
                        className="w-full h-full object-cover opacity-50 grayscale-[0.2] blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--athenic-bg)]/10 to-[var(--athenic-bg)]"></div>
                    <div className="absolute inset-0 bg-black/5"></div>
                </div>

                {/* Background Columns (Decorative) - Moved below image for subtle effect */}
                <div className="absolute inset-0 flex justify-between px-20 opacity-5 pointer-events-none z-10">
                    <div className="w-1 bg-[var(--athenic-blue)] h-full"></div>
                    <div className="w-1 bg-[var(--athenic-blue)] h-full"></div>
                </div>

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-7xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] mb-6 leading-tight uppercase drop-shadow-sm">
                        MODERN STYLE,<br />
                        <span className="italic font-playfair lowercase font-normal">Local Heart</span>
                    </h1>
                    <p className="text-[10px] md:text-xs font-serif tracking-[0.4em] uppercase text-[var(--athenic-gold)] mb-12 drop-shadow-sm">
                        Quality Clothing - From Local Shops
                    </p>

                    <div className="group relative inline-block">
                        <button
                            onClick={() => navigate('/products')}
                            className="btn-athenic-gold px-12 py-4 text-sm tracking-widest uppercase"
                        >
                            Explore
                        </button>
                    </div>
                </div>

                {/* Floating Local Shop Card */}

            </section>

            <div className="h-20"></div> {/* Spacer for floating card */}

            {/* Rounded Categories Section */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between space-x-4 overflow-x-auto pb-4 no-scrollbar">
                    {HOME_CATEGORIES.map((cat) => (
                        <Link
                            key={cat.name}
                            to={cat.path}
                            className="flex flex-col items-center flex-shrink-0 group"
                        >
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[var(--athenic-gold)] border-opacity-20 mb-3 group-hover:border-opacity-100 transition-all duration-500 p-1">
                                <div className="w-full h-full rounded-full overflow-hidden shadow-inner">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                            </div>
                            <span className="text-[10px] md:text-xs font-serif uppercase tracking-widest text-[var(--athenic-blue)] group-hover:text-[var(--athenic-gold)] transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Meander Divider */}
            <div className="meander-border opacity-10 my-6"></div>

            {/* Specialized Categories */}
            <section className="max-w-7xl mx-auto px-4 py-16 text-center">
                <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] mb-4">
                    Personalized Experience
                </p>
                <h2 className="text-3xl font-serif tracking-widest text-[var(--athenic-blue)] mb-12 uppercase">
                    SHOPS NEAR YOU
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {shopsLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-64 bg-white animate-pulse border border-gray-100"></div>)
                    ) : nearbyShops.map(shop => (
                        <ShopCard key={shop._id} shop={shop} />
                    ))}
                </div>
            </section>

            {/* Promotion / Coupon Bar */}
            <section className="bg-gradient-to-r from-[var(--mehron-blush)] to-[var(--mehron-soft)] py-4 border-y border-[var(--athenic-gold)] border-opacity-20 my-10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <span className="text-2xl">🏷️</span>
                        <div>
                            <p className="text-[10px] font-serif uppercase tracking-[0.1em] text-gray-500">For our Exclusive</p>
                            <p className="text-sm font-serif italic text-[var(--mehron)]">Use Code: <span className="font-bold font-serif not-italic tracking-wider uppercase">KLYRA15</span></p>
                        </div>
                    </div>
                    <div className="h-px w-full md:w-px md:h-8 bg-[var(--athenic-gold)] opacity-30 hidden md:block"></div>
                    <div className="flex items-center space-x-4">
                        <span className="text-2xl">🎓</span>
                        <p className="text-[10px] font-serif uppercase tracking-[0.2em] text-gray-600">15% OFF ON YOUR FIRST SHOP VISIT</p>
                    </div>
                </div>
            </section>

            {/* Trending Collection */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-12">
                    <div>
                        <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] mb-2">Curated for you</p>
                        <h2 className="text-4xl font-serif tracking-widest text-[var(--athenic-blue)] uppercase">TRENDING COLLECTION</h2>
                    </div>
                    <button onClick={() => navigate('/products')} className="text-[10px] font-serif font-bold uppercase tracking-widest border-b border-[var(--athenic-gold)] pb-1 hover:text-[var(--athenic-gold)] transition-colors">
                        Shop All Trending
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </section>

            {/* Meander Divider */}
            <div className="meander-border opacity-30 mt-20"></div>

            {/* Brand Philosophy Section */}
            <section className="py-32 bg-gradient-to-b from-[var(--athenic-bg)] to-[var(--gold-pale)] items-center flex flex-col justify-center text-center px-4 relative">
                <div className="absolute top-10 flex justify-center w-full opacity-30">
                    <span className="text-4xl text-[var(--athenic-gold)]">⚜️</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif tracking-[0.2em] text-[var(--athenic-blue)] mb-8 leading-tight uppercase">
                    Quality You Can Trust
                </h2>
                <p className="max-w-3xl text-xs md:text-sm font-serif italic text-gray-600 leading-[2em] mb-12 px-6">
                    Our clothes are made with care by local artisans. We use traditional techniques and high-quality fabrics to bring you comfortable and stylish clothing.
                </p>

                <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-20">
                    <div className="text-center">
                        <p className="text-2xl font-serif text-[var(--athenic-gold)] mb-1">100%</p>
                        <p className="text-[9px] font-serif uppercase tracking-widest text-gray-500">Pure Silk</p>
                    </div>
                    <div className="h-px w-20 md:w-px md:h-12 bg-[var(--athenic-gold)] opacity-30"></div>
                    <div className="text-center">
                        <p className="text-2xl font-serif text-[var(--athenic-gold)] mb-1">ETHICAL</p>
                        <p className="text-[9px] font-serif uppercase tracking-widest text-gray-500">Production</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

