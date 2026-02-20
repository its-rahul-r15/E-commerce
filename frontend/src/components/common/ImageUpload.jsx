import { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';


const ImageUpload = ({
    images = [],
    onImagesChange,
    maxImages = 5,
    label = 'Upload Images',
    multiple = true
}) => {
    const [previews, setPreviews] = useState(images);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setError('');

        
        if (previews.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Validate file types and sizes
        const validFiles = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                continue;
            }
            validFiles.push(file);
        }

        // Create previews and update parent
        const newPreviews = validFiles.map(file => ({
            file,
            url: URL.createObjectURL(file),
        }));

        const allPreviews = [...previews, ...newPreviews];
        setPreviews(allPreviews);
        onImagesChange(allPreviews);
    };

    const removeImage = (index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
        onImagesChange(newPreviews);
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            {/* Image Previews */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={preview.url || preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {previews.length < maxImages && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, WebP up to 5MB ({previews.length}/{maxImages})
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple={multiple}
                        onChange={handleFileChange}
                    />
                </label>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload;
