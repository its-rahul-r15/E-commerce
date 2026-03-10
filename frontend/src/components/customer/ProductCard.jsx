import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useWishlist } from '../../contexts/WishlistContext';

const ProductCard = ({ product }) => {
    const price = product.discountedPrice || product.price;
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isSaved = isInWishlist(product._id);
    const navigate = useNavigate();

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    return (
        <Link
            to={`/product/${product._id}`}
            className="group block relative"
        >
            {/* Wishlist Button */}
            <button
                onClick={handleWishlistClick}
                className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-[#FF5A5F] transition-colors"
            >
                {isSaved ? (
                    <HeartSolid className="w-5 h-5 text-[#FF5A5F]" />
                ) : (
                    <HeartOutline className="w-5 h-5" />
                )}
            </button>

            {/* Image Container with Hover Effect */}
            <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4 border border-[var(--athenic-gold)] border-opacity-10 shadow-sm transition-all duration-700 group-hover:shadow-xl">
                <img
                    src={product.images?.[0] || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Add to Cart Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-[var(--athenic-blue)] text-white py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[9px] font-serif uppercase text-center tracking-widest">Add to Wardrobe</p>
                </div>

                {/* Status Badge */}
                {product.stock === 0 && (
                    <div className="absolute top-2 left-2 bg-gray-100 text-[8px] font-serif px-2 py-1 tracking-widest uppercase">
                        Coming Soon
                    </div>
                )}
            </div>

            {/* Product Metadata */}
            <div className="px-1">
                <p className="text-[8px] font-serif uppercase tracking-[0.1em] text-[var(--athenic-gold)] mb-1">
                    {product.category || 'Athens Selection'}
                </p>
                <h3 className="text-[11px] font-serif uppercase tracking-widest text-[var(--athenic-blue)] mb-2 line-clamp-1 group-hover:text-[var(--athenic-gold)] transition-colors">
                    {product.name}
                </h3>

                <div className="flex items-center justify-between">
                    <p className="text-sm md:text-base font-serif font-bold text-[var(--athenic-blue)]">
                        ₹{price.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-0.5">
                        <span className="text-[8px] text-[var(--athenic-gold)]">★</span>
                        <span className="text-[8px] font-serif text-gray-500">4.8</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
