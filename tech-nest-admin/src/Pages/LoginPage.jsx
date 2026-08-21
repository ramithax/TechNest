import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Client-side validation
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

            // Save JWT tokens
            localStorage.setItem(
                "accessToken",
                res.data.accessToken
            );

            localStorage.setItem(
                "refreshToken",
                res.data.refreshToken
            );

            // Redirect after successful login
            navigate("/admin");

        } catch (error) {
            console.error("Login failed:", error);
            console.log("Server response:", error.response?.data);

            if (error.response?.status === 401) {
                alert("Invalid email or password");
            } else if (error.response?.status === 400) {
                alert("Please check your email and password");
            } else {
                alert("Something went wrong. Please try again.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
            >
                <source
                    src="/Login_video.mp4"
                    type="video/mp4"
                />
            </video>

            {/* Left Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />

            {/* Login Section */}
            <div className="relative z-10 flex min-h-screen items-center">

                <div className="ml-[8%] w-full max-w-[430px]">

                    {/* Glass Container */}
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-md">

                        {/* Header */}
                        <div className="mb-8 text-center">

                            <h1 className="text-5xl font-bold tracking-tight text-white/80">
                                TechNest
                            </h1>

                            <h3 className="text-3xl font-semibold tracking-tight text-white/80">
                                Admin
                            </h3>

                            <p className="mt-3 text-sm text-white/80">
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
                                    className="text-sm font-medium text-white/80"
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
                                    className="h-12 rounded-lg border-white/15 bg-white/5 px-4 text-white placeholder:text-white/40 backdrop-blur-sm transition focus:border-white/40 focus:bg-white/10 focus-visible:ring-0"
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
                                    className="text-sm font-medium text-white/80"
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
                                    className="h-12 rounded-lg border-white/15 bg-white/5 px-4 text-white placeholder:text-white/40 backdrop-blur-sm transition focus:border-white/40 focus:bg-white/10 focus-visible:ring-0"
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
                                    className="text-sm text-white/60 transition hover:text-white"
                                >
                                    Forgot password?
                                </button>

                            </div>

                            {/* Sign In */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-12 w-full rounded-lg border border-white/15 bg-white/10 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition hover:border-white/25 hover:bg-white/15"
                            >
                                {loading
                                    ? "Signing In..."
                                    : "Sign In"}
                            </Button>

                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-center text-xs text-white/50">
                            © 2026 TechNest. All rights reserved.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}