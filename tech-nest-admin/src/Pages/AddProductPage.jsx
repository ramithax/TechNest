import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

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
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        const validFiles = [];

        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                alert(`${file.name} is not an image`);
                continue;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert(`${file.name} is larger than 2MB`);
                continue;
            }

            validFiles.push(file);
        }

        setImages(validFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Product name is required");
            return;
        }

        if (!actualPrice || Number(actualPrice) <= 0) {
            alert("Actual price must be greater than 0");
            return;
        }

        if (!labelPrice || Number(labelPrice) <= 0) {
            alert("Label price must be greater than 0");
            return;
        }

        if (images.length === 0) {
            alert("At least one image is required");
            return;
        }

        if (!category.trim()) {
            alert("Category is required");
            return;
        }

        if (!brand.trim()) {
            alert("Brand is required");
            return;
        }

        if (!stockQuantity || Number(stockQuantity) < 0) {
            alert("Stock quantity cannot be negative");
            return;
        }

        try {
            setLoading(true);

            /*
             * TEMPORARY:
             * Replace this with your real image upload function.
             */
            const imageUrls = images.map((file) =>
                URL.createObjectURL(file)
            );

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

            await api.post("/Product", productData);

            alert("Product added successfully");

            // Reset form
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
                console.error("API Error:", error.response.data);
            }

            alert("Failed to add product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">

            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-white">
                        Add Product
                    </h1>

                    <p className="text-sm text-zinc-500 mt-1">
                        Add a new product to your store
                    </p>
                </div>

                {/* Form */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Product Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                                Maximum 2MB per image
                            </p>

                            {/* Image Preview */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-4 gap-3 mt-4">
                                    {images.map((file, index) => (
                                        <img
                                            key={index}
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-20 object-cover rounded-lg border border-zinc-800"
                                        />
                                    ))}
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
                                ? "Adding Product..."
                                : "Add Product"}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}