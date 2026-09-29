import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export function CustomerPage() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const totalCount = users.length;
    const totalPages = Math.max(
        1,
        Math.ceil(totalCount / pageSize)
    );

    const paginatedUsers = users.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const getUsers = async () => {
        try {
            setIsLoading(true);

            const response = await api.get("/Auth/users");

            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);

            toast.error(
                error.response?.data?.message ||
                    "Failed to fetch users"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const handleView = (user) => {
        setSelectedUser({ ...user });
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleOnSubmit = async () => {
        try {
            const response = await api.put(
                `/Auth/users/${selectedUser.id}`,
                {
                    role: selectedUser.role,
                    isBlocked: selectedUser.isBlocked,
                }
            );

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === selectedUser.id
                        ? response.data
                        : user
                )
            );

            toast.success("User updated successfully");

            handleClose();
        } catch (error) {
            console.error("Failed to update user:", error);

            toast.error(
                error.response?.data?.message ||
                    "Failed to update user"
            );
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-50 p-6 text-zinc-900 md:p-8">
            {/* Background accents */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />

            <div className="relative">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        Customers
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Manage your customers
                    </p>
                </div>

                {/* Table Container */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 shadow-lg shadow-zinc-200/50 backdrop-blur-xl">
                    {isLoading ? (
                        <div className="py-16 text-center text-zinc-500">
                            Loading users...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-16 text-center text-zinc-500">
                            No users found
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-[800px] w-full text-left text-sm">
                                    {/* Table Header */}
                                    <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
                                        <tr>
                                            <th className="px-6 py-4">
                                                Name
                                            </th>

                                            <th className="px-6 py-4">
                                                Email
                                            </th>

                                            <th className="px-6 py-4">
                                                Role
                                            </th>

                                            <th className="px-6 py-4">
                                                Status
                                            </th>

                                            <th className="px-6 py-4">
                                                Date
                                            </th>

                                            <th className="px-6 py-4 text-right">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody>
                                        {paginatedUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-zinc-100 transition-colors hover:bg-zinc-50"
                                            >
                                                {/* Name */}
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-zinc-900">
                                                        {user.name}
                                                    </p>
                                                </td>

                                                {/* Email */}
                                                <td className="break-all px-6 py-4 text-zinc-600">
                                                    {user.email}
                                                </td>

                                                {/* Role */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                            user.role?.toUpperCase() ===
                                                            "ADMIN"
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border-zinc-200 bg-zinc-100 text-zinc-600"
                                                        }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                            user.isBlocked
                                                                ? "border-red-200 bg-red-50 text-red-700"
                                                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        }`}
                                                    >
                                                        {user.isBlocked
                                                            ? "Blocked"
                                                            : "Active"}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 text-zinc-500">
                                                    {user.createdAt
                                                        ? new Date(
                                                              user.createdAt
                                                          ).toLocaleDateString()
                                                        : "-"}
                                                </td>

                                                {/* Action */}
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleView(
                                                                user
                                                            )
                                                        }
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                                                        aria-label="View user"
                                                    >
                                                        <Eye size={17} />
                                                    </button>
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
                                    <span className="font-semibold text-zinc-700">
                                        {paginatedUsers.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-zinc-700">
                                        {totalCount}
                                    </span>{" "}
                                    users
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
                                            isLoading
                                        }
                                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
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
                                            isLoading
                                        }
                                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* USER MODAL */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900">
                                    Update User
                                </h2>

                                <p className="mt-1 text-xs text-zinc-500">
                                    Manage customer account settings
                                </p>
                            </div>

                            <button
                                onClick={handleClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="space-y-5 p-6">
                            {/* Name */}
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Name
                                </p>

                                <p className="font-semibold text-zinc-900">
                                    {selectedUser.name}
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Email
                                </p>

                                <p className="break-all font-medium text-zinc-700">
                                    {selectedUser.email}
                                </p>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="text-sm font-semibold text-zinc-700">
                                    Role
                                </label>

                                <select
                                    value={selectedUser.role}
                                    onChange={(e) =>
                                        setSelectedUser((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      role: e
                                                          .target
                                                          .value,
                                                  }
                                                : null
                                        )
                                    }
                                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                                >
                                    <option value="Customer">
                                        USER
                                    </option>

                                    <option value="Admin">
                                        ADMIN
                                    </option>
                                </select>
                            </div>

                            {/* Block Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-zinc-700">
                                    Account Status
                                </span>

                                <button
                                    onClick={() =>
                                        setSelectedUser((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      isBlocked:
                                                          !prev.isBlocked,
                                                  }
                                                : null
                                        )
                                    }
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                        selectedUser.isBlocked
                                            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    }`}
                                >
                                    {selectedUser.isBlocked
                                        ? "Blocked"
                                        : "Active"}
                                </button>
                            </div>

                            {/* Created Date */}
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Created At
                                </p>

                                <p className="text-sm text-zinc-700">
                                    {selectedUser.createdAt
                                        ? new Date(
                                              selectedUser.createdAt
                                          ).toLocaleString()
                                        : "-"}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 border-t border-zinc-200 px-6 py-4">
                            <button
                                onClick={handleClose}
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleOnSubmit}
                                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}