import { Outlet, Navigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";
import { jwtDecode } from "jwt-decode";

function AdminLayout() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const role =
            decoded.role ||
            decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        if (role !== "Admin" && role !== "admin") {
            return <Navigate to="/" replace />;
        }
    } catch (error) {
        console.error("Failed to decode token for role verification:", error);
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">

            {/* Permanent */}
            <AdminNavbar />
            <AdminSidebar />

            {/* Changing content */}
            <main className="ml-[300px] pt-[64px]">
                <Outlet />
            </main>

        </div>
    );
}

export default AdminLayout;