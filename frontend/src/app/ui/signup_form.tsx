"use client"

import Link from "next/link";
import { Mail, Lock, User, CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react"


export default function SignUpForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <motion.div 
            className="w-full max-w-md p-8 rounded-xl bg-white shadow-xl border border-gray-100"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", visualDuration: 0.4, bounce: 0.5 }}
        >
            <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                    <User className="text-blue-600" size={24} />
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700 block">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 rounded-lg text-gray-900 transition duration-150"
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                </div>
                
                {/* Email Field */}
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 block">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 rounded-lg text-gray-900 transition duration-150"
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 block">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            className="border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 rounded-lg text-gray-900 transition duration-150"
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="text-right">
                        <a
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Forgot Password?
                        </a>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={18} />
                    <span className="text-xs text-gray-600">Your information is secure and encrypted</span>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-150 font-medium flex items-center justify-center"
                        type="submit"
                    >
                        Create Account
                    </button>
                </div>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 border-t border-gray-100 pt-4">
                <span className="text-gray-600">Already have an account?</span>
                <Link href="/auth/login" className="text-blue-600 font-medium ml-1 hover:text-blue-800 transition-colors">
                    Login
                </Link>
            </div>
        </motion.div>
    );
}
