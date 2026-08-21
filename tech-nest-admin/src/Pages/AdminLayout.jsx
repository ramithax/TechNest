import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

function AdminLayout() {
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