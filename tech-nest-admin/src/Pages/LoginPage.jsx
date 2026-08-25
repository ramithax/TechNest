import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password =
                "Password must be at least 6 characters";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            setLoading(true);

            const res = await api.post("/Auth/login", {
                email,
                password,
            });

            const accessToken = res.data.accessToken;

            const decoded = jwtDecode(accessToken);

            const role =
                decoded.role ||
                decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ];

            if (role?.toLowerCase() !== "admin") {
                toast.error(
                    "You are not authorized to access the admin panel."
                );
                return;
            }

            localStorage.setItem("accessToken", accessToken);

            localStorage.setItem(
                "refreshToken",
                res.data.refreshToken
            );

            toast.success("Login successful");

            navigate("/admin");

        } catch (error) {
            console.error("Login failed:", error);
            console.log(
                "Server response:",
                error.response?.data
            );

            if (error.response?.status === 401) {
                toast.error("Invalid email or password");
            } else if (error.response?.status === 400) {
                toast.error(
                    "Please check your email and password"
                );
            } else {
                toast.error(
                    "Something went wrong. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617]">

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
            >
                <source
                    src="/login2.mp4"
                    type="video/mp4"
                />
            </video>

            {/* Dark Blue / Purple Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#07102d]/80 via-[#10104a]/45 to-transparent" />

            {/* Subtle Purple Glow */}
            <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[140px]" />

            {/* Subtle Blue Glow */}
            <div className="absolute left-[35%] top-1/3 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[130px]" />

            {/* Login Section */}
            <div className="relative z-10 flex min-h-screen items-center">

                <div className="ml-[8%] w-full max-w-[430px]">

                    {/* Glass Container */}
                    <div
                        className="
                            rounded-2xl
                            border border-blue-400/20
                            bg-[#020617]/55
                            p-8
                            shadow-[0_0_40px_rgba(37,99,235,0.12)]
                            backdrop-blur-xl
                        "
                    >

                        {/* Header */}
                        <div className="mb-8 text-center">

                            <h1
                                className="
                                    bg-gradient-to-r
                                    from-white
                                    via-blue-200
                                    to-purple-300
                                    bg-clip-text
                                    text-5xl
                                    font-bold
                                    tracking-tight
                                    text-transparent
                                "
                            >
                                TechNest
                            </h1>

                            <h3 className="mt-1 text-3xl font-semibold tracking-tight text-blue-100/90">
                                Admin
                            </h3>

                            <p className="mt-3 text-sm text-blue-100/60">
                                Sign in to continue to your dashboard
                            </p>

                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleLogin}
                            className="space-y-6"
                        >

                            {/* Email */}
                            <div className="space-y-2">

                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-blue-100/80"
                                >
                                    Email
                                </label>

                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);

                                        setErrors((prev) => ({
                                            ...prev,
                                            email: "",
                                        }));
                                    }}
                                    disabled={loading}
                                    className="
                                        h-12
                                        rounded-lg
                                        border-blue-400/20
                                        bg-blue-950/30
                                        px-4
                                        text-blue-50
                                        placeholder:text-blue-200/35
                                        backdrop-blur-md
                                        transition
                                        hover:border-blue-400/30
                                        focus:border-cyan-400/50
                                        focus:bg-blue-900/30
                                        focus-visible:ring-1
                                        focus-visible:ring-cyan-400/30
                                    "
                                />

                                {errors.email && (
                                    <p className="text-sm text-red-400">
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* Password */}
                            <div className="space-y-2">

                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-blue-100/80"
                                >
                                    Password
                                </label>

                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);

                                        setErrors((prev) => ({
                                            ...prev,
                                            password: "",
                                        }));
                                    }}
                                    disabled={loading}
                                    className="
                                        h-12
                                        rounded-lg
                                        border-blue-400/20
                                        bg-blue-950/30
                                        px-4
                                        text-blue-50
                                        placeholder:text-blue-200/35
                                        backdrop-blur-md
                                        transition
                                        hover:border-blue-400/30
                                        focus:border-cyan-400/50
                                        focus:bg-blue-900/30
                                        focus-visible:ring-1
                                        focus-visible:ring-cyan-400/30
                                    "
                                />

                                {errors.password && (
                                    <p className="text-sm text-red-400">
                                        {errors.password}
                                    </p>
                                )}

                            </div>

                            {/* Forgot Password */}
                            <div className="-mt-2 flex">

                                <button
                                    type="button"
                                    className="
                                        text-sm
                                        text-blue-300/60
                                        transition
                                        hover:text-cyan-300
                                    "
                                >
                                    Forgot password?
                                </button>

                            </div>

                            {/* Sign In */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="
                                    h-12
                                    w-full
                                    rounded-lg
                                    border
                                    border-blue-400/30
                                    bg-gradient-to-r
                                    from-blue-600/80
                                    via-indigo-600/80
                                    to-purple-600/80
                                    text-base
                                    font-semibold
                                    text-white
                                    shadow-[0_0_25px_rgba(59,130,246,0.25)]
                                    backdrop-blur-sm
                                    transition-all
                                    duration-300
                                    hover:border-cyan-300/40
                                    hover:from-blue-500
                                    hover:via-indigo-500
                                    hover:to-purple-500
                                    hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]
                                "
                            >
                                {loading
                                    ? "Signing In..."
                                    : "Sign In"}
                            </Button>

                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-center text-xs text-blue-200/40">
                            © 2026 TechNest. All rights reserved.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}