import {
    Bell,
    LogOut,
    UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

function AdminNavbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken");

    let userName = "Admin";
    let userRole = "Administrator";

    if (token) {
        try {
            const decoded = jwtDecode(token);

            console.log("Decoded token:", decoded);

            // ASP.NET Core ClaimTypes.Name
            userName =
                decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
                ] || "Admin";

            // ASP.NET Core ClaimTypes.Role
            userRole =
                decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ] || "Administrator";

        } catch (error) {
            console.error("Failed to decode token:", error);
        }
    }

    const firstLetter = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        toast.success("Logged out successfully");

        navigate("/");
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-50 h-[64px] border-b border-zinc-800/80 bg-[#09090b]/95 backdrop-blur-xl">
            <div className="flex h-full items-center">

                {/* Logo Section */}
                <div className="flex h-full w-[300px] shrink-0 items-center border-r border-zinc-800/80 px-5">
                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
                            <img
                                src="/logo.jpg"
                                alt="TechNest Logo"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[15px] font-semibold tracking-wide text-zinc-100">
                                TechNest
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                Admin
                            </span>
                        </div>

                    </div>
                </div>

                {/* Page Title */}
                <div className="flex flex-1 items-center px-6">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
                            Admin Panel
                        </h1>

                        <p className="text-xs text-zinc-500">
                            Manage your TechNest platform
                        </p>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 px-5">

                    {/* Notifications */}
                    <button
                        type="button"
                        className="relative grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                        title="Notifications"
                    >
                        <Bell className="h-4 w-4" />

                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </button>

                    {/* Profile */}
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2 py-1.5 transition hover:border-zinc-700 hover:bg-zinc-800"
                    >
                        {/* First Letter */}
                        <div className="grid h-7 w-7 place-items-center rounded-md bg-zinc-700 text-xs font-semibold text-zinc-200">
                            {firstLetter}
                        </div>

                        {/* User Information */}
                        <div className="hidden text-left sm:block">
                            <p className="text-xs font-medium text-zinc-200">
                                {userName}
                            </p>

                            <p className="text-[10px] text-zinc-500">
                                {userRole}
                            </p>
                        </div>

                        <UserCircle className="hidden h-4 w-4 text-zinc-500 sm:block" />
                    </button>

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>

                </div>
            </div>
        </header>
    );
}

export default AdminNavbar;