import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import AddButton from "@/components/AddButton";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProductPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = async (pageNumber = page) => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/Product", {
                params: {
                    page: pageNumber,
                    pageSize,
                    includeInactive: true,
                },
            });

            const data = response.data;

            setProducts(data.items || []);
            setPage(data.page || pageNumber);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount || 0);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setError("Failed to load products.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(page);
    }, [page]);

    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedProduct) return;

        try {
            setDeleting(true);

            await api.delete(`/Product/${selectedProduct.id}`);

            toast.success("Product deleted successfully");

            setDeleteOpen(false);
            setSelectedProduct(null);

            if (products.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1);
            } else {
                fetchProducts(page);
            }
        } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error("Failed to delete product.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-zinc-50 text-zinc-900 p-6 md:p-8 overflow-hidden font-sans">
            {/* Subtle Background Accents */}
            <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-blue-500/5 blur-[140px]" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                            Products
                        </h1>

                        <p className="text-sm text-zinc-500 mt-1">
                            Manage your products
                        </p>
                    </div>

                    <Link
                        to="/admin/add-product"
                        className="self-start sm:self-auto"
                    >
                        <AddButton />
                    </Link>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Table Container */}
                <div className="rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur-xl shadow-lg shadow-zinc-200/50 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-16 text-zinc-500">
                            Loading products...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500">
                            No products found
                        </div>
                    ) : (
                        <>
                            {/* Responsive Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs border-b border-zinc-200">
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

                                    <tbody>
                                        {products.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
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
                                                            className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200"
                                                        />

                                                        <div>
                                                            <p className="font-medium text-zinc-900">
                                                                {product.name}
                                                            </p>

                                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                                ID: {product.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Actual Price */}
                                                <td className="px-6 py-4 font-medium text-zinc-800">
                                                    Rs. {product.actualPrice}
                                                </td>

                                                {/* Label Price */}
                                                <td className="px-6 py-4 text-zinc-500">
                                                    Rs. {product.labelPrice}
                                                </td>

                                                {/* Stock */}
                                                <td className="px-6 py-4 text-zinc-600">
                                                    {product.stockQuantity}
                                                </td>

                                                {/* Category */}
                                                <td className="px-6 py-4 text-zinc-500">
                                                    {product.category}
                                                </td>

                                                {/* Brand */}
                                                <td className="px-6 py-4 text-zinc-500">
                                                    {product.brand}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
                                                            product.isActive
                                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                                : "bg-red-50 text-red-600 border-red-200"
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
                                                        {/* Edit */}
                                                        <Link
                                                            to={`/admin/edit-product/${product.id}`}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition"
                                                        >
                                                            Edit
                                                        </Link>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    product
                                                                )
                                                            }
                                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 transition"
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

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-t border-zinc-200">
                                {/* Count */}
                                <div className="text-sm text-zinc-500">
                                    Showing{" "}
                                    <span className="text-zinc-800 font-medium">
                                        {products.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="text-zinc-800 font-medium">
                                        {totalCount}
                                    </span>{" "}
                                    products
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2">
                                    {/* Previous */}
                                    <button
                                        onClick={() =>
                                            setPage((currentPage) =>
                                                Math.max(
                                                    1,
                                                    currentPage - 1
                                                )
                                            )
                                        }
                                        disabled={page === 1 || loading}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        Previous
                                    </button>

                                    {/* Page Number */}
                                    <div className="px-3 py-1.5 text-sm text-zinc-500 whitespace-nowrap">
                                        Page{" "}
                                        <span className="text-zinc-900 font-medium">
                                            {page}
                                        </span>{" "}
                                        of{" "}
                                        <span className="text-zinc-900 font-medium">
                                            {totalPages}
                                        </span>
                                    </div>

                                    {/* Next */}
                                    <button
                                        onClick={() =>
                                            setPage((currentPage) =>
                                                Math.min(
                                                    totalPages,
                                                    currentPage + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            page >= totalPages || loading
                                        }
                                        className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    if (!deleting) {
                        setDeleteOpen(open);

                        if (!open) {
                            setSelectedProduct(null);
                        }
                    }
                }}
            >
                <AlertDialogContent className="bg-white border border-zinc-200 text-zinc-900 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-zinc-900">
                            Delete Product?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-zinc-500">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-zinc-900">
                                {selectedProduct?.name}
                            </span>
                            ?
                            <br />

                            <span className="text-red-600">
                                This action cannot be undone.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        {/* Cancel */}
                        <AlertDialogCancel
                            disabled={deleting}
                            className="bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            No, Cancel
                        </AlertDialogCancel>

                        {/* Delete */}
                        <AlertDialogAction
                            disabled={deleting}
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleting
                                ? "Deleting..."
                                : "Yes, Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}