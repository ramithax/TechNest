import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export function LoginPage() {
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
                <source src="/Login_video.mp4" type="video/mp4" />
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
                        <form className="space-y-6">

                            {/* Username */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium text-white/80"
                                >
                                    Username
                                </label>

                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    className="h-12 rounded-lg border-white/15 bg-white/5 px-4 text-white placeholder:text-white backdrop-blur-sm transition focus:border-white/40 focus:bg-white/10 focus-visible:ring-0"
                                />
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
                                    className="h-12 rounded-lg border-white/15 bg-white/5 px-4 text-white placeholder:text-white backdrop-blur-sm transition focus:border-white/40 focus:bg-white/10 focus-visible:ring-0"
                                />
                            </div>

                            {/* Forgot Password */}
                            <div className="-mt-2 flex">
                                <button
                                    type="button"
                                    className="text-sm text-white/80 transition hover:text-white"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Sign In */}
                            <Link to="/admin" className="block">
                                <Button
                                    type="button"
                                    className="h-12 w-full rounded-lg border border-white/15 bg-white/10 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition hover:border-white/25 hover:bg-white/15"
                                >
                                    Sign In
                                </Button>
                            </Link>

                        </form>

                        {/* Small Footer */}
                        <p className="mt-6 text-center text-xs text-white/80">
                            © 2026 TechNest. All rights reserved.
                        </p>

                    </div>

                </div>
            </div>
        </div>
    );
}