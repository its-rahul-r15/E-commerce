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
