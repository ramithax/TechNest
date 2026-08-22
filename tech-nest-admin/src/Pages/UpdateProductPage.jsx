import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/axios";
import { uploadImage } from "@/lib/image-upload";
import { toast } from "sonner";

export function UpdateProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [actualPrice, setActualPrice] = useState("");
    const [labelPrice, setLabelPrice] = useState("");

    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [category, setCategory] = useState("");

    const [stockQuantity, setStockQuantity] = useState("");

    const [brand, setBrand] = useState("");

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fileKey, setFileKey] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/Product/${productId}`);
                const product = response.data;
                setName(product.name || "");
                setDescription(product.description || "");
                setActualPrice(product.actualPrice ?? "");
                setLabelPrice(product.labelPrice ?? "");
                setExistingImages(product.images || []);
                setCategory(product.category || "");
                setStockQuantity(product.stockQuantity ?? "");
                setBrand(product.brand || "");
            } catch (error) {
                console.error("Failed to fetch product:", error);
                toast.error("Failed to load product details.");
                navigate("/admin/products");
            } finally {
                setFetching(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, navigate]);

    const handleImageChange = (e) => {
        if (!e.target.files) {
            return;
        }

        const files = Array.from(e.target.files);
        const validFiles = [];

        for (const file of files) {

            // Check image type
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image`);
                continue;
            }

            // Check file size - 4MB
            if (file.size > 4 * 1024 * 1024) {
                toast.error(`${file.name} is larger than 4MB`);
                continue;
            }

            validFiles.push(file);
        }

        setImages(validFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productId) {
            toast.error("Product ID is missing");
            return;
        }

        if (!name.trim()) {
            toast.error("Product name is required");
            return;
        }

        if (!actualPrice || Number(actualPrice) <= 0) {
            toast.error("Actual price must be greater than 0");
            return;
        }

        if (!labelPrice || Number(labelPrice) <= 0) {
            toast.error("Label price must be greater than 0");
            return;
        }

        if (!category.trim()) {
            toast.error("Category is required");
            return;
        }

        if (!brand.trim()) {
            toast.error("Brand is required");
            return;
        }

        if (
            stockQuantity === "" ||
            Number(stockQuantity) < 0
        ) {
            toast.error("Stock quantity cannot be negative");
            return;
        }

        try {
            setLoading(true);

            let imageUrls = existingImages;

            // Upload new images only if user selected them
            if (images.length > 0) {
                imageUrls = await Promise.all(
                    images.map((file) => uploadImage(file))
                );

                console.log(
                    "Uploaded new image URLs:",
                    imageUrls
                );
            }

            const productData = {
                name: name.trim(),
                description: description.trim(),
                labelPrice: Number(labelPrice),
                actualPrice: Number(actualPrice),
                stockQuantity: Number(stockQuantity),
                category: category.trim(),
                brand: brand.trim(),
                images: imageUrls,
            };

            console.log(
                "Updated product data:",
                productData
            );

            // IMPORTANT: PUT, not POST
            await api.put(
                `/Product/${productId}`,
                productData
            );

            toast.success(
                "Product updated successfully"
            );

            navigate("/admin/products");

        } catch (error) {
            console.error(
                "Failed to update product:",
                error
            );

            if (error.response?.data) {
                console.error(
                    "API Error:",
                    error.response.data
                );
            }

            if (error.response?.status === 401) {
                toast.error(
                    "You are not authorized. Please login again."
                );
                return;
            }

            if (error.response?.status === 403) {
                toast.error(
                    "You don't have permission to update this product."
                );
                return;
            }

            toast.error(
                error.response?.data ||
                error.message ||
                "Failed to update product. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };
    if (fetching) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
                <p className="text-zinc-500">Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">

            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-6">

                    <h1 className="text-2xl font-semibold text-white">
                        Edit Product
                    </h1>

                    <p className="text-sm text-zinc-500 mt-1">
                        Update product information
                    </p>

                </div>

                {/* Form Container */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Product Name */}
                        <div>

                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Product Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter product name"
                                disabled={loading}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                            />

                        </div>

                        {/* Description */}
                        <div>

                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Description
                            </label>

                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Enter product description"
                                disabled={loading}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 outline-none resize-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                            />

                        </div>

                        {/* Prices */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Actual Price */}
                            <div>

                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Actual Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={actualPrice}
                                    onChange={(e) =>
                                        setActualPrice(e.target.value)
                                    }
                                    placeholder="0.00"
                                    disabled={loading}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                                />

                            </div>

                            {/* Label Price */}
                            <div>

                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Label Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={labelPrice}
                                    onChange={(e) =>
                                        setLabelPrice(e.target.value)
                                    }
                                    placeholder="0.00"
                                    disabled={loading}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                                />

                            </div>

                        </div>

                        {/* Images */}
                        <div>

                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Product Images
                            </label>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-4">

                                    <p className="text-xs text-zinc-500 mb-2">
                                        Current Images
                                    </p>

                                    <div className="grid grid-cols-4 gap-3">

                                        {existingImages.map(
                                            (image, index) => (
                                                <div
                                                    key={index}
                                                    className="relative"
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border border-zinc-800"
                                                    />
                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            <input
                                key={fileKey}
                                type="file"
                                multiple
                                accept="image/*"
                                disabled={loading}
                                onChange={handleImageChange}
                                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-4 py-2.5 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:text-zinc-300"
                            />

                            <p className="text-xs text-zinc-600 mt-2">
                                Select new images only if you want to replace the current images. Maximum 4MB per image.
                            </p>

                            {/* New Image Preview */}
                            {images.length > 0 && (

                                <div className="mt-4">

                                    <p className="text-xs text-zinc-500 mb-2">
                                        New Images
                                    </p>

                                    <div className="grid grid-cols-4 gap-3">

                                        {images.map(
                                            (file, index) => (
                                                <div
                                                    key={index}
                                                    className="relative"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        className="w-full h-20 object-cover rounded-lg border border-zinc-800"
                                                    />
                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                        {/* Category */}
                        <div>

                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Category
                            </label>

                            <input
                                type="text"
                                value={category}
                                onChange={(e) =>
                                    setCategory(e.target.value)
                                }
                                placeholder="e.g. Graphics Cards"
                                disabled={loading}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                            />

                        </div>

                        {/* Stock */}
                        <div>

                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Stock Quantity
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={stockQuantity}
                                onChange={(e) =>
                                    setStockQuantity(e.target.value)
                                }
                                placeholder="0"
                                disabled={loading}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                            />

                        </div>

                        {/* Brand */}
                        <div>

                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Brand
                            </label>

                            <input
                                type="text"
                                value={brand}
                                onChange={(e) =>
                                    setBrand(e.target.value)
                                }
                                placeholder="e.g. ASUS"
                                disabled={loading}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                            />

                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Updating product..."
                                : "Update Product"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}