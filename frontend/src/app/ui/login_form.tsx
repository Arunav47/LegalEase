import { Mail, Lock } from "lucide-react";

export default function LoginForm() {
    return (
        <div className="login-form border-2 p-6 rounded-2xl w-1/5 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
            <form action="">
                {/* Email Field */}
                <div className="relative mb-4">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="border-2 p-2 pl-10 rounded-full w-full"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email"
                        required
                    />
                </div>

                {/* Password Field */}
                <div className="relative mb-4">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="border-2 p-2 pl-10 rounded-full w-full"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        required
                    />
                </div>

                {/* Forgot Password */}
                <a
                    href="/auth/forgot-password"
                    className="text-blue-500 mb-4 inline-block text-sm"
                >
                    Forgot Password?
                </a>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        className="bg-blue-500 text-white p-2 rounded w-1/3"
                        type="submit"
                    >
                        Login
                    </button>
                </div>
            </form>

            {/* Register Link */}
            <div className="text-center mt-4">
                <span className="text-sm">Don't have an account?</span>
                <a href="/auth/signup" className="text-blue-500 ml-1">Register</a>
            </div>
        </div>
    );
}
