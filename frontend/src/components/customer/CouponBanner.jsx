import { useState, useEffect } from 'react';
import axios from '../../utils/axios';

const CouponBanner = () => {
    const [coupons, setCoupons] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchActiveCoupons();
    }, []);

    const fetchActiveCoupons = async () => {
        try {
            const response = await axios.get('/coupons/active');
            setCoupons(response.data.data.coupons || []);
        } catch (error) {
            console.error('Error fetching active coupons:', error);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Coupon code "${code}" copied to clipboard!`);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % coupons.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + coupons.length) % coupons.length);
    };

    if (coupons.length === 0) return null;

    const currentCoupon = coupons[currentIndex];

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden my-8">
            <div className="relative">
                {/* Coupon Content */}
                <div className="flex flex-col md:flex-row items-center p-6 md:p-8">
                    {/* Poster Image */}
                    {currentCoupon.posterImage && (
                        <div className="w-full md:w-1/3 mb-4 md:mb-0">
                            <img
                                src={currentCoupon.posterImage}
                                alt={currentCoupon.code}
                                className="rounded-lg w-full h-48 object-cover"
                            />
                        </div>
                    )}

                    {/* Coupon Details */}
                    <div className={`flex-1 ${currentCoupon.posterImage ? 'md:pl-8' : ''}`}>
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {currentCoupon.discountType === 'percentage'
                                    ? `${currentCoupon.discountValue}% OFF`
                                    : `₹${currentCoupon.discountValue} OFF`}
                            </h3>
                            {currentCoupon.description && (
                                <p className="text-gray-600">{currentCoupon.description}</p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            {/* Coupon Code */}
                            <div className="flex items-center space-x-2">
                                <div className="px-4 py-2 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md">
                                    <span className="text-lg font-bold text-gray-900">{currentCoupon.code}</span>
                                </div>
                                <button
                                    onClick={() => handleCopyCode(currentCoupon.code)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                                >
                                    Copy Code
                                </button>
                            </div>

                            {/* Details */}
                            <div className="text-sm text-gray-500">
                                {currentCoupon.minPurchase > 0 && (
                                    <span>Min purchase: ₹{currentCoupon.minPurchase}</span>
                                )}
                                <span className="ml-3">Expires: {new Date(currentCoupon.expiryDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                {coupons.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md"
                        >
                            <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md"
                        >
                            <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Dots Indicator */}
            {coupons.length > 1 && (
                <div className="flex justify-center space-x-2 pb-4">
                    {coupons.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 w-2 rounded-full transition-all ${index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CouponBanner;
