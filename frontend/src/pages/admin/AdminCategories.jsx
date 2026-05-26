import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Form States
    const [categoryName, setCategoryName] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const [newSubCategory, setNewSubCategory] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubCategory = (e) => {
        e.preventDefault();
        const trimmed = newSubCategory.trim();
        if (trimmed && !subCategories.includes(trimmed)) {
            setSubCategories([...subCategories, trimmed]);
            setNewSubCategory('');
        }
    };

    const handleRemoveSubCategory = (sub) => {
        setSubCategories(subCategories.filter(s => s !== sub));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            alert('Category name is required.');
            return;
        }

        try {
            const data = {
                name: categoryName.trim(),
                subCategories: subCategories
            };

            if (editingId) {
                await axios.put(`/categories/${editingId}`, data);
                alert('Category updated successfully!');
            } else {
                await axios.post('/categories', data);
                alert('Category created successfully!');
            }

            fetchCategories();
            resetForm();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleEdit = (category) => {
        setEditingId(category._id);
        setCategoryName(category.name);
        setSubCategories(category.subCategories || []);
        setNewSubCategory('');
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category? All products using this category may need re-classification.')) return;
        try {
            await axios.delete(`/categories/${id}`);
            fetchCategories();
            alert('Category deleted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting category');
        }
    };

    const resetForm = () => {
        setCategoryName('');
        setSubCategories([]);
        setNewSubCategory('');
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8 meander-pattern pb-1">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Category Management</h1>
                    <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Customize categories and subcategories on the platform</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-[var(--mehron)] text-white px-8 py-2.5 rounded-none border border-[var(--gold)] hover:bg-[var(--mehron-deep)] font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all"
                    >
                        Create New Category
                    </button>
                )}
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white border border-[var(--border-mehron)] rounded-none p-8 mb-12 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--mehron)] meander-pattern"></div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-[var(--mehron)] uppercase tracking-widest">
                            {editingId ? 'Edit Category' : 'Create New Category'}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-[var(--mehron)] transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Category Name */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)] tracking-widest placeholder:text-gray-300"
                                    placeholder="e.g., Anarkali Suit"
                                    required
                                />
                            </div>

                            {/* Subcategories (Dynamic Tags Input) */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                    Subcategories
                                </label>
                                <div className="flex space-x-3 mb-4">
                                    <input
                                        type="text"
                                        value={newSubCategory}
                                        onChange={(e) => setNewSubCategory(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddSubCategory(e);
                                            }
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)] placeholder:text-gray-300"
                                        placeholder="Add a subcategory and press Enter or click Add"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSubCategory}
                                        className="bg-[var(--charcoal)] text-[var(--gold)] px-6 py-2.5 border border-[var(--gold)] hover:bg-black font-bold uppercase tracking-widest text-[10px] transition-all"
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Render Subcategories Tags */}
                                {subCategories.length > 0 ? (
                                    <div className="flex flex-wrap gap-2.5 p-4 bg-[#FAF9F6] border border-[var(--border-mehron)]/30 min-h-[60px]">
                                        {subCategories.map((sub, idx) => (
                                            <span 
                                                key={idx} 
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[var(--gold)]/30 text-[var(--mehron)] text-[10px] font-bold uppercase tracking-wider"
                                            >
                                                {sub}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubCategory(sub)}
                                                    className="text-gray-400 hover:text-red-500 font-bold transition-colors ml-1"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-400 italic">No subcategories added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-8 py-2.5 border border-gray-300 text-gray-500 rounded-none hover:bg-gray-50 font-bold uppercase tracking-widest text-[10px] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2.5 bg-[var(--mehron)] text-white rounded-none border border-[var(--gold)] hover:bg-[var(--mehron-deep)] font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all"
                            >
                                {editingId ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Display Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-none h-12 w-12 border-2 border-[var(--gold)] border-t-transparent"></div>
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white border border-[var(--border-mehron)] p-16 text-center shadow-sm">
                    <p className="text-[var(--mehron)] font-bold uppercase tracking-[0.2em] text-sm">No categories found.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-6 text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest hover:underline"
                    >
                        Create Your First Category
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category) => (
                        <div key={category._id} className="bg-white border border-[var(--border-mehron)] group hover:border-[var(--gold)] transition-all shadow-sm relative flex flex-col justify-between">
                            <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--mehron)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[var(--mehron)] uppercase tracking-widest leading-none mb-3">
                                    {category.name}
                                </h3>

                                <div className="space-y-2 mt-4 border-t border-gray-50 pt-4">
                                    <h4 className="text-[9px] font-bold text-[var(--gold)] uppercase tracking-wider mb-2">
                                        Subcategories ({category.subCategories?.length || 0})
                                    </h4>
                                    
                                    {category.subCategories && category.subCategories.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
                                            {category.subCategories.map((sub, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className="px-2 py-0.5 bg-[var(--gold-pale)] text-[var(--mehron)] border border-[var(--gold)]/10 text-[9px] font-bold uppercase tracking-wider"
                                                >
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-gray-400 italic">No subcategories defined</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 pt-0 mt-6 border-t border-gray-50 flex space-x-3 bg-[#FAF9F6]/50">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="flex-1 py-2 border border-[var(--gold)] text-[var(--mehron)] text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--gold-pale)] bg-white transition-all mt-4"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="flex-1 py-2 bg-[var(--charcoal)] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all mt-4"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminCategories;
