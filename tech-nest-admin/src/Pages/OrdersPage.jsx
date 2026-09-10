import { useEffect, useState } from "react";
import api from "@/lib/axios";

export function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/Order");
            setOrders(response.data);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (id) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmCancel) return;

        try {
            await api.delete(`/Order/${id}`);

            // Local state එකේ status එක Cancelled ලෙස update කිරීම
            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === id ? { ...order, status: "Cancelled" } : order
                )
            );
        } catch (err) {
            console.error("Failed to cancel order:", err);
            alert("Failed to cancel order.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
            case "pending":
                return "bg-amber-950/40 text-amber-400 border-amber-900/50";
            case "inassembly":
            case "in assembly":
                return "bg-blue-950/40 text-blue-400 border-blue-900/50";
            case "dispatched":
            case "completed":
                return "bg-purple-950/40 text-purple-400 border-purple-900/50";
            case "cancelled":
                return "bg-red-950/40 text-red-400 border-red-900/50";
            default:
                return "bg-zinc-900 text-zinc-400 border-zinc-800";
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Orders Management
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Track and manage customer PC build & part orders
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Table Container */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">
                {loading ? (
                    <div className="text-center py-16 text-zinc-500">
                        Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        No orders found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            {/* Table Head */}
                            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-xs border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Items Count</th>
                                    <th className="px-6 py-4">Total Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Placed Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/60 transition-colors"
                                    >
                                        {/* Order ID */}
                                        <td className="px-6 py-4 font-mono font-medium text-zinc-200">
                                            #ORD-{order.id}
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-zinc-100">
                                                    {order.customerName}
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {order.customerEmail}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-4 text-zinc-300">
                                            <span className="px-2.5 py-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                                                {order.orderType}
                                            </span>
                                        </td>

                                        {/* Items */}
                                        <td className="px-6 py-4 text-zinc-400">
                                            {order.items?.length || 0} items
                                        </td>

                                        {/* Total Amount */}
                                        <td className="px-6 py-4 font-medium text-zinc-200">
                                            Rs. {order.totalAmount?.toLocaleString()}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadge(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-zinc-500 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {order.status !== "Cancelled" && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-950/60 hover:text-red-300 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
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

export default OrdersPage;