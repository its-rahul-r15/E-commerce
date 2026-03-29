import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService, cartService } from '../../services/api';
import { ChevronRightIcon, XMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import ProductCard from '../../components/customer/ProductCard';

const POPULAR_CATEGORIES = [
    { title: 'DESIGNER SAREES', defaultImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=500', path: '/products?category=Saree', aspect: 'aspect-square', categoryName: 'Saree' },
    { title: 'KURTAS & KURTIES', defaultImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=500', path: '/products?category=Kurta', aspect: 'aspect-[4/3]', categoryName: 'Kurta' },
    { title: 'BRIDAL LEHENGAS', defaultImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=500', path: '/products?category=Lehenga', aspect: 'aspect-[3/4]', categoryName: 'Lehenga' },
    { title: 'ELEGANT SALWAR SUITS', defaultImage: 'https://images.unsplash.com/photo-1610189013231-01741164ed2e?auto=format&fit=crop&q=80&w=500', path: '/products?category=Salwar%20Suit', aspect: 'aspect-[3/4]', categoryName: 'Salwar Suit' },
    { title: 'WESTERN WEAR', defaultImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=500', path: '/products?category=Western%20Wear', aspect: 'aspect-square', categoryName: 'Western Wear' },
    { title: "MEN'S SHERWANIS", defaultImage: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&q=80&w=500', path: '/products?category=Sherwani', aspect: 'aspect-square', categoryName: 'Sherwani' },
    { title: 'TRENDY SHIRTS', defaultImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3?auto=format&fit=crop&q=80&w=500', path: '/products?category=Shirt', aspect: 'aspect-[3/4]', categoryName: 'Shirt' }
];

const HERO_SLIDES = [
    {
        id: 1,
        image: 'https://res.cloudinary.com/dpfls0d1n/image/upload/v1774637447/85-1353-20562_lqfxfo.avif',
        category: '',
        title: '',
        buttonText: '',
        link: '/products?category=Home'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=2000',
        category: 'NEW ARRIVALS',
        title: 'MODERN ETHNIC WEAR',
        buttonText: 'EXPLORE COLLECTION',
        link: '/products?category=Women'
    },
    {
        id: 3,
        image: 'https://res.cloudinary.com/dpfls0d1n/image/upload/v1774605726/Rass_WebBanner__Web_idjg5p.webp',
        category: '',
        title: '',
        buttonText: '',
        link: '/products?category=Saree'
    }
];


const SHOP_THE_LOOK_VIDEOS = [
    {
        id: 1,
        video: 'https://res.cloudinary.com/dpfls0d1n/video/upload/v1774606018/8f34ce37db_fieoxp.mp4',

        title: 'Off White Pure Silk Cotton'
    },
    {
        id: 2,
        video: 'https://res.cloudinary.com/dpfls0d1n/video/upload/v1774606032/f97b632f51_1_eftlcm.mp4',

        title: 'Red Handwoven Silk'
    },
    {
        id: 3,
        video: 'https://res.cloudinary.com/dpfls0d1n/video/upload/v1774606039/ca618432c7_lk5uqn.mp4',

        title: 'Yellow Gradient Tissue'
    },
    {
        id: 4,
        video: 'https://res.cloudinary.com/dpfls0d1n/video/upload/v1774606039/1e0a30b0b3_au7j4c.mp4',

        title: 'Green Checked Saree'
    },
    {
        id: 5,
        video: 'https://res.cloudinary.com/dpfls0d1n/video/upload/v1774606018/8f34ce37db_fieoxp.mp4',

        title: 'Classic White Silk'
    }
];

const Home = () => {
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [randomProducts, setRandomProducts] = useState([]);
    const [categoryImages, setCategoryImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);

    const featuredScrollRef = useRef(null);
    const trendingScrollRef = useRef(null);
    const randomScrollRef = useRef(null);

    const scrollFeatured = (direction) => {
        if (featuredScrollRef.current) {
            const scrollAmount = 300;
            featuredScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollTrending = (direction) => {
        if (trendingScrollRef.current) {
            const scrollAmount = 300;
            trendingScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollRandom = (direction) => {
        if (randomScrollRef.current) {
            const scrollAmount = 300;
            randomScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [trendingData, featuredData, randomData] = await Promise.all([
                productService.getProducts({ limit: 10 }),
                productService.getFeaturedProducts(10),
                productService.getRandomProducts(10)
            ]);
            setProducts(trendingData?.data || []);
            setFeaturedProducts(featuredData || []);
            setRandomProducts(randomData || []);

            // Fetch first product image for popular categories
            const cats = POPULAR_CATEGORIES.map(c => c.categoryName);
            const catImgMap = {};
            await Promise.all(
                cats.map(async (c) => {
                    try {
                        const res = await productService.getProducts({ categories: [c], limit: 1 });
                        if (res?.data && res.data.length > 0 && res.data[0].images?.length > 0) {
                            catImgMap[c] = res.data[0].images[0];
                        }
                    } catch (e) {
                        console.error('Failed to fetch category image for', c);
                    }
                })
            );
            setCategoryImages(catImgMap);
        } catch (error) {
            setProducts([]);
            setFeaturedProducts([]);
            setRandomProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            setAddingToCart(true);
            await cartService.addToCart(productId, 1);
            alert('Added to cart successfully!');
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert('Failed to add to cart. Please try again.');
            }
        } finally {
            setAddingToCart(false);
        }
    };

    const nextVideo = (e) => {
        e.stopPropagation();
        setSelectedVideoIndex((prev) => (prev + 1) % SHOP_THE_LOOK_VIDEOS.length);
    };

    const prevVideo = (e) => {
        e.stopPropagation();
        setSelectedVideoIndex((prev) => (prev - 1 + SHOP_THE_LOOK_VIDEOS.length) % SHOP_THE_LOOK_VIDEOS.length);
    };

    // Show all categories in POPULAR_CATEGORIES list
    const activeCategories = POPULAR_CATEGORIES;
    const categoryColumns = [];
    for (let i = 0; i < activeCategories.length; i += 2) {
        categoryColumns.push(activeCategories.slice(i, i + 2));
    }

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--athenic-bg)]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--athenic-gold)] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--athenic-bg)] selection:bg-[var(--athenic-gold)] selection:text-white">

            {/* Hero Section Carousel */}
            <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden flex items-center justify-center group">

                {/* Slides Container */}
                <div
                    className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {HERO_SLIDES.map((slide) => (
                        <div key={slide.id} className="min-w-full h-full relative flex items-center justify-end px-12 md:px-32">
                            {/* Slide Background Image */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 md:bg-black/10"></div>
                            </div>

                            {/* Slide Content Overlay */}
                            <div className="relative z-20 text-right max-w-lg hidden md:block">
                                <p className="text-xl md:text-3xl font-serif tracking-[0.2em] text-white mb-4 uppercase drop-shadow-sm">
                                    {slide.category}
                                </p>
                                <h1 className="text-2xl md:text-5xl font-serif tracking-[0.1em] text-white italic mb-8 drop-shadow-sm border-b border-white pb-6 inline-block">
                                    {slide.title}
                                </h1>
                                <br />
                                <button
                                    onClick={() => navigate(slide.link)}
                                    className="border border-white text-white hover:bg-white hover:text-black transition-colors px-10 py-3 text-sm tracking-widest uppercase"
                                >
                                    {slide.buttonText}
                                </button>
                            </div>

                            {/* Mobile Content Display */}
                            <div className="relative z-20 text-center w-full md:hidden flex flex-col items-center justify-center h-full">
                                <p className="text-sm font-serif tracking-[0.2em] text-white mb-2 uppercase drop-shadow-sm">
                                    {slide.category}
                                </p>
                                <h1 className="text-2xl font-serif tracking-[0.1em] text-white italic mb-6 drop-shadow-sm">
                                    {slide.title}
                                </h1>
                                <button
                                    onClick={() => navigate(slide.link)}
                                    className="border border-white text-white hover:bg-white hover:text-black transition-colors px-6 py-2 text-xs tracking-widest uppercase"
                                >
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Left Arrow */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 p-3 shadow-sm z-30 transition-all text-gray-800 opacity-0 group-hover:opacity-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>

                {/* Right Arrow */}
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 p-3 shadow-sm z-30 transition-all text-gray-800 opacity-0 group-hover:opacity-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
                    {HERO_SLIDES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2.5 h-2.5 transform rotate-45 border ${currentSlide === index
                                ? 'bg-white border-white scale-125'
                                : 'bg-transparent border-white/70 hover:bg-white/50'
                                } transition-all duration-300`}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            </section>

            <div className="h-10"></div> {/* Spacer */}

            {/* Shop The Look Section */}
            <section className="max-w-[1400px] mx-auto px-4 py-8">
                <h2 className="text-3xl font-serif text-center mb-10 text-gray-800">Shop The Look</h2>

                <div className="flex overflow-x-auto space-x-6 pb-6 px-4 no-scrollbar items-center justify-start xl:justify-center">
                    {SHOP_THE_LOOK_VIDEOS.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedVideoIndex(index)}
                            className="relative group flex-shrink-0 w-[240px] h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
                        >
                            {/* Video Background */}
                            <video
                                src={item.video}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                            ></video>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                            {/* Play Icon */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/60 transition-all group-hover:scale-110">
                                    <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Text and Thumbnail */}
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                {item.id === 1 && (
                                    <p className="text-xs font-serif leading-tight mb-3 w-[70%] font-medium">
                                        Off White Pure<br />Silk Cotton<br />Fabric
                                    </p>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Shop The Look Modal */}
            {selectedVideoIndex !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm transition-opacity">

                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedVideoIndex(null)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevVideo}
                        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 md:p-4 rounded-full backdrop-blur-md transition-all z-50"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextVideo}
                        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 md:p-4 rounded-full backdrop-blur-md transition-all z-50"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>

                    {/* Modal Content */}
                    <div className="bg-white w-full max-w-5xl rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[80vh] shadow-2xl relative">

                        {/* Left: Video */}
                        <div className="w-full md:w-[45%] h-[40%] md:h-full bg-black relative">
                            <video
                                src={SHOP_THE_LOOK_VIDEOS[selectedVideoIndex].video}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                playsInline
                                controls
                            ></video>
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                <p className="text-white font-serif font-medium drop-shadow-md text-sm md:text-base max-w-[70%]">
                                    {SHOP_THE_LOOK_VIDEOS[selectedVideoIndex].title}
                                </p>
                            </div>
                        </div>

                        {/* Right: Product Details */}
                        <div className="w-full md:w-[55%] h-[60%] md:h-full p-6 md:p-10 flex flex-col overflow-y-auto bg-gray-50">

                            {/* Product Images Carousel (Dummy real images) */}
                            <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
                                {[1, 2, 3].map((num) => {
                                    const prodImg = products[selectedVideoIndex]?.images?.[num - 1] || SHOP_THE_LOOK_VIDEOS[selectedVideoIndex].thumbnail;
                                    return (
                                        <div key={num} className="w-24 h-32 md:w-32 md:h-44 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                            <img src={prodImg} className="w-full h-full object-cover" alt="Product Angle" />
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                                <h2 className="text-xl md:text-3xl font-serif text-gray-900 mb-2 leading-tight">
                                    {products[selectedVideoIndex]?.name || `${SHOP_THE_LOOK_VIDEOS[selectedVideoIndex].title} Saree`}
                                </h2>

                                <p className="text-2xl font-serif font-bold text-[var(--athenic-blue)] mb-6">
                                    ₹{(products[selectedVideoIndex]?.price || 4999).toLocaleString()}
                                </p>

                                <div className="space-y-4 mb-8">
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">Description</h4>
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed font-serif">
                                        {products[selectedVideoIndex]?.description ||
                                            `Stunning handwoven ${SHOP_THE_LOOK_VIDEOS[selectedVideoIndex].title.toLowerCase()} featuring traditional craftsmanship and contemporary elegance. Perfect for festive occasions and celebrations. Includes unstitched blouse piece.`}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-auto pt-4 border-t border-gray-200 flex space-x-4">
                                <button
                                    onClick={() => handleAddToCart(products[selectedVideoIndex]?._id || 'dummy')}
                                    disabled={addingToCart}
                                    className="flex-1 bg-[#8e2b4f] hover:bg-[#7a2443] text-white py-4 rounded-xl font-serif uppercase tracking-widest text-sm transition-colors shadow-md disabled:opacity-70 flex justify-center items-center"
                                >
                                    {addingToCart ? (
                                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                    ) : 'Add to cart'}
                                </button>
                                <button
                                    onClick={() => navigate(`/product/${products[selectedVideoIndex]?._id || 'dummy'}`)}
                                    className="w-16 h-14 md:w-20 md:h-[52px] flex items-center justify-center border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Popular Categories Section */}
            {categoryColumns.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-4 py-16">
                    <h2 className="text-4xl font-serif text-center mb-12 text-gray-900 leading-tight">Popular Categories</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {categoryColumns.map((col, colIndex) => (
                            <div key={colIndex} className="flex flex-col space-y-8">
                                {col.map((item, itemIndex) => {
                                    const isFirstItem = colIndex === 0 && itemIndex === 0;
                                    return (
                                        <Link
                                            key={itemIndex}
                                            to={item.path}
                                            className="flex flex-col group cursor-pointer"
                                        >
                                            <div className={`w-full overflow-hidden bg-gray-100 ${item.aspect} ${isFirstItem ? 'rounded-tl-[4rem]' : ''}`}>
                                                <img
                                                    src={categoryImages[item.categoryName] || item.defaultImage}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                            <h3 className="text-center mt-4 text-xs font-bold font-sans tracking-widest text-[#2d2d2d] group-hover:text-[var(--athenic-gold)] transition-colors uppercase">
                                                {item.title}
                                            </h3>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Meander Divider */}
            <div className="meander-border opacity-10 my-6"></div>



            {/* Promotion / Coupon Bar */}
            <section className="bg-gradient-to-r from-[var(--mehron-blush)] to-[var(--mehron-soft)] py-4 border-y border-[var(--athenic-gold)] border-opacity-20 my-10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <span className="text-2xl">🏷️</span>
                        <div>
                            <p className="text-[10px] font-serif uppercase tracking-[0.1em] text-gray-500">For our Exclusive</p>
                            <p className="text-sm font-serif italic text-[var(--mehron)]">Use Code: <span className="font-bold font-serif not-italic tracking-wider uppercase">SAVE10</span></p>
                        </div>
                    </div>
                    <div className="h-px w-full md:w-px md:h-8 bg-[var(--athenic-gold)] opacity-30 hidden md:block"></div>
                    <div className="flex items-center space-x-4">
                        <span className="text-2xl">🎓</span>
                        <p className="text-[10px] font-serif uppercase tracking-[0.2em] text-gray-600">15% OFF ON YOUR FIRST SHOP VISIT</p>
                    </div>
                </div>
            </section>

            {/* Featured Collection styled as Bestselling Styles */}
            {featuredProducts.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-4 py-8 md:py-16 relative group">
                    <h2 className="text-2xl md:text-3xl font-sans font-medium text-center mb-10 text-gray-900 leading-tight">Bestselling Styles</h2>

                    <div className="relative">
                        {/* Custom Scrollable Carousel */}
                        <div
                            ref={featuredScrollRef}
                            className="flex overflow-x-auto space-x-4 md:space-x-6 pb-6 no-scrollbar snap-x snap-mandatory"
                        >
                            {featuredProducts.map((product) => (
                                <Link
                                    key={product._id}
                                    to={`/product/${product._id}`}
                                    className="flex-shrink-0 w-[240px] md:w-[280px] group/card cursor-pointer snap-start"
                                >
                                    <div className="w-full aspect-[3/4] bg-gray-100 mb-4 overflow-hidden relative">
                                        <img
                                            src={product.images?.[0] || '/placeholder-product.png'}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                        />
                                    </div>
                                    <h3 className="text-xs font-sans text-gray-800 line-clamp-1 mb-1.5 leading-snug">{product.name}</h3>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-semibold text-gray-900">₹{(product.discountedPrice || product.price).toLocaleString()}</p>
                                        {product.discountedPrice && product.discountedPrice < product.price && (
                                            <>
                                                <p className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</p>
                                                <p className="text-xs font-semibold text-[#d03c3f]">
                                                    {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={(e) => { e.preventDefault(); scrollFeatured('left'); }}
                            className="absolute left-0 top-[40%] -translate-y-1/2 -ml-2 md:-ml-4 bg-white shadow-md border border-gray-100 p-2 md:p-3 hover:bg-gray-50 z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeftIcon className="w-6 h-6 text-gray-500" strokeWidth={1} />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); scrollFeatured('right'); }}
                            className="absolute right-0 top-[40%] -translate-y-1/2 -mr-2 md:-mr-4 bg-white shadow-md border border-gray-100 p-2 md:p-3 hover:bg-gray-50 z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRightIcon className="w-6 h-6 text-gray-500" strokeWidth={1} />
                        </button>
                    </div>
                </section>
            )}

            {/* Meander Divider */}
            {featuredProducts.length > 0 && (
                <div className="meander-border opacity-20 my-4"></div>
            )}

            {/* Trending Collection styled as Bestselling Styles */}
            <section className="max-w-[1400px] mx-auto px-4 py-8 md:py-16 relative group">
                <h2 className="text-2xl md:text-3xl font-sans font-medium text-center mb-10 text-gray-900 leading-tight">Trending Collection</h2>

                <div className="relative">
                    {/* Custom Scrollable Carousel */}
                    <div
                        ref={trendingScrollRef}
                        className="flex overflow-x-auto space-x-4 md:space-x-6 pb-6 no-scrollbar snap-x snap-mandatory"
                    >
                        {products.map((product) => (
                            <Link
                                key={product._id}
                                to={`/product/${product._id}`}
                                className="flex-shrink-0 w-[240px] md:w-[280px] group/card cursor-pointer snap-start"
                            >
                                <div className="w-full aspect-[3/4] bg-gray-100 mb-4 overflow-hidden relative">
                                    <img
                                        src={product.images?.[0] || '/placeholder-product.png'}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                    />
                                </div>
                                <h3 className="text-xs font-sans text-gray-800 line-clamp-1 mb-1.5 leading-snug">{product.name}</h3>
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-semibold text-gray-900">₹{(product.discountedPrice || product.price).toLocaleString()}</p>
                                    {product.discountedPrice && product.discountedPrice < product.price && (
                                        <>
                                            <p className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</p>
                                            <p className="text-xs font-semibold text-[#d03c3f]">
                                                {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                                            </p>
                                        </>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={(e) => { e.preventDefault(); scrollTrending('left'); }}
                        className="absolute left-0 top-[40%] -translate-y-1/2 -ml-2 md:-ml-4 bg-white shadow-md border border-gray-100 p-2 md:p-3 hover:bg-gray-50 z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-500" strokeWidth={1} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); scrollTrending('right'); }}
                        className="absolute right-0 top-[40%] -translate-y-1/2 -mr-2 md:-mr-4 bg-white shadow-md border border-gray-100 p-2 md:p-3 hover:bg-gray-50 z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRightIcon className="w-6 h-6 text-gray-500" strokeWidth={1} />
                    </button>
                </div>

                <div className="flex justify-center mt-6">
                    <button onClick={() => navigate('/products')} className="text-xs font-sans font-medium uppercase tracking-widest border-b-2 border-gray-900 pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
                        Shop All Trending
                    </button>
                </div>
            </section>

            {/* Meander Divider */}
            <div className="meander-border opacity-20 my-4"></div>

            {/* Discovery / Random Collection styled as Bestselling Styles */}
            {randomProducts.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-4 py-8 md:py-16 relative group">
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-between mb-8 md:mb-10 w-full px-2">
                        <div className="flex-1 hidden md:block"></div>
                        <h2 className="text-2xl md:text-3xl font-sans font-medium text-center text-gray-900 leading-tight">Hidden Gems</h2>
                        <div className="flex-1 flex md:justify-end mt-4 md:mt-0">
                            <button onClick={fetchData} className="text-[10px] font-sans font-bold uppercase tracking-widest border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition-colors flex items-center gap-2">
                                <span>🔄</span> Refresh
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Custom Scrollable Carousel (2 Rows) */}
                        <div
                            ref={randomScrollRef}
                            className="grid grid-rows-2 grid-flow-col gap-x-4 gap-y-8 md:gap-x-6 pb-6 overflow-x-auto no-scrollbar snap-x snap-mandatory"
                        >
                            {randomProducts.map((product) => (
                                <Link
                                    key={product._id}
                                    to={`/product/${product._id}`}
                                    className="w-[240px] md:w-[280px] group/card cursor-pointer snap-start"
                                >
                                    <div className="w-full aspect-[3/4] bg-gray-100 mb-4 overflow-hidden relative">
                                        <img
                                            src={product.images?.[0] || '/placeholder-product.png'}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                        />
                                    </div>
                                    <h3 className="text-xs font-sans text-gray-800 line-clamp-1 mb-1.5 leading-snug">{product.name}</h3>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-semibold text-gray-900">₹{(product.discountedPrice || product.price).toLocaleString()}</p>
                                        {product.discountedPrice && product.discountedPrice < product.price && (
                                            <>
                                                <p className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</p>
                                                <p className="text-xs font-semibold text-[#d03c3f]">
                                                    {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={(e) => { e.preventDefault(); scrollRandom('left'); }}
                            className="absolute left-0 top-[40%] -translate-y-1/2 -ml-2 md:-ml-4 bg-white shadow-md border border-gray-100 p-2 md:p-3 hover:bg-gray-50 z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeftIcon className="w-6 h-6 text-gray-500" strokeWidth={1} />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); scrollRandom('right'); }}
                            className="absolute right-0 top-[40%] -translate-y-1/2 -mr-2 md:-mr-4 bg-white shadow-md border border-gray-100 p-2 md:p-3 hover:bg-gray-50 z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRightIcon className="w-6 h-6 text-gray-500" strokeWidth={1} />
                        </button>
                    </div>
                </section>
            )}

            {/* Meander Divider */}
            <div className="meander-border opacity-30 mt-10"></div>

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

