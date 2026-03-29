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
            className="group block relative w-full"
        >
            {/* Image Container with Hover Effect */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-3 group-hover:shadow-lg transition-shadow">
                <img
                    src={product.images?.[0] || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Status Badges */}
                {product.stock === 0 ? (
                    <div className="absolute top-0 left-0 bg-gray-900 text-white text-[10px] uppercase font-semibold px-4 py-1.5 tracking-wider">
                        SOLD OUT
                    </div>
                ) : product.discountedPrice && product.discountedPrice < product.price && (
                    <div className="absolute top-0 left-0 bg-[#c34a36] text-white text-[10px] uppercase font-semibold px-4 py-1.5 tracking-wider">
                        SALE
                    </div>
                )}
                
                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistClick}
                    className="absolute top-3 right-3 z-10 p-1 text-gray-900 hover:text-red-500 hover:scale-110 transition-transform bg-transparent"
                >
                    {isSaved ? (
                        <HeartSolid className="w-5 h-5 text-[#c34a36]" />
                    ) : (
                        <HeartOutline className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]" strokeWidth={1.5} />
                    )}
                </button>
            </div>

            {/* Product Metadata */}
            <div className="px-1 text-left">
                <h3 className="text-xs text-gray-800 font-medium line-clamp-1 mb-1 group-hover:text-gray-500 transition-colors uppercase pr-2">
                    {product.name}
                </h3>

                <div className="flex items-baseline space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                        ₹{price.toLocaleString()}
                    </span>
                    {product.discountedPrice && product.discountedPrice < product.price && (
                        <span className="text-[10px] text-gray-400 line-through font-medium">
                            ₹{product.price.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
