import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const categoriesData = [
    {
        name: 'WOMEN',
        subcategories: [
            {
                title: 'Sarees',
                items: ['Silk', 'Cotton', 'Designer Party wear']
            },
            {
                title: 'Salwar Suits',
                items: ['Anarkali', 'Straight Cut', 'Palazzo Suits', 'Churidar Sets']
            },
            {
                title: 'Lehengas',
                items: ['Bridal Lehenga', 'Festive Lehenga', 'Indo-western Lehenga']
            },
            {
                title: 'Kurtis',
                items: ['Daily wear kurtis', 'Office wear', 'A-line / Straight']
            },
            {
                title: 'Dupatta & Stoles',
                items: []
            }
        ]
    },
    {
        name: 'MEN',
        subcategories: [
            {
                title: 'Kurta Set',
                items: ['Cotton Kurta', 'Festive', 'Pathani']
            },
            {
                title: 'Sherwanis',
                items: ['Wedding', 'Indo-western']
            },
            {
                title: 'Formal',
                items: ['Pant', 'Shirts', 'Jackets']
            }
        ]
    },
    {
        name: 'KIDS',
        subcategories: [
            {
                title: 'Kids Collection',
                items: ['Boys Kurta set', 'Girls Lehengas', 'Kids sarees']
            }
        ]
    },
    {
        name: 'WEDDING',
        subcategories: [
            {
                title: 'Wedding Collections',
                items: ['Bride', 'Groom', 'Bridesmaids', 'Family wear', 'Mehandi', 'Haldi']
            }
        ]
    },
    {
        name: 'COUPLES',
        subcategories: [
            {
                title: 'Matching Sets',
                items: ['Couple Kurta Sets', 'Festive Combos']
            }
        ]
    }
];

const CategoryNav = () => {
    const [hoveredCategory, setHoveredCategory] = useState(null);

    return (
        <div className="hidden lg:block shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-7xl mx-auto px-4">
                <ul className="flex justify-center space-x-12">
                    {categoriesData.map((category) => (
                        <li
                            key={category.name}
                            className="group"
                            onMouseEnter={() => setHoveredCategory(category.name)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            <div className="py-4">
                                <Link
                                    to={`/products?category=${encodeURIComponent(category.name)}`}
                                    className={`text-[11px] font-serif tracking-widest font-semibold uppercase whitespace-nowrap cursor-pointer transition-all duration-300 ${hoveredCategory === category.name ? 'text-[var(--athenic-gold)] ' : 'text-white  hover:text-[var(--athenic-gold)]'}`}
                                >
                                    {category.name}
                                </Link>
                            </div>

                            {/* Dropdown / Mega Menu */}
                            {category.subcategories && category.subcategories.length > 0 && (
                                <div
                                    className={`absolute left-0 w-full bg-white/5 shadow-xl transition-all duration-300 ease-in-out border-t border-[var(--athenic-gold)] border-opacity-20 z-50 ${hoveredCategory === category.name
                                        ? 'opacity-100 visible translate-y-0'
                                        : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                                        }`}
                                    style={{ top: '100%' }}
                                >
                                    <div className="max-w-7xl mx-auto px-8 py-10">
                                        <div className="flex gap-16 justify-center">
                                            {category.subcategories.map((subcat, idx) => (
                                                <div key={idx} className="flex flex-col min-w-[160px]">
                                                    <h3 className="text-sm font-serif font-bold text-[var(--athenic-blue)] mb-4 border-b border-gray-100 pb-2 uppercase tracking-wider">
                                                        {subcat.title}
                                                    </h3>
                                                    <ul className="space-y-3">
                                                        {subcat.items.map((item, itemIdx) => (
                                                            <li key={itemIdx} className="group/item flex items-center">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--athenic-gold)] opacity-0 group-hover/item:opacity-100 transition-opacity mr-2"></span>
                                                                <Link
                                                                    to={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(subcat.title)}&item=${encodeURIComponent(item)}`}
                                                                    className="text-xs font-serif text-gray-500 hover:text-[var(--athenic-gold)] transition-colors inline-block transform group-hover/item:translate-x-1 duration-200"
                                                                >
                                                                    {item}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                        {subcat.items.length === 0 && (
                                                            <li>
                                                                <Link
                                                                    to={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(subcat.title)}`}
                                                                    className="text-xs font-serif text-gray-500 hover:text-[var(--athenic-gold)] transition-colors flex items-center group/all"
                                                                >
                                                                    View Collection
                                                                    <span className="ml-1 opacity-0 group-hover/all:opacity-100 transform translate-x-0 group-hover/all:translate-x-1 transition-all">→</span>
                                                                </Link>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CategoryNav;
