import { useState, useEffect } from 'react';
import { shoppableVideoService, productService } from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminShoppableVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [products, setProducts] = useState([]);

    // Form state
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [videosData, productsData] = await Promise.all([
                shoppableVideoService.getAdminVideos(),
                productService.getAllProducts() // Fetch all products for selection
            ]);
            setVideos(videosData);
            setProducts(productsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load videos or products');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (video = null) => {
        if (video) {
            setEditingVideo(video);
            setTitle(video.title);
            setVideoUrl(video.videoUrl);
            setVideoFile(null);
            setSelectedProducts(video.products?.map(p => p._id) || []);
            setIsActive(video.isActive);
        } else {
            setEditingVideo(null);
            setTitle('');
            setVideoUrl('');
            setVideoFile(null);
            setSelectedProducts([]);
            setIsActive(true);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVideo(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            return toast.error('Title is required');
        }
        if (!videoUrl.trim() && !videoFile && !editingVideo) {
            return toast.error('Please provide a Video URL or upload a file');
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', title);
            if (videoFile) {
                formData.append('video', videoFile);
            } else if (videoUrl) {
                formData.append('videoUrl', videoUrl);
            }
            formData.append('isActive', isActive);
            
            // Append products as string array
            formData.append('products', JSON.stringify(selectedProducts));

            if (editingVideo) {
                await shoppableVideoService.updateVideo(editingVideo._id, formData);
                toast.success('Video updated successfully');
            } else {
                await shoppableVideoService.createVideo(formData);
                toast.success('Video created successfully');
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error submitting video:', error);
            toast.error(error.response?.data?.error || 'Failed to save video');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;
        try {
            await shoppableVideoService.deleteVideo(id);
            toast.success('Video deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting video:', error);
            toast.error('Failed to delete video');
        }
    };

    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-900 border-t-transparent"></div></div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shoppable Videos</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage Home page Shop the Look videos</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[var(--athenic-blue)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#004e7a] transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Video
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video / Title</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products Linked</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {videos.map((video) => (
                                <tr key={video._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                <video src={video.videoUrl} className="h-full w-full object-cover" muted />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{video.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {video.products?.map((p, i) => (
                                                <img 
                                                    key={i} 
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
                                                    src={p.images?.[0] || '/placeholder.png'} 
                                                    alt={p.name} 
                                                    title={p.name}
                                                />
                                            ))}
                                            {(!video.products || video.products.length === 0) && (
                                                <span className="text-sm text-gray-400">None</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${video.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {video.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(video)}
                                            className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded-md hover:bg-blue-50"
                                            title="Edit"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(video._id)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {videos.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No shoppable videos found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseModal}></div>

                        <div className="relative inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-xl sm:my-8 sm:p-6 sm:align-middle">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none"
                                >
                                    <span className="sr-only">Close</span>
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start">
                                <div className="w-full mt-3 sm:mt-0 sm:text-left">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
                                        {editingVideo ? 'Edit Video' : 'Add New Video'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="e.g. Classic White Silk Saree"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Video File Upload</label>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                                    className="mt-1 block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-md file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">OR Video URL</label>
                                                <input
                                                    type="url"
                                                    value={videoUrl}
                                                    onChange={(e) => setVideoUrl(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="https://.../video.mp4"
                                                    disabled={!!videoFile}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Link Products</label>
                                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
                                                {products.map(product => (
                                                    <label key={product._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedProducts.includes(product._id)}
                                                            onChange={() => toggleProductSelection(product._id)}
                                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                        />
                                                        <img src={product.images?.[0] || '/placeholder.png'} className="w-8 h-10 object-cover rounded shadow-sm" alt="" />
                                                        <span className="text-sm text-gray-700 line-clamp-1">{product.name}</span>
                                                        <span className="text-sm font-medium text-gray-900 ml-auto">₹{product.discountedPrice || product.price}</span>
                                                    </label>
                                                ))}
                                                {products.length === 0 && (
                                                    <p className="text-sm text-gray-500 text-center py-2">No products found</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="isActive"
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="isActive" className="block ml-2 text-sm text-gray-900">
                                                Active (show on home page)
                                            </label>
                                        </div>

                                        <div className="mt-5 sm:mt-4 flex flex-row-reverse">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70"
                                            >
                                                {submitting ? 'Saving...' : 'Save Video'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShoppableVideos;
