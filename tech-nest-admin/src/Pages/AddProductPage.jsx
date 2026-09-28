import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { uploadImage } from "@/lib/image-upload";
import { toast } from "sonner";

export function AddProductPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [actualPrice, setActualPrice] = useState("");
    const [labelPrice, setLabelPrice] = useState("");
    const [images, setImages] = useState([]);
    const [category, setCategory] = useState("");
    const [stockQuantity, setStockQuantity] = useState("");
    const [brand, setBrand] = useState("");

    const [loading, setLoading] = useState(false);
    const [fileKey, setFileKey] = useState(0);

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
                toast.error(`${file.name} is larger than 2MB`);
                continue;
            }

            validFiles.push(file);
        }

        setImages(validFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

        if (images.length === 0) {
            toast.error("At least one image is required");
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

        if (!stockQuantity || Number(stockQuantity) < 0) {
            toast.error("Stock quantity cannot be negative");
            return;
        }

        try {
            setLoading(true);

            const imageUrls = await Promise.all(
                images.map((file) => uploadImage(file))
            );

            console.log("Uploaded image URLs:", imageUrls);

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

            console.log("Product data:", productData);

            await api.post("/Product", productData);

            toast.success("Product added successfully");

            setName("");
            setDescription("");
            setActualPrice("");
            setLabelPrice("");
            setImages([]);
            setCategory("");
            setStockQuantity("");
            setBrand("");

            setFileKey((prev) => prev + 1);

            navigate("/admin/products");
        } catch (error) {
            console.error("Failed to create product:", error);

            if (error.response?.data) {
                console.error(
                    "API Error:",
                    error.response.data
                );
            }

            toast.error(
                error.message ||
                "Failed to add product. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-zinc-50 text-zinc-900 p-6 md:p-8 overflow-hidden font-sans">
            {/* Subtle Background Accents */}
            <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-blue-500/5 blur-[140px]" />

            <div className="relative z-10 max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        Add Product
                    </h1>

                    <p className="text-sm text-zinc-500 mt-1">
                        Add a new product to your store
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white/80 border border-zinc-200 rounded-2xl shadow-lg shadow-zinc-200/50 backdrop-blur-xl p-6 sm:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">
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
                                className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">
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
                                className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none resize-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition"
                            />
                        </div>

                        {/* Prices */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Actual Price */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">
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
                                    className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition"
                                />
                            </div>

                            {/* Label Price */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">
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
                                    className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition"
                                />
                            </div>
                        </div>

                        {/* Product Images */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                Product Images
                            </label>

                            <input
                                key={fileKey}
                                type="file"
                                multiple
                                accept="image/*"
                                disabled={loading}
                                onChange={handleImageChange}
                                className="w-full bg-white border border-zinc-200 text-zinc-500 rounded-xl px-4 py-2.5 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200 transition"
                            />

                            <p className="text-xs text-zinc-400 mt-2">
                                Maximum 2MB per image
                            </p>

                            {/* Image Preview */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                    {images.map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="w-full h-20 object-cover rounded-xl border border-zinc-200 bg-zinc-100"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">
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
                                className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition"
                            />
                        </div>

                        {/* Stock Quantity */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">
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
                                className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition"
                            />
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">
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
                                className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-900 text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading
                                ? "Uploading images & adding product..."
                                : "Add Product"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
