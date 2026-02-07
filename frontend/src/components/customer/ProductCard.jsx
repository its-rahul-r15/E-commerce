import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const price = product.discountedPrice || product.price;
    const originalPrice = product.discountedPrice ? product.price : null;
    const discount = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <Link
            to={`/product/${product._id}`}
            className="product-card group"
        >
            {/* Image */}
            <div className="relative overflow-hidden bg-gray-100">
                <img
                    src={product.images?.[0] || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
                {discount > 0 && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-lg text-sm font-semibold shadow-sm">
                        {discount}% OFF
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem]">
                    {product.name}
                </h3>

                {/* Shop Name */}
                <p className="text-sm text-gray-500 mb-3">
                    {product.shopId?.shopName || 'Shop'}
                </p>

                {/* Price */}
                <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                        ₹{price}
                    </span>
                    {originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{originalPrice}
                        </span>
                    )}
                </div>

                {/* Stock Status */}
                {product.stock < 10 && product.stock > 0 && (
                    <div className="badge-warning">
                        Only {product.stock} left
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="badge-danger">
                        Out of stock
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
