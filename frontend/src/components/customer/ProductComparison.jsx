import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, cartService } from '../../services/api';
import { generateProductComparison } from '../../services/aiService';

const ProductComparison = ({ productId, isOpen, onClose }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [userPreferences, setUserPreferences] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && productId) {
            fetchComparison();
        }
    }, [isOpen, productId]);

    const fetchComparison = async () => {
        setLoading(true);
        setError('');
        setAiInsights(null);
        try {
            const data = await productService.getPersonalizedComparison(productId);
            setCurrentProduct(data.currentProduct);
            setSimilarProducts(data.similarProducts || []);
            setUserPreferences(data.userPreferences);

            // Generate AI insights
            if (data.similarProducts?.length > 0) {
                setAiLoading(true);
                try {
                    const insights = await generateProductComparison(
                        data.currentProduct,
                        data.similarProducts,
                        data.userPreferences
                    );
                    setAiInsights(insights);
                } catch {
                    // AI insights are optional
                } finally {
                    setAiLoading(false);
                }
            }
        } catch (err) {
            console.error('Comparison error:', err);
            setError('Could not load comparison. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (id) => {
        setAddingToCart(id);
        try {
            await cartService.addToCart(id, 1);
            alert('Added to wardrobe! ✨');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add');
        } finally {
            setAddingToCart(null);
        }
    };

    if (!isOpen) return null;

    const prefType = userPreferences?.type || 'balanced';
    const prefIcon = prefType === 'quality' ? '⭐' : prefType === 'price' ? '💰' : '⚖️';
    const prefLabel = prefType === 'quality' ? 'Quality Connoisseur' : prefType === 'price' ? 'Smart Saver' : 'Balanced Shopper';
    const prefDescription = prefType === 'quality'
        ? 'You tend to invest in premium, high-quality products'
        : prefType === 'price'
            ? 'You\'re great at finding the best deals and value'
            : 'You balance quality and price beautifully';

    const getEffectivePrice = (p) => p.discountedPrice || p.price;
    const getDiscount = (p) => p.discountedPrice ? Math.round(((p.price - p.discountedPrice) / p.price) * 100) : 0;

    // Find the AI verdict for a product
    const getVerdict = (productName) => {
        if (!aiInsights?.productAnalysis) return null;
        return aiInsights.productAnalysis.find(a =>
            a.name?.toLowerCase() === productName?.toLowerCase()
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-start justify-center overflow-y-auto py-8 px-4">
            <div className="bg-white w-full max-w-5xl shadow-2xl border border-[var(--athenic-gold)] border-opacity-20 animate-slide-up my-auto">

                {/* Header */}
                <div className="bg-[var(--athenic-blue)] px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 8px gold)' }}>⚖️</span>
                        <div>
                            <h2 className="text-sm font-serif uppercase tracking-[0.25em] text-white">
                                Personalized Comparison
                            </h2>
                            <p className="text-[9px] font-serif text-white/50 tracking-widest uppercase mt-1">
                                Curated by Naitri AI based on your style
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--athenic-gold)] border-t-transparent"></div>
                        <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-gray-400">
                            Analyzing your shopping style...
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="py-16 text-center">
                        <p className="text-sm text-red-400 font-serif">{error}</p>
                        <button onClick={fetchComparison} className="mt-4 text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-gold)] border-b border-[var(--athenic-gold)] pb-0.5">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && currentProduct && (
                    <div className="p-6 md:p-8 space-y-8">

                        {/* User Profile Badge */}
                        {userPreferences && userPreferences.totalOrders > 0 && (
                            <div className="flex items-center justify-between p-5 border border-[var(--athenic-gold)] border-opacity-20 bg-gradient-to-r from-[var(--athenic-bg)] to-white">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 border-2 border-[var(--athenic-gold)] flex items-center justify-center text-2xl bg-white shadow-sm">
                                        {prefIcon}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-serif uppercase tracking-[0.2em] text-[var(--athenic-blue)] font-bold">
                                            You're a {prefLabel}
                                        </h3>
                                        <p className="text-[9px] font-serif text-gray-500 tracking-wide mt-1">
                                            {prefDescription} • Based on {userPreferences.totalOrders} orders
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right hidden md:block">
                                    <p className="text-[8px] font-serif text-gray-400 uppercase tracking-widest">Avg Spend</p>
                                    <p className="text-lg font-serif text-[var(--athenic-gold)]">₹{(userPreferences.avgSpend || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {/* Guest user badge */}
                        {(!userPreferences || userPreferences.totalOrders === 0) && (
                            <div className="flex items-center space-x-3 p-4 bg-[var(--athenic-bg)] border border-gray-100">
                                <span className="text-xl">🔍</span>
                                <p className="text-[10px] font-serif text-gray-500 tracking-wide">
                                    Generic comparison shown. Place a few orders for personalized AI recommendations!
                                </p>
                            </div>
                        )}

                        {/* AI Recommendation Banner */}
                        {(aiInsights?.recommendation || aiLoading) && (
                            <div className="relative p-5 bg-gradient-to-r from-[#0a0a0e] to-[#1a1a2e] text-white overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--athenic-gold)] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="flex items-start space-x-3">
                                    <span className="text-xl mt-0.5" style={{ filter: 'drop-shadow(0 0 4px gold)' }}>🤖</span>
                                    <div>
                                        <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-gold)] mb-2">
                                            Naitri AI Recommendation
                                        </h4>
                                        {aiLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-1.5 h-1.5 bg-[var(--athenic-gold)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                                <span className="text-[9px] font-serif text-white/40 uppercase tracking-widest">Generating insights...</span>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] font-serif text-white/80 leading-relaxed">
                                                {aiInsights?.recommendation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comparison Table */}
                        {similarProducts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-[var(--athenic-gold)] border-opacity-30">
                                            <th className="text-left py-4 px-3 text-[9px] font-serif uppercase tracking-[0.2em] text-gray-400 w-16">
                                            </th>
                                            {/* Current Product Header */}
                                            <th className="py-4 px-3 text-center min-w-[160px]">
                                                <div className="relative">
                                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] bg-white px-2">
                                                        Current
                                                    </div>
                                                    <div className="border-2 border-[var(--athenic-gold)] border-opacity-40 p-3 bg-[var(--athenic-bg)]">
                                                        <div className="w-16 h-20 mx-auto mb-2 overflow-hidden bg-white">
                                                            <img
                                                                src={currentProduct.images?.[0] || '/placeholder.png'}
                                                                alt={currentProduct.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <p className="text-[9px] font-serif uppercase tracking-wide text-[var(--athenic-blue)] truncate font-bold">
                                                            {currentProduct.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </th>
                                            {/* Alternative Product Headers */}
                                            {similarProducts.slice(0, 4).map((p) => (
                                                <th key={p._id} className="py-4 px-3 text-center min-w-[160px]">
                                                    <div className="border border-gray-100 p-3 hover:border-[var(--athenic-gold)] hover:border-opacity-40 transition-colors cursor-pointer"
                                                        onClick={() => navigate(`/product/${p._id}`)}>
                                                        <div className="w-16 h-20 mx-auto mb-2 overflow-hidden bg-white">
                                                            <img
                                                                src={p.images?.[0] || '/placeholder.png'}
                                                                alt={p.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <p className="text-[9px] font-serif uppercase tracking-wide text-[var(--athenic-blue)] truncate">
                                                            {p.name}
                                                        </p>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Price Row */}
                                        <tr className={`border-b border-gray-50 ${prefType === 'price' ? 'bg-green-50/30' : ''}`}>
                                            <td className="py-3 px-3 text-[9px] font-serif uppercase tracking-[0.15em] text-gray-400 flex items-center space-x-1">
                                                <span>{prefType === 'price' ? '🎯' : '💰'}</span>
                                                <span>Price</span>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className="text-sm font-serif font-bold text-[var(--athenic-blue)]">
                                                    ₹{getEffectivePrice(currentProduct).toLocaleString()}
                                                </span>
                                                {getDiscount(currentProduct) > 0 && (
                                                    <span className="block text-[8px] font-serif text-green-600 mt-0.5">
                                                        {getDiscount(currentProduct)}% off
                                                    </span>
                                                )}
                                            </td>
                                            {similarProducts.slice(0, 4).map(p => {
                                                const diff = getEffectivePrice(p) - getEffectivePrice(currentProduct);
                                                return (
                                                    <td key={p._id} className="py-3 px-3 text-center">
                                                        <span className="text-sm font-serif font-bold text-[var(--athenic-blue)]">
                                                            ₹{getEffectivePrice(p).toLocaleString()}
                                                        </span>
                                                        {diff !== 0 && (
                                                            <span className={`block text-[8px] font-serif mt-0.5 ${diff < 0 ? 'text-green-600' : 'text-red-400'}`}>
                                                                {diff < 0 ? `₹${Math.abs(diff)} less` : `₹${diff} more`}
                                                            </span>
                                                        )}
                                                        {getDiscount(p) > 0 && (
                                                            <span className="block text-[8px] font-serif text-green-600">
                                                                {getDiscount(p)}% off
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {/* Brand Row */}
                                        <tr className={`border-b border-gray-50 ${prefType === 'quality' ? 'bg-amber-50/30' : ''}`}>
                                            <td className="py-3 px-3 text-[9px] font-serif uppercase tracking-[0.15em] text-gray-400 flex items-center space-x-1">
                                                <span>{prefType === 'quality' ? '🎯' : '🏷️'}</span>
                                                <span>Brand</span>
                                            </td>
                                            <td className="py-3 px-3 text-center text-[10px] font-serif text-[var(--athenic-blue)]">
                                                {currentProduct.brand || '—'}
                                            </td>
                                            {similarProducts.slice(0, 4).map(p => (
                                                <td key={p._id} className="py-3 px-3 text-center text-[10px] font-serif text-[var(--athenic-blue)]">
                                                    {p.brand || '—'}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Category Row */}
                                        <tr className="border-b border-gray-50">
                                            <td className="py-3 px-3 text-[9px] font-serif uppercase tracking-[0.15em] text-gray-400">
                                                📂 Category
                                            </td>
                                            <td className="py-3 px-3 text-center text-[10px] font-serif text-[var(--athenic-blue)]">
                                                {currentProduct.category}
                                            </td>
                                            {similarProducts.slice(0, 4).map(p => (
                                                <td key={p._id} className="py-3 px-3 text-center text-[10px] font-serif text-[var(--athenic-blue)]">
                                                    {p.category}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Colors Row */}
                                        <tr className="border-b border-gray-50">
                                            <td className="py-3 px-3 text-[9px] font-serif uppercase tracking-[0.15em] text-gray-400">
                                                🎨 Colors
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <div className="flex justify-center space-x-1">
                                                    {(currentProduct.colors || []).slice(0, 3).map(c => (
                                                        <div key={c} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c.toLowerCase() }} title={c}></div>
                                                    ))}
                                                    {(!currentProduct.colors || currentProduct.colors.length === 0) && <span className="text-[10px] text-gray-300">—</span>}
                                                </div>
                                            </td>
                                            {similarProducts.slice(0, 4).map(p => (
                                                <td key={p._id} className="py-3 px-3 text-center">
                                                    <div className="flex justify-center space-x-1">
                                                        {(p.colors || []).slice(0, 3).map(c => (
                                                            <div key={c} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c.toLowerCase() }} title={c}></div>
                                                        ))}
                                                        {(!p.colors || p.colors.length === 0) && <span className="text-[10px] text-gray-300">—</span>}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Sizes Row */}
                                        <tr className="border-b border-gray-50">
                                            <td className="py-3 px-3 text-[9px] font-serif uppercase tracking-[0.15em] text-gray-400">
                                                📐 Sizes
                                            </td>
                                            <td className="py-3 px-3 text-center text-[9px] font-serif text-[var(--athenic-blue)]">
                                                {(currentProduct.sizes || []).join(', ') || '—'}
                                            </td>
                                            {similarProducts.slice(0, 4).map(p => (
                                                <td key={p._id} className="py-3 px-3 text-center text-[9px] font-serif text-[var(--athenic-blue)]">
                                                    {(p.sizes || []).join(', ') || '—'}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Shop Row */}
                                        <tr className="border-b border-gray-50">
                                            <td className="py-3 px-3 text-[9px] font-serif uppercase tracking-[0.15em] text-gray-400">
                                                🏛️ Shop
                                            </td>
                                            <td className="py-3 px-3 text-center text-[10px] font-serif text-[var(--athenic-blue)]">
                                                {currentProduct.shopId?.shopName || '—'}
                                            </td>
                                            {similarProducts.slice(0, 4).map(p => (
                                                <td key={p._id} className="py-3 px-3 text-center text-[10px] font-serif text-[var(--athenic-blue)]">
                                                    {p.shopId?.shopName || '—'}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* AI Verdict Row */}
                                        {aiInsights?.productAnalysis && (
                                            <tr className="border-b border-[var(--athenic-gold)] border-opacity-20 bg-[var(--athenic-bg)]">
                                                <td className="py-3 px-3 text-[9px] font-serif uppercase tracking-[0.15em] text-[var(--athenic-gold)]">
                                                    🤖 AI Verdict
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className="text-[9px] font-serif text-[var(--athenic-gold)] italic">
                                                        Your current pick ✓
                                                    </span>
                                                </td>
                                                {similarProducts.slice(0, 4).map(p => {
                                                    const verdict = getVerdict(p.name);
                                                    return (
                                                        <td key={p._id} className="py-3 px-3 text-center">
                                                            <span className="text-[9px] font-serif text-gray-600 italic">
                                                                {verdict?.verdict || '—'}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        )}

                                        {/* Actions Row */}
                                        <tr>
                                            <td className="py-4 px-3"></td>
                                            <td className="py-4 px-3 text-center">
                                                <span className="text-[8px] font-serif uppercase tracking-widest text-[var(--athenic-gold)]">
                                                    Currently Viewing
                                                </span>
                                            </td>
                                            {similarProducts.slice(0, 4).map(p => (
                                                <td key={p._id} className="py-4 px-3 text-center space-y-2">
                                                    <button
                                                        onClick={() => handleAddToCart(p._id)}
                                                        disabled={addingToCart === p._id}
                                                        className="w-full py-2 text-[8px] font-serif uppercase tracking-widest bg-[var(--athenic-blue)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                                    >
                                                        {addingToCart === p._id ? '...' : '+ Wardrobe'}
                                                    </button>
                                                    <button
                                                        onClick={() => { onClose(); navigate(`/product/${p._id}`); }}
                                                        className="w-full py-2 text-[8px] font-serif uppercase tracking-widest border border-gray-200 text-gray-500 hover:border-[var(--athenic-gold)] hover:text-[var(--athenic-gold)] transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <span className="text-4xl mb-4 block">🏛️</span>
                                <p className="text-[10px] font-serif uppercase tracking-[0.3em] text-gray-400">
                                    No similar products found for comparison
                                </p>
                                <p className="text-[9px] font-serif text-gray-300 mt-2 tracking-wide">
                                    This piece is truly one of a kind!
                                </p>
                            </div>
                        )}

                        {/* Preference Breakdown (mini) */}
                        {userPreferences && userPreferences.totalOrders > 0 && (
                            <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-[8px] font-serif uppercase tracking-widest text-gray-300">
                                <span>Quality Weight: {userPreferences.qualityWeight}%</span>
                                <div className="flex-1 mx-4 h-1.5 bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-700"
                                        style={{
                                            width: `${userPreferences.qualityWeight}%`,
                                            background: 'linear-gradient(90deg, #C5A55F, #0a0a0e)',
                                        }}
                                    ></div>
                                </div>
                                <span>Price Weight: {userPreferences.priceWeight}%</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductComparison;
