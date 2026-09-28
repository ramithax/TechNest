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
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image`);
                continue;
            }

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
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 font-sans text-zinc-900">
                <p className="text-zinc-500">
                    Loading product details...
                </p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-50 p-6 font-sans text-zinc-900 md:p-8">

            {/* Background accents */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

            <div className="relative mx-auto max-w-3xl">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        Edit Product
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Update product information
                    </p>
                </div>

                {/* Form Container */}
                <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg shadow-zinc-200/50 backdrop-blur-xl sm:p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Product Name */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-zinc-700">
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
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-zinc-700">
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
                                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50"
                            />
                        </div>

                        {/* Prices */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            {/* Actual Price */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-700">
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
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50"
                                />
                            </div>

                            {/* Label Price */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-700">
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
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-zinc-700">
                                Product Images
                            </label>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-4">
                                    <p className="mb-2 text-xs font-semibold text-zinc-500">
                                        Current Images
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {existingImages.map(
                                            (image, index) => (
                                                <div
                                                    key={index}
                                                    className="relative"
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Product ${index + 1}`}
                                                        className="h-20 w-full rounded-xl border border-zinc-200 bg-zinc-100 object-cover"
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
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50"
                            />

                            <p className="mt-2 text-xs text-zinc-500">
                                Select new images only if you want to replace
                                the current images. Maximum 4MB per image.
                            </p>

                            {/* New Image Preview */}
                            {images.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-semibold text-zinc-500">
                                        New Images
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {images.map(
                                            (file, index) => (
                                                <div
                                                    key={index}
                                                    className="relative"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        className="h-20 w-full rounded-xl border border-zinc-200 bg-zinc-100 object-cover"
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
                            <label className="mb-2 block text-sm font-semibold text-zinc-700">
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
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50"
                            />
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-zinc-700">
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
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50"
                            />
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-zinc-700">
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
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-zinc-900 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
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