/**
 * ProductSelector.jsx
 * Horizontal scrollable strip of clothing products.
 * Fetches seller-uploaded products from the API, falling back to demo items.
 */
import { useState, useEffect } from 'react';
import { productService } from '../../services/api';

// Fallback demo items in case API returns no clothing products
const DEMO_ITEMS = [
    {
        _id: 'demo-1',
        name: 'Classic T-Shirt',
        category: 'T-Shirts',
        price: 799,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80'],
    },
    {
        _id: 'demo-2',
        name: 'Formal Shirt',
        category: 'Shirts',
        price: 1299,
        images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=200&q=80'],
    },
    {
        _id: 'demo-3',
        name: 'Ethnic Kurta',
        category: 'Ethnic',
        price: 1899,
        images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&q=80'],
    },
    {
        _id: 'demo-4',
        name: 'Business Suit',
        category: 'Formals',
        price: 4999,
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&q=80'],
    },
    {
        _id: 'demo-5',
        name: 'Polo T-Shirt',
        category: 'T-Shirts',
        price: 999,
        images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200&q=80'],
    },
];

const ProductSelector = ({ selectedProduct, onSelect }) => {
    const [products, setProducts] = useState(DEMO_ITEMS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClothingProducts = async () => {
            try {
                const data = await productService.getProducts({ limit: 100 });
                const allItems = data.data || data.products || [];

                // ✅ Only show products with a try-on image uploaded by the seller
                const tryOnItems = allItems.filter(item => item.tryOnImage);

                console.log(`[ProductSelector] ${tryOnItems.length} AR-ready products out of ${allItems.length}`);

                if (tryOnItems.length > 0) {
                    setProducts(tryOnItems); // Only AR-ready products
                }
                // If no AR-ready products, keep DEMO_ITEMS as placeholder
            } catch (err) {
                console.warn('[ProductSelector] API error, using demo items:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClothingProducts();
    }, []);

    return (
        <div className="bg-white border-t border-[var(--athenic-gold)] border-opacity-30">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                <div>
                    <h3 className="font-serif text-[11px] tracking-[0.25em] uppercase text-[var(--athenic-blue)]">
                        Select Garment
                    </h3>
                    <p className="text-[9px] font-serif text-gray-400 mt-0.5 tracking-widest uppercase">
                        {products.length} pieces available
                        {products.filter(p => p.tryOnImage).length > 0 && (
                            <span className="ml-2 text-[var(--athenic-gold)]">· {products.filter(p => p.tryOnImage).length} AR-ready ✨</span>
                        )}
                    </p>
                </div>
                {selectedProduct && (
                    <div className="text-right">
                        <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400">Wearing</p>
                        <p className="text-[11px] font-serif text-[var(--athenic-gold)] truncate max-w-[120px]">
                            {selectedProduct.name}
                        </p>
                    </div>
                )}
            </div>

            {/* Horizontal Scroll Strip */}
            <div className="px-4 pb-5 overflow-x-auto no-scrollbar">
                <div className="flex space-x-3" style={{ width: 'max-content' }}>
                    {loading
                        ? Array(5).fill(null).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-20 h-28 bg-gray-100 animate-pulse rounded-sm" />
                        ))
                        : products.map((product) => {
                            const isSelected = selectedProduct?._id === product._id;
                            const imageUrl = product.images?.[0] || '';
                            const price = product.discountedPrice || product.price;

                            return (
                                <button
                                    key={product._id}
                                    onClick={() => onSelect(product)}
                                    className={`flex-shrink-0 w-20 flex flex-col items-center rounded-sm overflow-hidden border-2 transition-all duration-200 ${isSelected
                                        ? 'border-[var(--athenic-gold)] shadow-md scale-105'
                                        : 'border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    {/* Product Thumbnail */}
                                    <div className="w-20 h-24 bg-gray-50 overflow-hidden relative">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">
                                                👕
                                            </div>
                                        )}
                                        {/* AR-ready badge (has tryOnImage) */}
                                        {product.tryOnImage && (
                                            <div className="absolute top-1 left-1 bg-[var(--athenic-gold)] text-white text-[7px] px-1 py-0.5 font-serif uppercase tracking-wide leading-none">
                                                ✨AR
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-[var(--athenic-gold)] bg-opacity-15 flex items-center justify-center">
                                                <span className="text-base">✓</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="w-full px-1 py-1.5 bg-white text-center">
                                        <p className="text-[8px] font-serif capitalize leading-tight text-[var(--athenic-blue)] truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-[8px] font-serif text-[var(--athenic-gold)] mt-0.5">
                                            ₹{price?.toLocaleString?.() ?? price}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default ProductSelector;
