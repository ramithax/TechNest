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
            newErrors.password = "Password must be at least 6 characters";
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
        <div className="relative min-h-screen w-full overflow-hidden bg-[#18181b]">

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

            {/* Login Section */}
            <div className="relative z-10 flex min-h-screen items-center">

                <div className="ml-[8%] w-full max-w-[430px]">

                    {/* Login Card */}
                    <div
                        className="
                            rounded-2xl
                            border
                            border-white/15
                            bg-[#18181b]/85
                            p-8
                            shadow-2xl
                            backdrop-blur-xl
                        "
                    >

                        {/* Header */}
                        <div className="mb-8 text-center">

                            <h1
                                className="
                                    text-5xl
                                    font-bold
                                    tracking-tight
                                    text-white
                                "
                            >
                                TechNest
                            </h1>


                            <p className="mt-3 text-sm text-white/50">
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
                                    className="
                                        text-sm
                                        font-medium
                                        text-white/75
                                    "
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
                                        border-white/15
                                        bg-white/[0.07]
                                        px-4
                                        text-white
                                        placeholder:text-white/30
                                        transition
                                        hover:border-white/25
                                        hover:bg-white/[0.09]
                                        focus:border-white/40
                                        focus:bg-white/[0.10]
                                        focus-visible:ring-1
                                        focus-visible:ring-white/20
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
                                    className="
                                        text-sm
                                        font-medium
                                        text-white/75
                                    "
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
                                        border-white/15
                                        bg-white/[0.07]
                                        px-4
                                        text-white
                                        placeholder:text-white/30
                                        transition
                                        hover:border-white/25
                                        hover:bg-white/[0.09]
                                        focus:border-white/40
                                        focus:bg-white/[0.10]
                                        focus-visible:ring-1
                                        focus-visible:ring-white/20
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
                                        text-white/45
                                        transition
                                        hover:text-white/80
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
                                    border-white/20
                                    bg-white
                                    text-base
                                    font-semibold
                                    text-black
                                    shadow-lg
                                    transition-all
                                    duration-300
                                    hover:bg-white/90
                                    hover:shadow-xl
                                "
                            >
                                {loading
                                    ? "Signing In..."
                                    : "Sign In"}
                            </Button>

                        </form>

                        {/* Footer */}
                        <p
                            className="
                                mt-6
                                text-center
                                text-xs
                                text-white/30
                            "
                        >
                            © 2026 TechNest. All rights reserved.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}
