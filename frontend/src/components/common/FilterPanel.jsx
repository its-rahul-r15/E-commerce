import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

/**
 * FilterPanel Component
 * Product filtering by category, price, and sorting
 */
const FilterPanel = ({ onFilterChange, onClearFilters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        categories: [],
        minPrice: '',
        maxPrice: '',
        sort: '',
        brand: '',
        style: '',
        sizes: '',
        colors: '',
    });

    const categories = [
        'Electronics',
        'Fashion',
        'Home & Kitchen',
        'Books',
        'Sports',
        'Toys',
        'Beauty',
        'Grocery',
        'Other',
    ];

    const sortOptions = [
        { value: '', label: 'Default' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' },
        { value: 'newest', label: 'Newest First' },
    ];

    const handleCategoryChange = (category) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter(c => c !== category)
            : [...filters.categories, category];

        const newFilters = { ...filters, categories: newCategories };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handlePriceChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSortChange = (value) => {
        const newFilters = { ...filters, sort: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClear = () => {
        const emptyFilters = {
            categories: [],
            minPrice: '',
            maxPrice: '',
            sort: '',
            brand: '',
            style: '',
            sizes: '',
            colors: '',
        };
        setFilters(emptyFilters);
        onClearFilters();
    };

    const activeFiltersCount =
        filters.categories.length +
        (filters.minPrice ? 1 : 0) +
        (filters.maxPrice ? 1 : 0) +
        (filters.sort ? 1 : 0);

    return (
        <div>
            {/* Mobile Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mb-4"
            >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            <div className={`
                ${isOpen ? 'block' : 'hidden'} lg:block
                bg-white rounded-lg shadow-sm p-6 mb-6 lg:mb-0
            `}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        Filters
                    </h3>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={handleClear}
                            className="text-sm text-primary hover:text-primary-dark font-medium"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Sort */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            value={filters.sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categories
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {categories.map(category => (
                                <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category)}
                                        onChange={() => handleCategoryChange(category)}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price Range (₹)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    min="0"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Brand */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                        <input
                            type="text"
                            placeholder="Search Brand"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={(e) => onFilterChange({ ...filters, brand: e.target.value })}
                        />
                    </div>

                    {/* Style */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                        <input
                            type="text"
                            placeholder="e.g. Casual, Formal"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={(e) => onFilterChange({ ...filters, style: e.target.value })}
                        />
                    </div>

                    {/* Common Sizes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                        <div className="flex flex-wrap gap-2">
                            {['S', 'M', 'L', 'XL', 'XXL', 'UK 7', 'UK 8', 'UK 9'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        const currentSizes = filters.sizes ? filters.sizes.split(',') : [];
                                        const newSizes = currentSizes.includes(size)
                                            ? currentSizes.filter(s => s !== size)
                                            : [...currentSizes, size];
                                        onFilterChange({ ...filters, sizes: newSizes.join(',') });
                                    }}
                                    className={`px-3 py-1 text-xs border rounded-full ${filters.sizes?.split(',').includes(size)
                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Common Colors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        const currentColors = filters.colors ? filters.colors.split(',') : [];
                                        const newColors = currentColors.includes(color)
                                            ? currentColors.filter(c => c !== color)
                                            : [...currentColors, color];
                                        onFilterChange({ ...filters, colors: newColors.join(',') });
                                    }}
                                    className={`w-6 h-6 rounded-full border shadow-sm ${filters.colors?.split(',').includes(color)
                                        ? 'ring-2 ring-offset-1 ring-emerald-500'
                                        : 'hover:scale-110'
                                        }`}
                                    style={{ backgroundColor: color.toLowerCase() }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden w-full mt-6 btn-primary"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default FilterPanel;
