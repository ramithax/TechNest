import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import AddButton from "@/components/AddButton";

export function ProductPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/Product");

            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/Product/${id}`);

            setProducts((currentProducts) =>
                currentProducts.filter((product) => product.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Failed to delete product.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Products
                    </h1>

                    <p className="text-sm text-zinc-500 mt-1">
                        Manage your products
                    </p>
                </div>

                <Link to="/admin/add-product">
                    <AddButton />
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Table Container */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">

                {loading ? (
                    <div className="text-center py-16 text-zinc-500">
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        No products found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">

                            {/* Table Head */}
                            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-xs border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">
                                        Product
                                    </th>

                                    <th className="px-6 py-4">
                                        Price
                                    </th>

                                    <th className="px-6 py-4">
                                        Label Price
                                    </th>

                                    <th className="px-6 py-4">
                                        Stock
                                    </th>

                                    <th className="px-6 py-4">
                                        Category
                                    </th>

                                    <th className="px-6 py-4">
                                        Brand
                                    </th>

                                    <th className="px-6 py-4">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/60 transition-colors"
                                    >

                                        {/* Product */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">

                                                <img
                                                    src={
                                                        product.images?.[0] ||
                                                        "/placeholder.png"
                                                    }
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                                                />

                                                <div>
                                                    <p className="font-medium text-zinc-100">
                                                        {product.name}
                                                    </p>

                                                    <p className="text-xs text-zinc-600 mt-0.5">
                                                        ID: {product.id}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Actual Price */}
                                        <td className="px-6 py-4 font-medium text-zinc-200">
                                            Rs. {product.actualPrice}
                                        </td>

                                        {/* Label Price */}
                                        <td className="px-6 py-4 text-zinc-500">
                                            Rs. {product.labelPrice}
                                        </td>

                                        {/* Stock */}
                                        <td className="px-6 py-4 text-zinc-300">
                                            {product.stockQuantity}
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-4 text-zinc-400">
                                            {product.category}
                                        </td>

                                        {/* Brand */}
                                        <td className="px-6 py-4 text-zinc-400">
                                            {product.brand}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${product.isActive
                                                    ? "bg-green-950/40 text-green-400 border-green-900/50"
                                                    : "bg-red-950/40 text-red-400 border-red-900/50"
                                                    }`}
                                            >
                                                {product.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">

                                                <Link
                                                    to={`/admin/edit-product/${product.id}`}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-950/60 hover:text-red-300 transition"
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>
        </div>
    );
}