import { useEffect, useState } from "react";
import api from "@/lib/axios";

export function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalStatus, setModalStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [updating, setUpdating] = useState(false);

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

    const handleOpenDetails = (order) => {
        setSelectedOrder(order);
        setModalStatus(order.status || "Pending");
        setTrackingNumber(order.trackingNumber || "");
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setUpdating(false);
    };

    const handleSaveChanges = async () => {
        if (!selectedOrder) return;

        try {
            setUpdating(true);

            await api.put(`/Order/${selectedOrder.id}/status`, {
                status: modalStatus,
                trackingNumber,
            });

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === selectedOrder.id
                        ? {
                              ...order,
                              status: modalStatus,
                              trackingNumber,
                          }
                        : order
                )
            );

            handleCloseModal();
        } catch (err) {
            console.error("Failed to update status:", err);
            alert(err.response?.data?.message || err.response?.data || "Failed to update status.");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelOrder = async (id) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmCancel) return;

        try {
            await api.delete(`/Order/${id}`);
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

    const getOrderTypeInfo = (order) => {
        const rawType =
            order?.orderType ||
            order?.type ||
            order?.productType ||
            order?.purchaseType ||
            order?.buildType ||
            order?.category ||
            order?.itemType ||
            (order?.isPcBuild ? "PC Build" : "") ||
            (order?.isBuild ? "PC Build" : "") ||
            "Unknown";

        const normalized = String(rawType).trim();

        if (!normalized || normalized.toLowerCase() === "unknown") {
            return {
                label: "Unknown",
                className: "bg-zinc-900 text-zinc-400 border-zinc-800",
            };
        }

        if (
            ["pc build", "build", "pcbuilder", "pc-builder", "custompc"].includes(
                normalized.toLowerCase()
            )
        ) {
            return {
                label: "PC Build",
                className: "bg-violet-950/40 text-violet-400 border-violet-900/50",
            };
        }

        if (
            [
                "individual part",
                "individualparts",
                "individual",
                "part",
                "parts",
                "single part",
                "component",
            ].includes(normalized.toLowerCase())
        ) {
            return {
                label: "Individual Part",
                className: "bg-violet-950/40 text-violet-400 border-violet-900/50",
            };
        }

        return {
            label: normalized,
            className: "bg-zinc-900 text-zinc-400 border-zinc-800",
        };
    };

    const getCustomerDetails = (order) => {
        const customer = order?.customer || order?.user || {};

        const findNestedValue = (source, candidates) => {
            if (!source || typeof source !== "object") return null;

            const seen = new Set();

            const walk = (value) => {
                if (!value) return null;
                if (typeof value !== "object") return null;
                if (seen.has(value)) return null;
                seen.add(value);

                if (Array.isArray(value)) {
                    for (const item of value) {
                        const result = walk(item);
                        if (result !== null) return result;
                    }
                    return null;
                }

                for (const [key, nestedValue] of Object.entries(value)) {
                    const normalizedKey = key.toLowerCase();
                    const matched = candidates.some(
                        (candidate) =>
                            normalizedKey === candidate.toLowerCase() ||
                            normalizedKey.includes(candidate.toLowerCase())
                    );

                    if (matched && nestedValue !== undefined && nestedValue !== null && nestedValue !== "") {
                        return nestedValue;
                    }

                    if (nestedValue && typeof nestedValue === "object") {
                        const result = walk(nestedValue);
                        if (result !== null) return result;
                    }
                }

                return null;
            };

            return walk(source);
        };

        const phone =
            findNestedValue(customer, [
                "phone",
                "phoneNumber",
                "phoneNo",
                "mobile",
                "mobileNumber",
                "contactNumber",
                "contactNo",
                "telephone",
                "tel",
            ]) ||
            findNestedValue(order, [
                "phone",
                "phoneNumber",
                "phoneNo",
                "mobile",
                "mobileNumber",
                "contactNumber",
                "contactNo",
                "telephone",
                "tel",
                "customerPhone",
                "customerPhoneNumber",
            ]) ||
            "N/A";

        const addressSource =
            order?.shippingAddress ||
            order?.billingAddress ||
            order?.deliveryAddress ||
            order?.address ||
            order?.customerAddress ||
            customer?.address ||
            customer?.shippingAddress ||
            customer?.billingAddress ||
            order ||
            {};

        const addressText = (() => {
            if (typeof addressSource === "string" && addressSource.trim()) {
                return addressSource;
            }

            const directAddress =
                findNestedValue(addressSource, [
                    "fullAddress",
                    "formattedAddress",
                    "address",
                    "homeAddress",
                    "shippingAddress",
                    "billingAddress",
                    "deliveryAddress",
                    "customerAddress",
                    "userAddress",
                    "addressDetails",
                    "streetAddress",
                    "addressLine",
                    "addressLine1",
                    "addressLine2",
                    "street",
                    "line1",
                    "line2",
                ]);

            if (typeof directAddress === "string" && directAddress.trim()) {
                return directAddress;
            }

            if (directAddress && typeof directAddress === "object") {
                const parts = [
                    directAddress.street || directAddress.addressLine1 || directAddress.line1,
                    directAddress.addressLine2 || directAddress.line2,
                    directAddress.city,
                    directAddress.state,
                    directAddress.province,
                    directAddress.district,
                    directAddress.postalCode || directAddress.zipCode,
                    directAddress.country,
                ].filter(Boolean);

                if (parts.length) return parts.join(", ");
            }

            const orderAddress = findNestedValue(order, [
                "address",
                "shippingAddress",
                "billingAddress",
                "deliveryAddress",
                "customerAddress",
            ]);

            if (orderAddress && typeof orderAddress === "object") {
                const parts = [
                    orderAddress.street || orderAddress.addressLine1 || orderAddress.line1,
                    orderAddress.addressLine2 || orderAddress.line2,
                    orderAddress.city,
                    orderAddress.state,
                    orderAddress.province,
                    orderAddress.district,
                    orderAddress.postalCode || orderAddress.zipCode,
                    orderAddress.country,
                ].filter(Boolean);

                if (parts.length) return parts.join(", ");
            }

            return "N/A";
        })();

        return {
            name: customer.name || order?.customerName || "Unknown customer",
            email: customer.email || order?.customerEmail || "N/A",
            phone,
            address: addressText,
        };
    };

    const getOrderItems = (order) => {
        const items = order?.items || order?.orderItems || order?.products || [];

        if (!Array.isArray(items) || items.length === 0) {
            return [];
        }

        return items.map((item, index) => ({
            id: item.id || `${order?.id || "item"}-${index}`,
            name:
                item.productName ||
                item.name ||
                item.title ||
                item.product?.name ||
                `Item ${index + 1}`,
            quantity: item.quantity || item.qty || 1,
            price: item.price || item.unitPrice || item.totalPrice || item.amount || 0,
        }));
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Orders</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage order status and tracking</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">
                {loading ? (
                    <div className="text-center py-16 text-zinc-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">No orders found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-xs border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/60 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-zinc-100">#{order.id}</p>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {order.items?.length || 0} item(s)
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-zinc-300">
                                            {order.customerName || "Unknown customer"}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-zinc-200">
                                            Rs. {order.totalAmount ?? 0}
                                        </td>

                                        <td className="px-6 py-4">
                                            {(() => {
                                                const typeInfo = getOrderTypeInfo(order);
                                                return (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${typeInfo.className}`}
                                                    >
                                                        {typeInfo.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadge(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status || "Pending"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-zinc-400">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString()
                                                : "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenDetails(order)}
                                                    title="View order"
                                                    className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                                    aria-label="View order"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.8}
                                                        stroke="currentColor"
                                                        className="h-4 w-4"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Zm9.75 3.75A3.75 3.75 0 1 0 12 8.25a3.75 3.75 0 0 0 0 7.5Z"
                                                        />
                                                    </svg>
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

            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl sm:p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                Order #{selectedOrder.id}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-sm text-zinc-400 hover:text-white"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm text-zinc-300">Status</label>
                                <select
                                    value={modalStatus}
                                    onChange={(event) => setModalStatus(event.target.value)}
                                    className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-white outline-none focus:border-zinc-500"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    {getOrderTypeInfo(selectedOrder).label === "PC Build" && (
                                        <option value="InAssembly">In Assembly</option>
                                    )}
                                    <option value="Dispatched">Dispatched</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-zinc-300">Tracking Number</label>
                                <input
                                    value={trackingNumber}
                                    onChange={(event) => setTrackingNumber(event.target.value)}
                                    className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-white outline-none focus:border-zinc-500"
                                    placeholder="Enter tracking number"
                                />
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400">
                                    Customer Details
                                </h3>
                                <div className="grid gap-2 text-sm text-zinc-300">
                                    <p className="grid grid-cols-[4.5rem_1fr] gap-2">
                                        <span className="text-zinc-500">Name:</span>
                                        {getCustomerDetails(selectedOrder).name}
                                    </p>
                                    <p className="grid grid-cols-[4.5rem_1fr] gap-2">
                                        <span className="text-zinc-500">Email:</span>
                                        {getCustomerDetails(selectedOrder).email}
                                    </p>
                                    <p className="grid grid-cols-[4.5rem_1fr] gap-2">
                                        <span className="text-zinc-500">Phone:</span>
                                        {getCustomerDetails(selectedOrder).phone}
                                    </p>
                                    <p className="grid grid-cols-[4.5rem_1fr] gap-2">
                                        <span className="text-zinc-500">Address:</span>
                                        {getCustomerDetails(selectedOrder).address}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400">
                                    Order Details
                                </h3>

                                {getOrderItems(selectedOrder).length > 0 ? (
                                    <div className="space-y-3">
                                        {getOrderItems(selectedOrder).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-black/20 px-3 py-2"
                                            >
                                                <div>
                                                    <p className="font-medium text-zinc-200">{item.name}</p>
                                                    <p className="text-xs text-zinc-500">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-medium text-zinc-100">
                                                    Rs. {item.price}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-400">No order items available.</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                            <button
                                onClick={() => handleCancelOrder(selectedOrder.id)}
                                className="h-11 rounded-lg border border-red-900/50 bg-red-950/30 px-4 text-sm font-medium text-red-400 hover:bg-red-950/60 hover:text-red-300"
                            >
                                Cancel Order
                            </button>

                            <button
                                onClick={handleSaveChanges}
                                disabled={updating}
                                className="h-11 rounded-lg bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-60"
                            >
                                {updating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
