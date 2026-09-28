import { useEffect, useState } from "react";

import api from "@/lib/axios";

export function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalStatus, setModalStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [updating, setUpdating] = useState(false);

    const fetchOrders = async (pageNumber = page) => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/Order/admin", {
                params: {
                    page: pageNumber,
                    pageSize,
                },
            });

            const data = response.data;

            setOrders(data.items || []);
            setPage(data.page || pageNumber);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount || 0);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError("Failed to load orders.");
            setOrders([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

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

            alert(
                err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to update status."
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelOrder = async (id) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmCancel) return;

        try {
            await api.delete(`/Order/${id}`);

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === id
                        ? {
                              ...order,
                              status: "Cancelled",
                          }
                        : order
                )
            );

            if (selectedOrder?.id === id) {
                setSelectedOrder((current) =>
                    current
                        ? {
                              ...current,
                              status: "Cancelled",
                          }
                        : current
                );

                setModalStatus("Cancelled");
            }
        } catch (err) {
            console.error("Failed to cancel order:", err);
            alert("Failed to cancel order.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return "bg-green-950/40 text-green-400 border-green-900/50";

            case "pending":
                return "bg-zinc-900 text-zinc-400 border-zinc-800";

            case "inassembly":
            case "in assembly":
                return "bg-zinc-800 text-zinc-300 border-zinc-700";

            case "dispatched":
                return "bg-zinc-800 text-zinc-300 border-zinc-700";

            case "completed":
                return "bg-green-950/40 text-green-400 border-green-900/50";

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
                className:
                    "bg-zinc-900 text-zinc-400 border-zinc-800",
            };
        }

        if (
            [
                "pc build",
                "build",
                "pcbuilder",
                "pc-builder",
                "custompc",
            ].includes(normalized.toLowerCase())
        ) {
            return {
                label: "PC Build",
                className:
                    "bg-zinc-900 text-zinc-300 border-zinc-700",
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
                className:
                    "bg-zinc-900 text-zinc-300 border-zinc-700",
            };
        }

        return {
            label: normalized,
            className:
                "bg-zinc-900 text-zinc-400 border-zinc-800",
        };
    };

    const getCustomerDetails = (order) => {
        const customer = order?.customer || order?.user || {};

        const findNestedValue = (source, candidates) => {
            if (!source || typeof source !== "object") {
                return null;
            }

            const seen = new Set();

            const walk = (value) => {
                if (!value || typeof value !== "object") {
                    return null;
                }

                if (seen.has(value)) {
                    return null;
                }

                seen.add(value);

                if (Array.isArray(value)) {
                    for (const item of value) {
                        const result = walk(item);

                        if (result !== null) {
                            return result;
                        }
                    }

                    return null;
                }

                for (const [key, nestedValue] of Object.entries(value)) {
                    const normalizedKey = key.toLowerCase();

                    const matched = candidates.some(
                        (candidate) =>
                            normalizedKey ===
                                candidate.toLowerCase() ||
                            normalizedKey.includes(
                                candidate.toLowerCase()
                            )
                    );

                    if (
                        matched &&
                        nestedValue !== undefined &&
                        nestedValue !== null &&
                        nestedValue !== ""
                    ) {
                        return nestedValue;
                    }

                    if (
                        nestedValue &&
                        typeof nestedValue === "object"
                    ) {
                        const result = walk(nestedValue);

                        if (result !== null) {
                            return result;
                        }
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
            if (
                typeof addressSource === "string" &&
                addressSource.trim()
            ) {
                return addressSource;
            }

            const directAddress = findNestedValue(
                addressSource,
                [
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
                ]
            );

            if (
                typeof directAddress === "string" &&
                directAddress.trim()
            ) {
                return directAddress;
            }

            if (
                directAddress &&
                typeof directAddress === "object"
            ) {
                const parts = [
                    directAddress.street ||
                        directAddress.addressLine1 ||
                        directAddress.line1,

                    directAddress.addressLine2 ||
                        directAddress.line2,

                    directAddress.city,
                    directAddress.state,
                    directAddress.province,
                    directAddress.district,

                    directAddress.postalCode ||
                        directAddress.zipCode,

                    directAddress.country,
                ].filter(Boolean);

                if (parts.length) {
                    return parts.join(", ");
                }
            }

            const orderAddress = findNestedValue(order, [
                "address",
                "shippingAddress",
                "billingAddress",
                "deliveryAddress",
                "customerAddress",
            ]);

            if (
                orderAddress &&
                typeof orderAddress === "object"
            ) {
                const parts = [
                    orderAddress.street ||
                        orderAddress.addressLine1 ||
                        orderAddress.line1,

                    orderAddress.addressLine2 ||
                        orderAddress.line2,

                    orderAddress.city,
                    orderAddress.state,
                    orderAddress.province,
                    orderAddress.district,

                    orderAddress.postalCode ||
                        orderAddress.zipCode,

                    orderAddress.country,
                ].filter(Boolean);

                if (parts.length) {
                    return parts.join(", ");
                }
            }

            return "N/A";
        })();

        return {
            name:
                customer.name ||
                order?.customerName ||
                "Unknown customer",

            email:
                customer.email ||
                order?.customerEmail ||
                "N/A",

            phone,

            address: addressText,
        };
    };

    const getOrderItems = (order) => {
        const items =
            order?.items ||
            order?.orderItems ||
            order?.products ||
            [];

        if (!Array.isArray(items) || items.length === 0) {
            return [];
        }

        return items.map((item, index) => ({
            id:
                item.id ||
                `${order?.id || "item"}-${index}`,

            name:
                item.productName ||
                item.name ||
                item.title ||
                item.product?.name ||
                `Item ${index + 1}`,

            quantity:
                item.quantity ||
                item.qty ||
                1,

            price:
                item.price ||
                item.unitPrice ||
                item.totalPrice ||
                item.amount ||
                0,
        }));
    };

    return (
        <div className="min-h-screen bg-black p-6 text-white">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Orders
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Manage order status and tracking
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-2xl">
                {loading ? (
                    <div className="py-16 text-center text-zinc-500">
                        Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500">
                        No orders found
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Order
                                        </th>

                                        <th className="px-6 py-4">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4">
                                            Amount
                                        </th>

                                        <th className="px-6 py-4">
                                            Type
                                        </th>

                                        <th className="px-6 py-4">
                                            Status
                                        </th>

                                        <th className="px-6 py-4">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/60"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-zinc-100">
                                                        #{order.id}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-zinc-500">
                                                        {order.items
                                                            ?.length ||
                                                            order
                                                                .orderItems
                                                                ?.length ||
                                                            0}{" "}
                                                        item(s)
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-zinc-300">
                                                {order.customerName ||
                                                    "Unknown customer"}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-zinc-200">
                                                Rs.{" "}
                                                {order.totalAmount ??
                                                    0}
                                            </td>

                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const typeInfo =
                                                        getOrderTypeInfo(
                                                            order
                                                        );

                                                    return (
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${typeInfo.className}`}
                                                        >
                                                            {
                                                                typeInfo.label
                                                            }
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadge(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status ||
                                                        "Pending"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-zinc-400">
                                                {order.createdAt
                                                    ? new Date(
                                                          order.createdAt
                                                      ).toLocaleDateString()
                                                    : "N/A"}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleOpenDetails(
                                                                order
                                                            )
                                                        }
                                                        title="View order"
                                                        className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                                                        aria-label="View order"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={
                                                                1.8
                                                            }
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

                        <div className="flex flex-col gap-4 border-t border-zinc-800 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-zinc-500">
                                Showing{" "}
                                <span className="text-zinc-300">
                                    {orders.length}
                                </span>{" "}
                                of{" "}
                                <span className="text-zinc-300">
                                    {totalCount}
                                </span>{" "}
                                orders
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        setPage(
                                            (currentPage) =>
                                                Math.max(
                                                    1,
                                                    currentPage -
                                                        1
                                                )
                                        )
                                    }
                                    disabled={
                                        page === 1 ||
                                        loading
                                    }
                                    className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <div className="whitespace-nowrap px-3 py-1.5 text-sm text-zinc-400">
                                    Page{" "}
                                    <span className="font-medium text-white">
                                        {page}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium text-white">
                                        {totalPages}
                                    </span>
                                </div>

                                <button
                                    onClick={() =>
                                        setPage(
                                            (currentPage) =>
                                                Math.min(
                                                    totalPages,
                                                    currentPage +
                                                        1
                                                )
                                        )
                                    }
                                    disabled={
                                        page >=
                                            totalPages ||
                                        loading
                                    }
                                    className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="orders-modal-scroll max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-5">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-zinc-500">
                                    Order Details
                                </p>

                                <h2 className="mt-1 text-xl font-semibold text-white">
                                    Order #{selectedOrder.id}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                                            Status
                                        </label>

                                        <select
                                            value={modalStatus}
                                            onChange={(event) =>
                                                setModalStatus(
                                                    event.target
                                                        .value
                                                )
                                            }
                                            className="h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none transition focus:border-zinc-500"
                                        >
                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="Approved">
                                                Approved
                                            </option>

                                            {getOrderTypeInfo(
                                                selectedOrder
                                            ).label ===
                                                "PC Build" && (
                                                <option value="InAssembly">
                                                    In Assembly
                                                </option>
                                            )}

                                            <option value="Dispatched">
                                                Dispatched
                                            </option>

                                            <option value="Completed">
                                                Completed
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                                            Tracking Number
                                        </label>

                                        <input
                                            value={
                                                trackingNumber
                                            }
                                            onChange={(event) =>
                                                setTrackingNumber(
                                                    event.target
                                                        .value
                                                )
                                            }
                                            className="h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
                                            placeholder="Enter tracking number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                                <div className="mb-4">
                                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                                        Customer
                                    </p>

                                    <h3 className="mt-1 text-base font-medium text-white">
                                        Customer Details
                                    </h3>
                                </div>

                                <div className="divide-y divide-zinc-900">
                                    <div className="grid grid-cols-[80px_1fr] gap-4 py-3 first:pt-0">
                                        <span className="text-sm text-zinc-500">
                                            Name
                                        </span>

                                        <span className="text-sm text-zinc-200">
                                            {
                                                getCustomerDetails(
                                                    selectedOrder
                                                ).name
                                            }
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[80px_1fr] gap-4 py-3">
                                        <span className="text-sm text-zinc-500">
                                            Email
                                        </span>

                                        <span className="break-all text-sm text-zinc-200">
                                            {
                                                getCustomerDetails(
                                                    selectedOrder
                                                ).email
                                            }
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[80px_1fr] gap-4 py-3">
                                        <span className="text-sm text-zinc-500">
                                            Phone
                                        </span>

                                        <span className="text-sm text-zinc-200">
                                            {
                                                getCustomerDetails(
                                                    selectedOrder
                                                ).phone
                                            }
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[80px_1fr] gap-4 py-3 last:pb-0">
                                        <span className="text-sm text-zinc-500">
                                            Address
                                        </span>

                                        <span className="text-sm leading-6 text-zinc-200">
                                            {
                                                getCustomerDetails(
                                                    selectedOrder
                                                ).address
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-zinc-500">
                                            Items
                                        </p>

                                        <h3 className="mt-1 text-base font-medium text-white">
                                            Order Details
                                        </h3>
                                    </div>

                                    <span className="text-xs text-zinc-500">
                                        {
                                            getOrderItems(
                                                selectedOrder
                                            ).length
                                        }{" "}
                                        item(s)
                                    </span>
                                </div>

                                {getOrderItems(selectedOrder)
                                    .length > 0 ? (
                                    <div className="space-y-2">
                                        {getOrderItems(
                                            selectedOrder
                                        ).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-black px-4 py-3"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-zinc-200">
                                                        {
                                                            item.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        Quantity:{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-sm font-medium text-zinc-100">
                                                    Rs.{" "}
                                                    {
                                                        item.price
                                                    }
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-zinc-800 bg-black px-4 py-6 text-center">
                                        <p className="text-sm text-zinc-500">
                                            No order items
                                            available.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
                                <span className="text-sm text-zinc-500">
                                    Order Total
                                </span>

                                <span className="text-lg font-semibold text-white">
                                    Rs.{" "}
                                    {selectedOrder.totalAmount ??
                                        0}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 bg-zinc-950 px-6 py-5 sm:flex-row sm:justify-between">
                            <button
                                type="button"
                                onClick={() =>
                                    handleCancelOrder(
                                        selectedOrder.id
                                    )
                                }
                                disabled={
                                    updating ||
                                    selectedOrder.status?.toLowerCase() ===
                                        "cancelled"
                                }
                                className="h-11 rounded-lg border border-red-900/50 bg-red-950/30 px-4 text-sm font-medium text-red-400 transition hover:bg-red-950/60 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Cancel Order
                            </button>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={updating}
                                    className="h-11 rounded-lg border border-zinc-700 bg-zinc-900 px-5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleSaveChanges
                                    }
                                    disabled={updating}
                                    className="h-11 rounded-lg bg-white px-5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {updating
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .orders-modal-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #3f3f46 #09090b;
                }

                .orders-modal-scroll::-webkit-scrollbar {
                    width: 8px;
                }

                .orders-modal-scroll::-webkit-scrollbar-track {
                    background: #09090b;
                }

                .orders-modal-scroll::-webkit-scrollbar-thumb {
                    background: #3f3f46;
                    border-radius: 9999px;
                    border: 2px solid #09090b;
                }

                .orders-modal-scroll::-webkit-scrollbar-thumb:hover {
                    background: #52525b;
                }
            `}</style>
        </div>
    );
}