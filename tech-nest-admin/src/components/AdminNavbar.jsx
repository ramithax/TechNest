function AdminNavbar() {
    return (
        <header className="fixed left-0 right-0 top-0 z-50 h-[64px] border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur">
            <div className="flex h-full items-center justify-between px-5">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center">
                        <img
                            src="/logo.jpg"
                            alt="TechNest Logo"
                            className="h-12 w-12 object-contain"
                        />
                    </div>

                    <span className="text-[15px] text-zinc-200 font-semibold tracking-wide">
                        TechNest
                    </span>
                </div>

                {/* Header center */}
                <div className="absolute left-[330px] flex items-center gap-3">
                    <button className="text-zinc-400 hover:text-white">
                        ◧
                    </button>

                    <span className="text-sm text-zinc-200">
                        Admin Panel
                    </span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <button className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800">
                        ➤
                    </button>

                    <button className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800">
                        ♧
                    </button>

                    <div className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-zinc-700 text-sm font-semibold">
                        RN
                    </div>
                </div>

            </div>
        </header>
    );
}

export default AdminNavbar;