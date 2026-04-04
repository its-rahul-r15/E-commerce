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
    const [openSection, setOpenSection] = useState('PRODUCT');
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

            <div className={`${isOpen ? 'block' : 'hidden'} lg:block w-full`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[13px] font-bold tracking-widest text-gray-900 uppercase">
                        Filter By
                    </h3>
                    {activeCount > 0 && (
                        <button onClick={handleClear} className="text-[10px] text-[#c34a36] hover:text-red-700 font-semibold uppercase tracking-wider">
                            Clear All
                        </button>
                    )}
                </div>

                {/* Accordions Container */}
                <div className="border-t border-gray-200 mt-4">
                    
                    {/* PRODUCT */}
                    <div className="border-b border-gray-200">
                        <button 
                            className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                            onClick={() => setOpenSection(openSection === 'PRODUCT' ? '' : 'PRODUCT')}
                        >
                            <span className="text-xs font-semibold text-gray-900 uppercase tracking-widest">PRODUCT</span>
                            <span className="text-lg font-light text-gray-400 group-hover:text-black">
                                {openSection === 'PRODUCT' ? '−' : '+'}
                            </span>
                        </button>
                        {openSection === 'PRODUCT' && (
                            <div className="pb-4 space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1 animate-fade-in">
                                {FASHION_CATEGORIES.map(cat => (
                                    <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={filters.categories.includes(cat.value)}
                                            onChange={() => toggleCategory(cat.value)}
                                            className="w-4 h-4 accent-gray-900 rounded border-gray-300 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors uppercase font-medium">{cat.label.replace(/[^a-zA-Z /]/g, '').trim()}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SIZE */}
                    <div className="border-b border-gray-200">
                        <button 
                            className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                            onClick={() => setOpenSection(openSection === 'SIZE' ? '' : 'SIZE')}
                        >
                            <span className="text-xs font-semibold text-gray-900 uppercase tracking-widest">SIZE</span>
                            <span className="text-lg font-light text-gray-400 group-hover:text-black">
                                {openSection === 'SIZE' ? '−' : '+'}
                            </span>
                        </button>
                        {openSection === 'SIZE' && (
                            <div className="pb-4 animate-fade-in">
                                <div className="grid grid-cols-4 gap-2">
                                    {SIZES_CLOTHING.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => toggleSize(size)}
                                            className={`py-2 text-[10px] font-semibold uppercase tracking-wider rounded-sm border transition-all ${
                                                filters.sizes.includes(size)
                                                    ? 'bg-gray-900 border-gray-900 text-white'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLOR */}
                    <div className="border-b border-gray-200">
                        <button 
                            className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                            onClick={() => setOpenSection(openSection === 'COLOR' ? '' : 'COLOR')}
                        >
                            <span className="text-xs font-semibold text-gray-900 uppercase tracking-widest">COLOR</span>
                            <span className="text-lg font-light text-gray-400 group-hover:text-black">
                                {openSection === 'COLOR' ? '−' : '+'}
                            </span>
                        </button>
                        {openSection === 'COLOR' && (
                            <div className="pb-4 animate-fade-in flex flex-wrap gap-3">
                                {COLORS.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => toggleColor(color.name)}
                                        title={color.name}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform p-0.5 ${
                                            filters.colors.includes(color.name) ? 'border-gray-900 scale-110' : 'border-gray-200 hover:scale-110'
                                        }`}
                                    >
                                        <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* OCCASION / STYLE */}
                    <div className="border-b border-gray-200">
                        <button 
                            className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                            onClick={() => setOpenSection(openSection === 'OCCASION' ? '' : 'OCCASION')}
                        >
                            <span className="text-xs font-semibold text-gray-900 uppercase tracking-widest">OCCASION</span>
                            <span className="text-lg font-light text-gray-400 group-hover:text-black">
                                {openSection === 'OCCASION' ? '−' : '+'}
                            </span>
                        </button>
                        {openSection === 'OCCASION' && (
                            <div className="pb-4 space-y-2 animate-fade-in">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="style_filter"
                                        checked={filters.style === ''}
                                        onChange={() => applyFilter({ ...filters, style: '' })}
                                        className="w-4 h-4 accent-gray-900 cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors uppercase font-medium">All</span>
                                </label>
                                {STYLES.map(s => (
                                    <label key={s} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="style_filter"
                                            checked={filters.style === s}
                                            onChange={() => applyFilter({ ...filters, style: s })}
                                            className="w-4 h-4 accent-gray-900 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors uppercase font-medium">{s}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PRICE RANGES */}
                    <div className="border-b border-gray-200">
                        <button 
                            className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                            onClick={() => setOpenSection(openSection === 'PRICE' ? '' : 'PRICE')}
                        >
                            <span className="text-xs font-semibold text-gray-900 uppercase tracking-widest">PRICE RANGE</span>
                            <span className="text-lg font-light text-gray-400 group-hover:text-black">
                                {openSection === 'PRICE' ? '−' : '+'}
                            </span>
                        </button>
                        {openSection === 'PRICE' && (
                            <div className="pb-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <input
                                        type="number"
                                        placeholder="Min ₹"
                                        value={filters.minPrice}
                                        onChange={(e) => applyFilter({ ...filters, minPrice: e.target.value })}
                                        className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-gray-900 text-xs text-gray-800"
                                        min="0"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max ₹"
                                        value={filters.maxPrice}
                                        onChange={(e) => applyFilter({ ...filters, maxPrice: e.target.value })}
                                        className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-gray-900 text-xs text-gray-800"
                                        min="0"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[['Under ₹1K', 0, 1000], ['₹1K - ₹3K', 1000, 3000], ['₹3K+', 3000, '']].map(([label, min, max]) => (
                                        <button
                                            key={label}
                                            onClick={() => applyFilter({ ...filters, minPrice: String(min), maxPrice: String(max) })}
                                            className="text-[10px] px-3 py-1.5 border border-gray-200 text-gray-600 font-semibold uppercase tracking-wide hover:bg-gray-50 transition-colors"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Mobile Apply */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden mt-6 w-full py-3 bg-gray-900 text-white font-semibold text-xs tracking-widest uppercase shadow-md"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default FilterPanel;
