import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, shopService, couponService } from '../../services/api';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ShopCard from '../../components/customer/ShopCard';
import ProductCard from '../../components/customer/ProductCard';

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
            <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden bg-athenic-gradient">
                {/* Background Columns (Decorative) */}
                <div className="absolute inset-0 flex justify-between px-20 opacity-5 pointer-events-none">
                    <div className="w-1 bg-[var(--athenic-blue)] h-full"></div>
                    <div className="w-1 bg-[var(--athenic-blue)] h-full"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-7xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] mb-6 leading-tight uppercase">
                        MODERN DRAPERY,<br />
                        <span className="italic font-playfair lowercase font-normal">Ancient Soul</span>
                    </h1>
                    <p className="text-[10px] md:text-xs font-serif tracking-[0.4em] uppercase text-[var(--athenic-gold)] mb-12">
                        High Fashion - Classical Aesthetics
                    </p>

                    <div className="group relative inline-block">
                        <button className="btn-athenic-gold px-12 py-4 text-sm tracking-widest uppercase">
                            Explore the Suit
                        </button>
                    </div>
                </div>

                {/* Floating Luxury Card */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] athenic-card text-center py-10 px-8 athenic-shadow">
                    <h2 className="text-2xl font-serif tracking-[0.15em] uppercase text-[var(--athenic-blue)] mb-4">
                        Luxury Fashion
                    </h2>
                    <p className="text-xs font-serif leading-relaxed text-gray-500 opacity-80 uppercase tracking-widest px-4">
                        Discover the epitome of elegance through our curated collection of classical silhouettes reimagined for the modern world.
                    </p>
                </div>
            </section>

            <div className="h-20"></div> {/* Spacer for floating card */}

            {/* Meander Divider */}
            <div className="meander-border opacity-30 my-10"></div>

            {/* Specialized Categories */}
            <section className="max-w-7xl mx-auto px-4 py-16 text-center">
                <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] mb-4">
                    Personalized Experience
                </p>
                <h2 className="text-3xl font-serif tracking-widest text-[var(--athenic-blue)] mb-12 uppercase">
                    NEARBY BOUTIQUES
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
            <section className="bg-gradient-to-r from-[#FDEFEF] to-[#F5E6E6] py-4 border-y border-[var(--athenic-gold)] border-opacity-20 my-10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <span className="text-2xl">🏷️</span>
                        <div>
                            <p className="text-[10px] font-serif uppercase tracking-[0.1em] text-gray-500">For our Exclusive</p>
                            <p className="text-sm font-serif italic text-red-800">Use Code: <span className="font-bold font-serif not-italic tracking-wider uppercase">ATHENIG15</span></p>
                        </div>
                    </div>
                    <div className="h-px w-full md:w-px md:h-8 bg-[var(--athenic-gold)] opacity-30 hidden md:block"></div>
                    <div className="flex items-center space-x-4">
                        <span className="text-2xl">🎓</span>
                        <p className="text-[10px] font-serif uppercase tracking-[0.2em] text-gray-600">15% OFF ON YOUR FIRST ATELIER VISIT</p>
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
            <section className="py-32 bg-gradient-to-b from-[var(--athenic-bg)] to-[#FEEEDF] items-center flex flex-col justify-center text-center px-4 relative">
                <div className="absolute top-10 flex justify-center w-full opacity-30">
                    <span className="text-4xl text-[var(--athenic-gold)]">⚜️</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif tracking-[0.2em] text-[var(--athenic-blue)] mb-8 leading-tight uppercase">
                    The Art of The Fold
                </h2>
                <p className="max-w-3xl text-xs md:text-sm font-serif italic text-gray-600 leading-[2em] mb-12 px-6">
                    Our garments are not merely sewn; they are sculpted. Using hand-woven Persian linen and mulberry silk, we recreate the rhythmic weight of classical drapery for the modern silhouette.
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

