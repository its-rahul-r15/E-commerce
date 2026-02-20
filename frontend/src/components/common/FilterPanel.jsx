import { FunnelIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

// ── Shared fashion constants (same as AddEditProduct) ─────────────────────────
const FASHION_CATEGORIES = [
    { value: 'Kurta', label: '🥻 Kurta / Kurti' },
    { value: 'Saree', label: '🥻 Saree' },
    { value: 'Lehenga', label: '👗 Lehenga' },
    { value: 'Salwar Suit', label: '👘 Salwar Suit' },
    { value: 'Dupatta', label: '🧣 Dupatta / Stole' },
    { value: 'Shirt', label: '👔 Shirt / Top' },
    { value: 'Top', label: '👕 Top / Blouse' },
    { value: 'Dress', label: '👗 Dress / Gown' },
    { value: 'Jacket', label: '🧥 Jacket / Blazer' },
    { value: 'Trouser', label: '👖 Trouser / Jeans' },
    { value: 'Sherwani', label: '🎩 Sherwani' },
    { value: 'Accessories', label: '💍 Accessories' },
    { value: 'Ethnic Wear', label: '🪡 Ethnic Wear' },
    { value: 'Western Wear', label: '🌟 Western Wear' },
];

const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const SIZES_NUMERIC = ['28', '30', '32', '34', '36', '38', '40', '42'];

const STYLES = ['Casual', 'Formal', 'Party Wear', 'Festive', 'Bridal', 'Wedding', 'Office Wear', 'Traditional', 'Indo-Western'];

const COLORS = [
    { name: 'Red', hex: '#DC2626' }, { name: 'Maroon', hex: '#7F1D1D' },
    { name: 'Pink', hex: '#EC4899' }, { name: 'Peach', hex: '#FFCBA4' },
    { name: 'Orange', hex: '#F97316' }, { name: 'Yellow', hex: '#EAB308' },
    { name: 'Mustard', hex: '#CA8A04' }, { name: 'Green', hex: '#16A34A' },
    { name: 'Mint', hex: '#6EE7B7' }, { name: 'Teal', hex: '#0D9488' },
    { name: 'Blue', hex: '#2563EB' }, { name: 'Navy', hex: '#1E3A5F' },
    { name: 'Purple', hex: '#9333EA' }, { name: 'Lavender', hex: '#C4B5FD' },
    { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' },
    { name: 'Grey', hex: '#9CA3AF' }, { name: 'Beige', hex: '#D4B896' },
    { name: 'Cream', hex: '#FFFDD0' }, { name: 'Brown', hex: '#92400E' },
    { name: 'Gold', hex: '#D4AF37' }, { name: 'Silver', hex: '#C0C0C0' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const FilterPanel = ({ onFilterChange, onClearFilters, initialFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        categories: initialFilters.categories || [],
        minPrice: initialFilters.minPrice || '',
        maxPrice: initialFilters.maxPrice || '',
        sort: initialFilters.sort || '',
        style: initialFilters.style || '',
        sizes: initialFilters.sizes || [],
        colors: initialFilters.colors || [],
    });

    // Sync state if initialFilters change from parent
    useEffect(() => {
        if (Object.keys(initialFilters).length > 0) {
            setFilters(prev => ({
                ...prev,
                ...initialFilters,
                categories: initialFilters.categories || prev.categories,
                sizes: initialFilters.sizes || prev.sizes,
                colors: initialFilters.colors || prev.colors,
            }));
        }
    }, [initialFilters]);

    const applyFilter = (updated) => {
        setFilters(updated);
        onFilterChange(updated);
    };

    const toggleCategory = (val) => {
        const next = filters.categories.includes(val)
            ? filters.categories.filter(c => c !== val)
            : [...filters.categories, val];
        applyFilter({ ...filters, categories: next });
    };

    const toggleSize = (size) => {
        const next = filters.sizes.includes(size)
            ? filters.sizes.filter(s => s !== size)
            : [...filters.sizes, size];
        applyFilter({ ...filters, sizes: next });
    };

    const toggleColor = (color) => {
        const next = filters.colors.includes(color)
            ? filters.colors.filter(c => c !== color)
            : [...filters.colors, color];
        applyFilter({ ...filters, colors: next });
    };

    const handleClear = () => {
        const empty = { categories: [], minPrice: '', maxPrice: '', sort: '', style: '', sizes: [], colors: [] };
        setFilters(empty);
        onClearFilters();
    };

    const activeCount =
        filters.categories.length + filters.sizes.length + filters.colors.length +
        (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) +
        (filters.sort ? 1 : 0) + (filters.style ? 1 : 0);

    return (
        <div>
            {/* Mobile toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mb-4"
            >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
                {activeCount > 0 && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
                )}
            </button>

            <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-6`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-emerald-500" /> Filters
                        {activeCount > 0 && (
                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
                        )}
                    </h3>
                    {activeCount > 0 && (
                        <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 font-medium">
                            Clear All
                        </button>
                    )}
                </div>

                {/* Sort */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                    <select
                        value={filters.sort}
                        onChange={(e) => applyFilter({ ...filters, sort: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                        <option value="">Default</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>

                {/* Categories */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                        {FASHION_CATEGORIES.map(cat => (
                            <label key={cat.value} className="flex items-center gap-2 cursor-pointer hover:bg-emerald-50 px-2 py-1.5 rounded-lg transition-colors">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(cat.value)}
                                    onChange={() => toggleCategory(cat.value)}
                                    className="w-4 h-4 accent-emerald-500 rounded"
                                />
                                <span className="text-sm text-gray-700">{cat.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (₹)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            placeholder="Min ₹"
                            value={filters.minPrice}
                            onChange={(e) => applyFilter({ ...filters, minPrice: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Max ₹"
                            value={filters.maxPrice}
                            onChange={(e) => applyFilter({ ...filters, maxPrice: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            min="0"
                        />
                    </div>
                    {/* Quick price presets */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {[['Under ₹500', 0, 500], ['₹500-1500', 500, 1500], ['₹1500-3000', 1500, 3000], ['₹3000+', 3000, '']].map(([label, min, max]) => (
                            <button
                                key={label}
                                onClick={() => applyFilter({ ...filters, minPrice: String(min), maxPrice: String(max) })}
                                className="text-xs px-2 py-1 border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-50 transition-colors"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Style / Occasion */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Style / Occasion</label>
                    <select
                        value={filters.style}
                        onChange={(e) => applyFilter({ ...filters, style: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                        <option value="">All Occasions</option>
                        {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Sizes */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Size
                        {filters.sizes.length > 0 && (
                            <span className="ml-1 text-emerald-600 text-xs">({filters.sizes.length} selected)</span>
                        )}
                    </label>
                    <p className="text-xs text-gray-400 mb-1">Clothing</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {SIZES_CLOTHING.map(size => (
                            <button
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${filters.sizes.includes(size)
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">Numeric</p>
                    <div className="flex flex-wrap gap-1.5">
                        {SIZES_NUMERIC.map(size => (
                            <button
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${filters.sizes.includes(size)
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colors */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Color
                        {filters.colors.length > 0 && (
                            <span className="ml-1 text-emerald-600 text-xs">({filters.colors.join(', ')})</span>
                        )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map(color => (
                            <button
                                key={color.name}
                                onClick={() => toggleColor(color.name)}
                                title={color.name}
                                className="flex flex-col items-center gap-0.5"
                            >
                                <div
                                    className={`w-7 h-7 rounded-full border-2 transition-all ${filters.colors.includes(color.name)
                                        ? 'border-emerald-500 scale-110 shadow-md'
                                        : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                    style={{ backgroundColor: color.hex }}
                                />
                                <span className={`text-[9px] font-medium leading-tight ${filters.colors.includes(color.name) ? 'text-emerald-600' : 'text-gray-400'
                                    }`}>{color.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Apply */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden w-full py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default FilterPanel;
