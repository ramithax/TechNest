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
        "https://placehold.co/300x300/18181b/a1a1aa?text=No+Image";

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
                return "bg-green-950/40 text-green-400 border-green-900/50";

            case "Cancelled":
                return "bg-red-950/40 text-red-400 border-red-900/50";

            case "AwaitingApproval":
                return "bg-blue-950/40 text-blue-400 border-blue-900/50";

            case "InProgress":
                return "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";

            case "Diagnosed":
                return "bg-purple-950/40 text-purple-400 border-purple-900/50";

            default:
                return "bg-amber-950/40 text-amber-400 border-amber-900/50";
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
        <div className="min-h-screen bg-black text-white p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Repairs
                    </h1>

                    <p className="text-sm text-zinc-500 mt-1">
                        Monitor and update customer repair requests
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">

                {loading ? (
                    <div className="text-center py-16 text-zinc-500">
                        Loading repairs...
                    </div>
                ) : repairs.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        No repairs found
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">

                            <table className="w-full text-sm text-left">

                                <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-xs border-b border-zinc-800">

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
                                            className="border-b border-zinc-900 hover:bg-zinc-900/60 transition-colors"
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
                                                            className="w-20 h-20 rounded-lg object-cover bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    FALLBACK_IMAGE;
                                                            }}
                                                        />
                                                    </button>

                                                    <div>
                                                        <p className="font-medium text-zinc-100">
                                                            Repair #{repair.id}
                                                        </p>

                                                        <p className="text-xs text-zinc-600 mt-1">
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
                                                            className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 transition"
                                                        >
                                                            View image
                                                        </button>
                                                    </div>

                                                </div>

                                            </td>

                                            {/* Device */}
                                            <td className="px-6 py-5">

                                                <div>
                                                    <p className="font-medium text-zinc-200">
                                                        {repair.deviceModel}
                                                    </p>

                                                    <p className="text-xs text-zinc-600 mt-1">
                                                        ID: {repair.id}
                                                    </p>
                                                </div>

                                            </td>

                                            {/* Issue */}
                                            <td className="px-6 py-5 text-zinc-400 max-w-md">

                                                <p className="line-clamp-3">
                                                    {repair.issueDescription ||
                                                        "No issue description provided."}
                                                </p>

                                            </td>

                                            {/* Appointment */}
                                            <td className="px-6 py-5">

                                                <div>
                                                    <p className="text-zinc-200 font-medium">
                                                        {formatAppointmentDate(
                                                            repair.appointmentDate
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-zinc-500 mt-1">
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
                                                    className={`cursor-pointer appearance-none text-center outline-none inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusStyle(
                                                        repair.status
                                                    )}`}
                                                >
                                                    {statusOptions.map(
                                                        (option) => (
                                                            <option
                                                                key={option}
                                                                value={option}
                                                                className="bg-zinc-900 text-white"
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-t border-zinc-800">

                            <div className="text-sm text-zinc-500">
                                Showing{" "}
                                <span className="text-zinc-300">
                                    {paginatedRepairs.length}
                                </span>{" "}
                                of{" "}
                                <span className="text-zinc-300">
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
                                    className="px-3 py-1.5 text-sm rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    Previous
                                </button>

                                <div className="px-3 py-1.5 text-sm text-zinc-400 whitespace-nowrap">
                                    Page{" "}
                                    <span className="text-white font-medium">
                                        {page}
                                    </span>{" "}
                                    of{" "}
                                    <span className="text-white font-medium">
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
                                    className="px-3 py-1.5 text-sm rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                <AlertDialogContent className="bg-zinc-950 border border-zinc-800 text-white">

                    <AlertDialogHeader>

                        <AlertDialogTitle className="text-lg font-semibold text-white">
                            Change Repair Status?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-zinc-400">
                            Are you sure you want to change the status of{" "}
                            <span className="font-medium text-white">
                                Repair #{selectedRepair?.id}
                            </span>{" "}
                            from{" "}
                            <span className="font-medium text-white">
                                {selectedRepair?.status}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium text-white">
                                {selectedStatus}
                            </span>
                            ?
                        </AlertDialogDescription>

                    </AlertDialogHeader>

                    <AlertDialogFooter>

                        <AlertDialogCancel
                            className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            onClick={() => {
                                setSelectedRepair(null);
                                setSelectedStatus("");
                            }}
                        >
                            No, Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleStatusUpdate}
                            className="bg-white text-black hover:bg-zinc-200"
                        >
                            Confirm Change
                        </AlertDialogAction>

                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>

            {/* Image Preview */}
            {imageOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
                    onClick={() => setImageOpen(false)}
                >

                    <div
                        className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-5"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between mb-4">

                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {selectedDevice}
                                </h2>

                                <p className="text-sm text-zinc-500 mt-1">
                                    Repair image
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setImageOpen(false)}
                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                            >
                                Close
                            </button>

                        </div>

                        <div className="flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden min-h-[400px]">

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