import { Link } from 'react-router-dom';

const ShopCard = ({ shop }) => {
    return (
        <Link
            to={`/shop/${shop._id}`}
            className="card-hover group"
        >
            {/* Shop Image */}
            <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-4">
                <img
                    src={shop.images?.[0] || '/placeholder-shop.png'}
                    alt={shop.shopName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white text-lg drop-shadow-md">
                            {shop.shopName}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Shop Info */}
            <div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[2.5rem]">
                    {shop.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1.5">
                        <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="font-semibold text-gray-900">{shop.rating || '4.0'}</span>
                        <span className="text-gray-400 text-sm">({shop.reviewCount || 0})</span>
                    </div>

                    <span className="text-primary font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                        View →
                    </span>
                </div>

                {/* Category Badge */}
                <div className="badge-primary">
                    {shop.category}
                </div>
            </div>
        </Link>
    );
};

export default ShopCard;
