import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ReviewSection = ({ productId }) => {
    const { isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    
    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReviews();
        if (isAuthenticated) {
            checkPurchaseStatus();
        }
    }, [productId, isAuthenticated]);

    const fetchReviews = async () => {
        try {
            const data = await reviewService.getReviews(productId);
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const checkPurchaseStatus = async () => {
        try {
            const status = await reviewService.checkPurchase(productId);
            setHasPurchased(status.hasPurchased);
            setHasReviewed(status.hasReviewed);
        } catch (error) {
            console.error('Error checking purchase status:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await reviewService.createReview(productId, { rating, comment });
            setHasReviewed(true);
            setComment('');
            fetchReviews(); // Refresh reviews
            // Ideally trigger a product refresh here, but for now just refresh reviews
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-serif text-gray-900 mb-6">Customer Reviews</h3>

            {/* Write a review form (only for verified buyers) */}
            {isAuthenticated && hasPurchased && !hasReviewed && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h4 className="text-lg font-medium mb-4">Write a Review</h4>
                    {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <div className="flex gap-1 cursor-pointer">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`w-6 h-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                                rows="3"
                                placeholder="Share your experience with this product..."
                                maxLength={500}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}

            {/* List of reviews */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="pb-6 border-b border-gray-100 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="font-medium text-sm">{review.user?.name || 'Anonymous'}</div>
                                    <div className="flex bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 gap-1 items-center">
                                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Verified Buyer
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex gap-0.5 mb-2">
                                {renderStars(review.rating)}
                            </div>
                            {review.comment && (
                                <p className="text-sm text-gray-700">{review.comment}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
