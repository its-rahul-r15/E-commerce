import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // unfiltered results
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('');

    // Fetch admin-created categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getCategories();
                if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        const searchQuery = searchParams.get('q');
        const urlCategory = searchParams.get('category');
        if (urlCategory) setSelectedCategory(urlCategory);
        if (searchQuery) {
            setQuery(searchQuery);
            handleSearch(searchQuery);
        } else {
            navigate('/');
        }
    }, [searchParams]);

    const handleSearch = async (searchQuery) => {
        try {
            setLoading(true);
            const data = await productService.searchProducts(searchQuery, 1, 50);
            const productsArray = Array.isArray(data) ? data : (data.products || []);
            setAllProducts(productsArray);
            setProducts(productsArray);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter by category when selection changes
    useEffect(() => {
        let filtered = [...allProducts];

        // Category filter
        if (selectedCategory && selectedCategory !== 'All') {
            filtered = filtered.filter(p =>
                p.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Sort
        if (sortBy === 'price-asc') {
            filtered.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        } else if (sortBy === 'price-desc') {
            filtered.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        } else if (sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setProducts(filtered);
    }, [selectedCategory, sortBy, allProducts]);

    const handleCategoryClick = (catName) => {
        setSelectedCategory(catName);
        const params = new URLSearchParams(searchParams);
        if (catName === 'All') {
            params.delete('category');
        } else {
            params.set('category', catName);
        }
        setSearchParams(params, { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-[var(--athenic-gold,#c9a96e)]"></div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999', letterSpacing: '0.05em' }}>Searching...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: '#faf9f7' }}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="mb-2">
                    <h1 style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '22px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '4px',
                    }}>
                        Search Results for "<span style={{ color: 'var(--athenic-gold, #c9a96e)' }}>{query}</span>"
                    </h1>
                    <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: '#888',
                    }}>
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                    </p>
                </div>

                {/* ── Category Pills + Sort ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                }}>
                    {/* Category Pills */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        flex: 1,
                    }}>
                        {/* "All" pill */}
                        <button
                            onClick={() => handleCategoryClick('All')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '50px',
                                border: selectedCategory === 'All'
                                    ? '2px solid var(--athenic-gold, #c9a96e)'
                                    : '1.5px solid #e0e0e0',
                                background: selectedCategory === 'All'
                                    ? 'linear-gradient(135deg, var(--athenic-gold, #c9a96e) 0%, #d4a853 100%)'
                                    : '#fff',
                                color: selectedCategory === 'All' ? '#fff' : '#555',
                                fontSize: '12px',
                                fontWeight: selectedCategory === 'All' ? 700 : 500,
                                fontFamily: 'Inter, sans-serif',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                letterSpacing: '0.03em',
                                whiteSpace: 'nowrap',
                                boxShadow: selectedCategory === 'All'
                                    ? '0 2px 8px rgba(201,169,110,0.3)'
                                    : '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                        >
                            All
                        </button>

                        {/* Dynamic category pills from admin */}
                        {categories.map((cat) => {
                            const isActive = selectedCategory === cat.name;
                            return (
                                <button
                                    key={cat._id}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '50px',
                                        border: isActive
                                            ? '2px solid var(--athenic-gold, #c9a96e)'
                                            : '1.5px solid #e0e0e0',
                                        background: isActive
                                            ? 'linear-gradient(135deg, var(--athenic-gold, #c9a96e) 0%, #d4a853 100%)'
                                            : '#fff',
                                        color: isActive ? '#fff' : '#555',
                                        fontSize: '12px',
                                        fontWeight: isActive ? 700 : 500,
                                        fontFamily: 'Inter, sans-serif',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        letterSpacing: '0.03em',
                                        whiteSpace: 'nowrap',
                                        boxShadow: isActive
                                            ? '0 2px 8px rgba(201,169,110,0.3)'
                                            : '0 1px 3px rgba(0,0,0,0.04)',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort Dropdown */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#fff',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        border: '1.5px solid #e0e0e0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        flexShrink: 0,
                    }}>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#888',
                            fontFamily: 'Inter, sans-serif',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                        }}>Sort</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#333',
                                fontFamily: 'Inter, sans-serif',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">Relevant</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>
                </div>

                {/* Results */}
                {products.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                        <h3 style={{
                            fontSize: '18px', fontWeight: 600, color: '#1a1a1a',
                            fontFamily: 'Inter, sans-serif', marginBottom: '6px',
                        }}>
                            No products found
                        </h3>
                        <p style={{
                            fontSize: '13px', color: '#888',
                            fontFamily: 'Inter, sans-serif', marginBottom: '20px',
                        }}>
                            {selectedCategory !== 'All'
                                ? `No results in "${selectedCategory}". Try another category or `
                                : 'Try different keywords or '}
                            browse all products
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {selectedCategory !== 'All' && (
                                <button
                                    onClick={() => handleCategoryClick('All')}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '50px',
                                        border: '1.5px solid var(--athenic-gold, #c9a96e)',
                                        background: 'transparent',
                                        color: 'var(--athenic-gold, #c9a96e)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        fontFamily: 'Inter, sans-serif',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    Show All Categories
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/')}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '50px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, var(--athenic-gold, #c9a96e) 0%, #d4a853 100%)',
                                    color: '#fff',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    fontFamily: 'Inter, sans-serif',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(201,169,110,0.3)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Browse All Products
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                onClick={() => navigate(`/product/${product._id}`)}
                                style={{
                                    background: '#fff',
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                    border: '1px solid rgba(0,0,0,0.04)',
                                }}
                                className="group hover:shadow-lg hover:-translate-y-1"
                            >
                                <div style={{ position: 'relative', paddingTop: '120%', background: '#f5f5f3' }}>
                                    <img
                                        src={product.images?.[0] || '/placeholder.png'}
                                        alt={product.name}
                                        style={{
                                            position: 'absolute',
                                            top: 0, left: 0,
                                            width: '100%', height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.4s ease',
                                        }}
                                        className="group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Discount Badge */}
                                    {product.discountedPrice && product.discountedPrice < product.price && (
                                        <span style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            background: '#e53e3e', color: '#fff',
                                            fontSize: '10px', fontWeight: 700,
                                            padding: '3px 8px', borderRadius: '50px',
                                            fontFamily: 'Inter, sans-serif',
                                        }}>
                                            -{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
                                        </span>
                                    )}
                                    {/* Low Stock */}
                                    {product.stock > 0 && product.stock < 10 && (
                                        <span style={{
                                            position: 'absolute', top: '8px', left: '8px',
                                            background: 'var(--athenic-gold, #c9a96e)', color: '#fff',
                                            fontSize: '9px', fontWeight: 700,
                                            padding: '3px 8px', borderRadius: '50px',
                                            fontFamily: 'Inter, sans-serif',
                                            letterSpacing: '0.04em',
                                        }}>
                                            Few Left
                                        </span>
                                    )}
                                </div>
                                <div style={{ padding: '12px 14px 14px' }}>
                                    {/* Category tag */}
                                    {product.category && (
                                        <p style={{
                                            fontSize: '9px', fontWeight: 600, color: 'var(--athenic-gold, #c9a96e)',
                                            fontFamily: 'Inter, sans-serif',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            marginBottom: '4px',
                                        }}>
                                            {product.category}
                                        </p>
                                    )}
                                    <h3 style={{
                                        fontSize: '13px', fontWeight: 500, color: '#1a1a1a',
                                        fontFamily: 'Inter, sans-serif',
                                        lineHeight: '1.4',
                                        marginBottom: '4px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}>
                                        {product.name}
                                    </h3>
                                    <p style={{
                                        fontSize: '10px', color: '#aaa',
                                        fontFamily: 'Inter, sans-serif',
                                        marginBottom: '8px',
                                    }}>
                                        {product.shopId?.shopName || 'Shop'}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                        <span style={{
                                            fontSize: '15px', fontWeight: 700, color: '#1a1a1a',
                                            fontFamily: 'Inter, sans-serif',
                                        }}>
                                            ₹{product.discountedPrice || product.price}
                                        </span>
                                        {product.discountedPrice && product.discountedPrice < product.price && (
                                            <span style={{
                                                fontSize: '11px', color: '#bbb',
                                                textDecoration: 'line-through',
                                            }}>
                                                ₹{product.price}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
