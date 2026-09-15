import { useEffect, useState } from "react";
import api from "@/lib/axios";

export function PcBuildsPage() {
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Selected build for the view modal
    const [selectedBuild, setSelectedBuild] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Fetch all PC builds
    const fetchBuilds = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/PcBuild/admin");

            setBuilds(response.data);
        } catch (err) {
            console.error("Failed to fetch PC builds:", err);
            setError("Failed to load PC builds.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuilds();
    }, []);

    // Fetch a specific build
    const handleViewBuild = async (buildId) => {
        try {
            setViewLoading(true);
            setError("");

            const response = await api.get(
                `/PcBuild/admin/${buildId}`
            );

            setSelectedBuild(response.data);
        } catch (err) {
            console.error("Failed to fetch PC build:", err);
            setError("Failed to load PC build details.");
        } finally {
            setViewLoading(false);
        }
    };

    // Close modal
    const closeBuildModal = () => {
        setSelectedBuild(null);
    };

    // Calculate total price
    const getBuildTotal = (build) => {
        if (!build?.items) return 0;

        return build.items.reduce(
            (total, item) => total + (item.totalPrice || 0),
            0
        );
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        PC Build Management
                    </h1>

                    <p className="text-sm text-zinc-500 mt-1">
                        View and manage customer PC builds
                    </p>
                </div>
            </div>


            {/* Error Message */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}


            {/* Builds Table */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">

                {loading ? (

                    <div className="text-center py-16 text-zinc-500">
                        Loading PC builds...
                    </div>

                ) : builds.length === 0 ? (

                    <div className="text-center py-16 text-zinc-500">
                        No PC builds found
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm text-left">

                            {/* Table Head */}
                            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-xs border-b border-zinc-800">
                                <tr>

                                    <th className="px-6 py-4">
                                        Build ID
                                    </th>

                                    <th className="px-6 py-4">
                                        User ID
                                    </th>

                                    <th className="px-6 py-4">
                                        Items Count
                                    </th>

                                    <th className="px-6 py-4">
                                        Total Amount
                                    </th>

                                    <th className="px-6 py-4">
                                        Created Date
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Actions
                                    </th>

                                </tr>
                            </thead>


                            {/* Table Body */}
                            <tbody>

                                {builds.map((build) => (

                                    <tr
                                        key={build.id}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/60 transition-colors"
                                    >

                                        {/* Build ID */}
                                        <td className="px-6 py-4 font-mono font-medium text-zinc-200">
                                            #BUILD-{build.id}
                                        </td>


                                        {/* User ID */}
                                        <td className="px-6 py-4 text-zinc-400">
                                            User #{build.userId ?? "—"}
                                        </td>


                                        {/* Items Count */}
                                        <td className="px-6 py-4 text-zinc-400">
                                            {build.items?.length || 0} items
                                        </td>


                                        {/* Total Amount */}
                                        <td className="px-6 py-4 font-medium text-zinc-200">
                                            Rs.{" "}
                                            {getBuildTotal(
                                                build
                                            ).toLocaleString()}
                                        </td>


                                        {/* Created Date */}
                                        <td className="px-6 py-4 text-zinc-500 text-xs">
                                            {build.createdAt
                                                ? new Date(
                                                      build.createdAt
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </td>


                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">

                                            <button
                                                onClick={() =>
                                                    handleViewBuild(
                                                        build.id
                                                    )
                                                }
                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-950/40 border border-blue-900/50 text-blue-400 hover:bg-blue-950/70 hover:text-blue-300 transition"
                                            >
                                                View Build
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* View Build Modal */}
            {selectedBuild && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

                    <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl">


                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">

                            <div>

                                <h2 className="text-xl font-semibold text-white">
                                    PC Build #{selectedBuild.id}
                                </h2>

                                <p className="text-sm text-zinc-500 mt-1">
                                    Created{" "}
                                    {selectedBuild.createdAt
                                        ? new Date(
                                              selectedBuild.createdAt
                                          ).toLocaleString()
                                        : "—"}
                                </p>

                            </div>


                            <button
                                onClick={closeBuildModal}
                                className="text-zinc-500 hover:text-white text-2xl transition"
                            >
                                ×
                            </button>

                        </div>


                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[70vh]">

                            {viewLoading ? (

                                <div className="text-center py-12 text-zinc-500">
                                    Loading build details...
                                </div>

                            ) : (

                                <>

                                    {/* Build Information */}
                                    <div className="mb-6">

                                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">
                                            Build Information
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                            {/* Build ID */}
                                            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">

                                                <p className="text-xs text-zinc-500">
                                                    Build ID
                                                </p>

                                                <p className="text-lg font-semibold text-white mt-1">
                                                    #{selectedBuild.id}
                                                </p>

                                            </div>


                                            {/* Items */}
                                            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">

                                                <p className="text-xs text-zinc-500">
                                                    Components
                                                </p>

                                                <p className="text-lg font-semibold text-white mt-1">
                                                    {selectedBuild.items
                                                        ?.length || 0}
                                                </p>

                                            </div>


                                            {/* Total */}
                                            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">

                                                <p className="text-xs text-zinc-500">
                                                    Total Price
                                                </p>

                                                <p className="text-lg font-semibold text-white mt-1">
                                                    Rs.{" "}
                                                    {getBuildTotal(
                                                        selectedBuild
                                                    ).toLocaleString()}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* Components */}
                                    <div>

                                        <div className="flex items-center justify-between mb-3">

                                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                                                Selected Components
                                            </h3>

                                            <span className="text-xs text-zinc-500">
                                                {selectedBuild.items
                                                    ?.length || 0}{" "}
                                                items
                                            </span>

                                        </div>


                                        <div className="border border-zinc-800 rounded-lg overflow-hidden">

                                            <table className="w-full text-sm">

                                                <thead className="bg-zinc-900/80 border-b border-zinc-800">

                                                    <tr>

                                                        <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">
                                                            Product
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">
                                                            Category
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-xs uppercase text-zinc-500">
                                                            Brand
                                                        </th>

                                                        <th className="px-4 py-3 text-center text-xs uppercase text-zinc-500">
                                                            Qty
                                                        </th>

                                                        <th className="px-4 py-3 text-right text-xs uppercase text-zinc-500">
                                                            Unit Price
                                                        </th>

                                                        <th className="px-4 py-3 text-right text-xs uppercase text-zinc-500">
                                                            Total
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {selectedBuild.items?.map(
                                                        (item) => (

                                                            <tr
                                                                key={
                                                                    item.id
                                                                }
                                                                className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/40"
                                                            >

                                                                {/* Product */}
                                                                <td className="px-4 py-4">

                                                                    <div className="flex items-center gap-3">

                                                                        {/* Product Image */}
                                                                        {item.images &&
                                                                        item.images
                                                                            .length >
                                                                            0 ? (
                                                                            <img
                                                                                src={
                                                                                    item
                                                                                        .images[0]
                                                                                }
                                                                                alt={
                                                                                    item.productName
                                                                                }
                                                                                className="w-10 h-10 object-contain rounded-md bg-zinc-900 border border-zinc-800"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-600">
                                                                                N/A
                                                                            </div>
                                                                        )}

                                                                        <div>

                                                                            <p className="font-medium text-zinc-100">
                                                                                {
                                                                                    item.productName
                                                                                }
                                                                            </p>

                                                                        </div>

                                                                    </div>

                                                                </td>


                                                                {/* Category */}
                                                                <td className="px-4 py-4 text-zinc-400">
                                                                    {
                                                                        item.category
                                                                    }
                                                                </td>


                                                                {/* Brand */}
                                                                <td className="px-4 py-4 text-zinc-400">
                                                                    {
                                                                        item.brand
                                                                    }
                                                                </td>


                                                                {/* Quantity */}
                                                                <td className="px-4 py-4 text-center text-zinc-400">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </td>


                                                                {/* Unit Price */}
                                                                <td className="px-4 py-4 text-right text-zinc-400">
                                                                    Rs.{" "}
                                                                    {item.unitPrice?.toLocaleString()}
                                                                </td>


                                                                {/* Total Price */}
                                                                <td className="px-4 py-4 text-right font-medium text-zinc-200">
                                                                    Rs.{" "}
                                                                    {item.totalPrice?.toLocaleString()}
                                                                </td>

                                                            </tr>

                                                        )
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>


                                    {/* Summary */}
                                    <div className="mt-6 flex justify-end">

                                        <div className="w-full sm:w-80 border border-zinc-800 rounded-lg bg-zinc-900/40 p-5">

                                            <div className="flex justify-between text-sm">

                                                <span className="text-zinc-500">
                                                    Total Components
                                                </span>

                                                <span className="text-zinc-300">
                                                    {selectedBuild.items
                                                        ?.length || 0}
                                                </span>

                                            </div>


                                            <div className="border-t border-zinc-800 my-4" />


                                            <div className="flex justify-between">

                                                <span className="font-medium text-zinc-300">
                                                    Total
                                                </span>

                                                <span className="text-lg font-semibold text-white">
                                                    Rs.{" "}
                                                    {getBuildTotal(
                                                        selectedBuild
                                                    ).toLocaleString()}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </>

                            )}

                        </div>


                        {/* Modal Footer */}
                        <div className="flex justify-end px-6 py-4 border-t border-zinc-800">

                            <button
                                onClick={closeBuildModal}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default PcBuildsPage;
