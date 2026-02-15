import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const BannerCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Banner images - you can replace these with your actual banner URLs
    const banners = [
        {
            id: 1,
            image: 'https://res.cloudinary.com/dpfls0d1n/image/upload/v1771057360/Blue_Grey_and_Tan_Bohemian_Website_Sale_Banner_qs3dwh.png',
            
             bgColor: 'from-purple-900 to-pink-500'
        },
        {
            id: 2,
            image: 'https://res.cloudinary.com/dpfls0d1n/image/upload/v1771057793/Brown_and_Cream_Minimalist_Fashion_Women_Facebook_Fundraiser_Cover_Photo_a1fo49.png',
            
            bgColor: 'from-green-500 to-yellow-800'
        },
        {
            id: 3,
            image: 'https://res.cloudinary.com/dpfls0d1n/image/upload/v1771059603/Grey_and_Black_Modern_Fashion_Store_Banner_vzc3fe.png',
            
            bgColor: 'from-orange-500 to-red-600'
        }
    ];

    // Auto-scroll functionality
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 4000); // Change slide every 4 seconds

        return () => clearInterval(timer);
    }, [banners.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    return (
        <div className="relative w-full h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-xl group">
            {/* Slides */}
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor} opacity-90`}></div>

                    {/* Background image */}
                    <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover mix-blend-overlay"
                    />

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                        <div className="text-white">
                            <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                                {banner.title}
                            </h2>
                            <p className="text-xl md:text-2xl mb-6 drop-shadow-md">
                                {banner.subtitle}
                            </p>
                            
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
            >
                <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
            >
                <ChevronRightIcon className="w-6 h-6 text-gray-800" />
            </button>

            {/* Dots Navigation */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all rounded-full ${index === currentSlide
                                ? 'w-10 h-3 bg-white'
                                : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerCarousel;
