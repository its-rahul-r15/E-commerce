import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { productService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * SearchBar Component with Autocomplete
 * Search input with debounce and product suggestions
 */
const SearchBar = ({ onSearch, placeholder = 'Search products...' }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions as user types
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setLoading(true);
            try {
                const data = await productService.searchProducts(searchQuery, 1, 5);
                // Backend returns array directly in data, not data.products
                const products = Array.isArray(data) ? data : (data.products || []);
                setSuggestions(products);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Debounced search for main results
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);

    const handleClear = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        onSearch('');
    };

    const handleSuggestionClick = (product) => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        navigate(`/product/${product._id}`);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleSuggestionClick(suggestions[selectedIndex]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="relative max-w-2xl mx-auto" ref={searchRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchQuery.length >= 2 && setSuggestions.length > 0 && setShowSuggestions(true)}
                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full
                             text-gray-900 placeholder-gray-500 
                             focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                             transition-all"
                    placeholder={placeholder}
                />
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                            <span className="ml-2">Searching...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="py-2">
                            {suggestions.map((product, index) => (
                                <button
                                    key={product._id}
                                    onClick={() => handleSuggestionClick(product)}
                                    className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${index === selectedIndex ? 'bg-gray-50' : ''
                                        }`}
                                >
                                    <img
                                        src={product.images?.[0] || '/placeholder-product.png'}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded"
                                        onError={(e) => e.target.src = '/placeholder-product.png'}
                                    />
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ₹{product.discountedPrice || product.price}
                                            {product.discountedPrice && (
                                                <span className="ml-2 text-xs text-gray-400 line-through">
                                                    ₹{product.price}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {product.category}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : searchQuery.length >= 2 ? (
                        <div className="p-4 text-center text-gray-500">
                            No products found for "{searchQuery}"
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
