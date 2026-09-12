import { useState, useEffect } from "react";
import { repairService } from "../services/repairService";

export function RepairPage() {
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const statusOptions = [
        "Pending",
        "Diagnosed",
        "AwaitingApproval",
        "InProgress",
        "Completed",
        "Cancelled"
    ];

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

    const handleStatusUpdate = async (id, newStatusName) => {
        try {
            const statusIndex = statusOptions.indexOf(newStatusName);
            await repairService.updateStatus(id, statusIndex);

            setRepairs(currentRepairs =>
                currentRepairs.map(repair =>
                    repair.id === id ? { ...repair, status: newStatusName } : repair
                )
            );
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status.");
            fetchRepairs();
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed':
                return "bg-green-950/40 text-green-400 border-green-900/50";
            case 'Cancelled':
                return "bg-red-950/40 text-red-400 border-red-900/50";
            case 'AwaitingApproval':
                return "bg-blue-950/40 text-blue-400 border-blue-900/50";
            case 'InProgress':
                return "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
            default:
                return "bg-amber-950/40 text-amber-400 border-amber-900/50";
        }
    };

    const FALLBACK_IMAGE = "https://placehold.co/150x150/18181b/a1a1aa?text=No+Image";

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

            {/* Table Container */}
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">

                            {/* Table Head */}
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

                                    <th className="px-6 py-4 text-right">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {repairs.map((repair) => (
                                    <tr
                                        key={repair.id}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/60 transition-colors"
                                    >

                                        {/* Ticket */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">

                                                <img
                                                    src={repair.imageUrl || FALLBACK_IMAGE}
                                                    alt={repair.deviceModel}
                                                    className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                                                    onError={(e) => { e.target.src = FALLBACK_IMAGE }}
                                                />

                                                <div>
                                                    <p className="font-medium text-zinc-100">
                                                        {repair.deviceModel}
                                                    </p>

                                                    <p className="text-xs text-zinc-600 mt-0.5">
                                                        ID: {repair.id}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Device Details */}
                                        <td className="px-6 py-4 font-medium text-zinc-200">
                                            {repair.customerId}
                                        </td>

                                        {/* Issue */}
                                        <td className="px-6 py-4 text-zinc-400 max-w-xs">
                                            {repair.issueDescription}
                                        </td>

                                        {/* Status / Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={repair.status}
                                                onChange={(e) => handleStatusUpdate(repair.id, e.target.value)}
                                                className={`cursor-pointer appearance-none text-center outline-none inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusStyle(repair.status)}`}
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option} value={option} className="bg-zinc-900 text-white">
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
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