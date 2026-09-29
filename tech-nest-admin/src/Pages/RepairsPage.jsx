import { useEffect, useState } from "react";

import { repairService } from "../services/repairService";

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

export function RepairPage() {
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const [imageOpen, setImageOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState("");

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");

    const statusOptions = [
        "Pending",
        "Diagnosed",
        "AwaitingApproval",
        "InProgress",
        "Completed",
        "Cancelled",
    ];

    const FALLBACK_IMAGE =
        "https://placehold.co/300x300/f4f4f5/71717a?text=No+Image";

    const totalCount = repairs.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalCount / pageSize)
    );

    const paginatedRepairs = repairs.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const fetchRepairs = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await repairService.getAllRepairs();

            setRepairs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch repairs:", error);

            setError("Failed to load repair tickets.");
            setRepairs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepairs();
    }, []);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const openStatusDialog = (repair, newStatus) => {
        if (repair.status === newStatus) {
            return;
        }

        setSelectedRepair(repair);
        setSelectedStatus(newStatus);
        setStatusDialogOpen(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedRepair || !selectedStatus) {
            return;
        }

        try {
            const statusIndex = statusOptions.indexOf(
                selectedStatus
            );

            await repairService.updateStatus(
                selectedRepair.id,
                statusIndex
            );

            setRepairs((currentRepairs) =>
                currentRepairs.map((repair) =>
                    repair.id === selectedRepair.id
                        ? {
                            ...repair,
                            status: selectedStatus,
                        }
                        : repair
                )
            );

            setStatusDialogOpen(false);
            setSelectedRepair(null);
            setSelectedStatus("");
        } catch (error) {
            console.error("Failed to update status:", error);

            setStatusDialogOpen(false);

            alert("Failed to update status.");

            fetchRepairs();
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Completed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";

            case "Cancelled":
                return "bg-red-50 text-red-700 border-red-200";

            case "AwaitingApproval":
                return "bg-blue-50 text-blue-700 border-blue-200";

            case "InProgress":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";

            case "Diagnosed":
                return "bg-purple-50 text-purple-700 border-purple-200";

            default:
                return "bg-amber-50 text-amber-700 border-amber-200";
        }
    };

    const formatAppointmentDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatAppointmentTime = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const openImagePreview = (imageUrl, deviceModel) => {
        setSelectedImage(imageUrl || FALLBACK_IMAGE);
        setSelectedDevice(deviceModel || "Repair Image");
        setImageOpen(true);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-50 p-6 text-zinc-900 md:p-8">

            {/* Background accents */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

            {/* Header */}
            <div className="relative mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        Repairs
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Monitor and update customer repair requests
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="relative mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Table Card */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 shadow-lg shadow-zinc-200/50 backdrop-blur-xl">

                {loading ? (
                    <div className="py-16 text-center text-zinc-500">
                        Loading repairs...
                    </div>
                ) : repairs.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500">
                        No repairs found
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">

                                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Ticket
                                        </th>

                                        <th className="px-6 py-4">
                                            Device
                                        </th>

                                        <th className="px-6 py-4">
                                            Issue Description
                                        </th>

                                        <th className="px-6 py-4">
                                            Appointment
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedRepairs.map((repair) => (
                                        <tr
                                            key={repair.id}
                                            className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
                                        >
                                            {/* Ticket */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openImagePreview(
                                                                repair.imageUrl,
                                                                repair.deviceModel
                                                            )
                                                        }
                                                        className="shrink-0 cursor-pointer"
                                                    >
                                                        <img
                                                            src={
                                                                repair.imageUrl ||
                                                                FALLBACK_IMAGE
                                                            }
                                                            alt={
                                                                repair.deviceModel ||
                                                                "Repair device"
                                                            }
                                                            className="h-20 w-20 rounded-xl border border-zinc-200 bg-zinc-100 object-cover transition hover:border-zinc-400"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    FALLBACK_IMAGE;
                                                            }}
                                                        />
                                                    </button>

                                                    <div>
                                                        <p className="font-semibold text-zinc-900">
                                                            Repair #{repair.id}
                                                        </p>

                                                        <p className="mt-1 text-xs text-zinc-500">
                                                            Customer ID:{" "}
                                                            {repair.customerId}
                                                        </p>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openImagePreview(
                                                                    repair.imageUrl,
                                                                    repair.deviceModel
                                                                )
                                                            }
                                                            className="mt-2 text-xs text-zinc-500 transition hover:text-zinc-900"
                                                        >
                                                            View image
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Device */}
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="font-semibold text-zinc-800">
                                                        {repair.deviceModel}
                                                    </p>

                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        ID: {repair.id}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Issue */}
                                            <td className="max-w-md px-6 py-5 text-zinc-600">
                                                <p className="line-clamp-3">
                                                    {repair.issueDescription ||
                                                        "No issue description provided."}
                                                </p>
                                            </td>

                                            {/* Appointment */}
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="font-semibold text-zinc-800">
                                                        {formatAppointmentDate(
                                                            repair.appointmentDate
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        {formatAppointmentTime(
                                                            repair.appointmentDate
                                                        )}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-5 text-right">
                                                <select
                                                    value={repair.status}
                                                    onChange={(e) =>
                                                        openStatusDialog(
                                                            repair,
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`cursor-pointer appearance-none rounded-full border px-2.5 py-1 text-center text-xs font-semibold outline-none ${getStatusStyle(
                                                        repair.status
                                                    )}`}
                                                >
                                                    {statusOptions.map(
                                                        (option) => (
                                                            <option
                                                                key={option}
                                                                value={option}
                                                                className="bg-white text-zinc-900"
                                                            >
                                                                {option}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-4 border-t border-zinc-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="text-sm text-zinc-500">
                                Showing{" "}
                                <span className="font-semibold text-zinc-800">
                                    {paginatedRepairs.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-zinc-800">
                                    {totalCount}
                                </span>{" "}
                                repairs
                            </div>

                            <div className="flex items-center gap-2">

                                <button
                                    onClick={() =>
                                        setPage((currentPage) =>
                                            Math.max(
                                                1,
                                                currentPage - 1
                                            )
                                        )
                                    }
                                    disabled={
                                        page === 1 ||
                                        loading
                                    }
                                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <div className="whitespace-nowrap px-3 py-1.5 text-sm text-zinc-500">
                                    Page{" "}
                                    <span className="font-semibold text-zinc-900">
                                        {page}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-zinc-900">
                                        {totalPages}
                                    </span>
                                </div>

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
                                        page >= totalPages ||
                                        loading
                                    }
                                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>

                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Status Confirmation Dialog */}
            <AlertDialog
                open={statusDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedRepair(null);
                        setSelectedStatus("");
                    }

                    setStatusDialogOpen(open);
                }}
            >
                <AlertDialogContent className="border border-zinc-200 bg-white text-zinc-900 shadow-xl">

                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-zinc-900">
                            Change Repair Status?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-zinc-500">
                            Are you sure you want to change the status of{" "}
                            <span className="font-semibold text-zinc-900">
                                Repair #{selectedRepair?.id}
                            </span>{" "}
                            from{" "}
                            <span className="font-semibold text-zinc-900">
                                {selectedRepair?.status}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-zinc-900">
                                {selectedStatus}
                            </span>
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>

                        <AlertDialogCancel
                            className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                            onClick={() => {
                                setSelectedRepair(null);
                                setSelectedStatus("");
                            }}
                        >
                            No, Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleStatusUpdate}
                            className="bg-zinc-900 font-semibold text-white hover:bg-zinc-800"
                        >
                            Confirm Change
                        </AlertDialogAction>

                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Image Preview */}
            {imageOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-6 backdrop-blur-sm"
                    onClick={() => setImageOpen(false)}
                >
                    <div
                        className="relative w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900">
                                    {selectedDevice}
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Repair image
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setImageOpen(false)}
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex min-h-[400px] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">

                            <img
                                src={
                                    selectedImage ||
                                    FALLBACK_IMAGE
                                }
                                alt={selectedDevice}
                                className="max-h-[650px] max-w-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        FALLBACK_IMAGE;
                                }}
                            />

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}