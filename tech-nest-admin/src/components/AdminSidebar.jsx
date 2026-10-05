import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const navItems = [
    { name: "Dashboard", path: "/admin", icon: "▦" },
    { name: "Products", path: "/admin/products", icon: "▤" },
    { name: "Orders", path: "/admin/orders", icon: "◫" },
    { name: "Customers", path: "/admin/customers", icon: "♙" },
    { name: "Repairs", path: "/admin/repairs", icon: "⚒" },
    { name: "PC Builder", path: "/admin/pcbuilder", icon: "▣" },
    { name: "AI Agents", path: "/admin/pc-builder-requests", icon: "✦" },
];

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Consume global ThemeContext state
    const { theme, setTheme } = useTheme();

    const isActive = (path) => location.pathname === path;

    return (
        // Parent <aside> styling with Tailwind dark: modifiers and smooth transitions
        <aside className="fixed bottom-0 left-0 top-[64px] z-40 w-[300px] border-r border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800/80 dark:bg-[#09090b] dark:text-white transition-colors duration-300">
            <div
                className="
                    flex h-full flex-col overflow-y-auto px-3 py-6

                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-zinc-300
                    dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800
                    [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400
                    dark:[&::-webkit-scrollbar-thumb:hover]:bg-zinc-700
                "
            >

                {/* STORE */}
                <div>
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 transition-colors duration-300">
                        Store
                    </p>

                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => navigate(item.path)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${active
                                        ? "bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm dark:bg-zinc-800/80 dark:text-white dark:border-white/10 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-white"
                                        }`}
                                >
                                    <span className="w-5 text-center text-lg">
                                        {item.icon}
                                    </span>

                                    {item.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* BOTTOM */}
                <div className="mt-auto border-t border-zinc-200 dark:border-zinc-800/80 pt-5 transition-colors duration-300">
                    <p className="px-2 text-xs text-zinc-400 dark:text-zinc-600 transition-colors duration-300">
                        © 2026 TechNest
                    </p>
                </div>

            </div>
        </aside>
    );
}

export default AdminSidebar;