import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
    { name: "Dashboard", path: "/admin", icon: "▦" },
    { name: "Products", path: "/admin/products", icon: "▤" },
    { name: "Orders", path: "/admin/orders", icon: "◫" },
    { name: "Customers", path: "/admin/customers", icon: "♙" },
    { name: "Repairs", path: "/admin/repairs", icon: "⚒" },
];

const workspaceItems = [
    { name: "PC Builder", path: "/admin/pc-builder", icon: "▣" },
    { name: "Quotations", path: "/admin/quotations", icon: "▤" },
    { name: "AI Agents", path: "/admin/ai-agents", icon: "✦" },
    { name: "Team", path: "/admin/team", icon: "♙" },
];

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="fixed bottom-0 left-0 top-[64px] z-40 w-[300px] border-r border-zinc-800 bg-[#09090b]">
            <div className="flex h-full flex-col overflow-y-auto px-3 py-6">

                {/* STORE */}
                <div>
                    <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Store
                    </p>

                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive(item.path)
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                    }`}
                            >
                                <span className="w-5 text-center text-lg">
                                    {item.icon}
                                </span>

                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* WORKSPACE */}
                <div className="mt-8">
                    <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Workspace
                    </p>

                    <div className="space-y-1">
                        {workspaceItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive(item.path)
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                    }`}
                            >
                                <span className="w-5 text-center text-lg">
                                    {item.icon}
                                </span>

                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI */}
                <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✦</span>

                        <span className="text-sm font-medium">
                            AI Agents
                        </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Monitor your TechNest AI agents and review their
                        recommendations.
                    </p>

                    <button
                        onClick={() => navigate("/admin/ai-agents")}
                        className="mt-3 text-xs font-medium text-white hover:underline"
                    >
                        View agents →
                    </button>
                </div>

                {/* BOTTOM */}
                <div className="mt-auto border-t border-zinc-800 pt-5">
                    <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white">
                        ?
                        <span>Help Center</span>
                    </button>

                    <button className="mt-2 flex w-full items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white">
                        ◫
                        <span>Documentation</span>
                    </button>

                    <p className="mt-8 px-3 text-xs text-zinc-600">
                        © 2026 TechNest
                    </p>
                </div>

            </div>
        </aside>
    );
}

export default AdminSidebar;