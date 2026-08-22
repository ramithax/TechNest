import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { uploadImage } from "@/lib/image-upload";
import { toast } from "sonner";

export function UpdateProductPage({ product }) {
    const navigate = useNavigate();

    const [name, setName] = useState(product?.name || "");
    const [description, setDescription] = useState(product?.description || "");
    const [actualPrice, setActualPrice] = useState(product?.actualPrice || "");
    const [labelPrice, setLabelPrice] = useState(product?.labelPrice || "");
    const [images, setImages] = useState([]);
    const [category, setCategory] = useState(product?.category || "");
    const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity || "");
    const [brand, setBrand] = useState(product?.brand || "");

    const [loading, setLoading] = useState(false);
    const [fileKey, setFileKey] = useState(0);


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

            // Check file size - 2MB
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

                {/* Form Container */}

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >


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

                            {/* IMAGE PREVIEW */}

                            {images.length > 0 && (

                                <div className="grid grid-cols-4 gap-3 mt-4">

                                    {images.map((file, index) => (

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

                                    ))}

                                </div>

                            )}

                        </div>


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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
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