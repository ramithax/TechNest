import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import Iridescence from "../components/Iridescence";
import api from "../lib/axios";

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter your email and password.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/Auth/login", {
                email,
                password,
            });

            const data = response.data;

            const accessToken = data.accessToken;
            const refreshToken = data.refreshToken;

            const decoded = jwtDecode(accessToken);

            const role =
                decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ];

            if (role !== "Admin") {
                toast.error(
                    "You are not authorized to access the admin panel."
                );
                return;
            }

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            toast.success("Login successful!");

            navigate("/admin");
        } catch (error) {
            console.error("Login failed:", error);

            toast.error(
                error.response?.data?.message ||
                error.response?.data ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-4 text-zinc-900">
            {/* Iridescence background */}
            <div className="absolute inset-0">
                <Iridescence
                    color={[0.25, 0.55, 0.95]}
                    speed={0.35}
                    amplitude={0.32}
                    mouseReact={true}
                />
            </div>

            {/* Soft blue-tinted overlay */}
            <div className="absolute inset-0 bg-blue-50/40 backdrop-blur-[2px]" />

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-2xl border border-zinc-200/80 bg-white/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur-md">
                    {/* Header */}
                    <div className="mb-8">
                        <p className="mb-2 flex items-center justify-center text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                            Admin Portal
                        </p>

                        <h1 className="flex items-center justify-center text-3xl font-semibold tracking-tight text-zinc-900">
                            TechNest
                        </h1>

                        <p className="mt-2 flex items-center justify-center text-sm text-zinc-500">
                            Sign in to access the admin dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                autoComplete="email"
                                className="h-12 w-full rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-800 focus:ring-2 focus:ring-zinc-800/10"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-zinc-700"
                                >
                                    Password
                                </label>

                                <a
                                    href="/forgot-password"
                                    className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="h-12 w-full rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-800 focus:ring-2 focus:ring-zinc-800/10"
                            />
                        </div>

                        {/* Sign in */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 w-full rounded-lg bg-zinc-900 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-7 border-t border-zinc-100 pt-5">
                        <p className="text-center text-xs text-zinc-400">
                            Protected by TechNest Security · ©{" "}
                            {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}