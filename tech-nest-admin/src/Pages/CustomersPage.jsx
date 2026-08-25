import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export function CustomerPage() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all users
    const getUsers = async () => {
        try {
            setIsLoading(true);

            const response = await api.get("/Auth/users");

            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);

            toast.error(
                error.response?.data?.message || "Failed to fetch users"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch users when page loads
    useEffect(() => {
        getUsers();
    }, []);

    // Open modal
    const handleView = (user) => {
        setSelectedUser({ ...user });
        setIsModalOpen(true);
    };

    // Close modal
    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    // Save changes
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
        <div className="min-h-screen bg-black text-white p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white">
                    Customers
                </h1>

                <p className="text-sm text-zinc-500 mt-1">
                    Manage your customers
                </p>
            </div>

            {/* Table Container */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden">

                {isLoading ? (
                    <div className="text-center py-16 text-zinc-500">
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        No users found
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm text-left min-w-[800px]">

                            {/* Table Header */}
                            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-xs border-b border-zinc-800">

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

                                {users.map((user) => (

                                    <tr
                                        key={user.id}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/60 transition-colors"
                                    >

                                        {/* Name */}
                                        <td className="px-6 py-4">

                                            <p className="font-medium text-zinc-100">
                                                {user.name}
                                            </p>

                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 break-all text-zinc-400">
                                            {user.email}
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4">

                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${user.role?.toUpperCase() === "ADMIN"
                                                    ? "bg-green-950/40 text-green-400 border-green-900/50"
                                                    : "bg-zinc-900 text-zinc-400 border-zinc-800"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>

                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">

                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${user.isBlocked
                                                    ? "bg-red-950/40 text-red-400 border-red-900/50"
                                                    : "bg-green-950/40 text-green-400 border-green-900/50"
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
                                                    handleView(user)
                                                }
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                                            >
                                                <Eye size={17} />
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* USER MODAL */}
            {isModalOpen && selectedUser && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">

                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Update User
                                </h2>

                                <p className="text-xs text-zinc-500 mt-1">
                                    Manage customer account settings
                                </p>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-900 hover:text-white transition"
                            >
                                <X size={18} />
                            </button>

                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-5">

                            {/* Name */}
                            <div>
                                <p className="text-xs uppercase text-zinc-500 mb-1">
                                    Name
                                </p>

                                <p className="font-medium text-zinc-100">
                                    {selectedUser.name}
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <p className="text-xs uppercase text-zinc-500 mb-1">
                                    Email
                                </p>

                                <p className="font-medium text-zinc-300 break-all">
                                    {selectedUser.email}
                                </p>
                            </div>

                            {/* Role */}
                            <div>

                                <label className="text-sm text-zinc-300">
                                    Role
                                </label>

                                <select
                                    value={selectedUser.role}
                                    onChange={(e) =>
                                        setSelectedUser((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    role: e.target.value,
                                                }
                                                : null
                                        )
                                    }
                                    className="w-full mt-2 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
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

                                <span className="text-sm text-zinc-300">
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
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedUser.isBlocked
                                        ? "bg-red-950/40 text-red-400 border-red-900/50 hover:bg-red-950/70"
                                        : "bg-green-950/40 text-green-400 border-green-900/50 hover:bg-green-950/70"
                                        }`}
                                >
                                    {selectedUser.isBlocked
                                        ? "Blocked"
                                        : "Active"}
                                </button>

                            </div>

                            {/* Created Date */}
                            <div>

                                <p className="text-xs uppercase text-zinc-500 mb-1">
                                    Created At
                                </p>

                                <p className="text-sm text-zinc-300">
                                    {selectedUser.createdAt
                                        ? new Date(
                                            selectedUser.createdAt
                                        ).toLocaleString()
                                        : "-"}
                                </p>

                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-800">

                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-sm text-zinc-400 rounded-md hover:bg-zinc-900 hover:text-white transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleOnSubmit}
                                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition"
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