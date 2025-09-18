"use client";

import Link from "next/link";
import { SignUpForm } from "@/app/ui/components";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export default function SignUpPage() {
    const { isLoading } = useAuthGuard(false); // Don't require auth, but redirect if authenticated

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 pt-20">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-3 text-gray-800">Create Your Account</h1>
                    <span className="text-gray-600 text-lg max-w-md mx-auto block">
                        Join LegalEase and get your legal documents processed efficiently
                    </span>
                </div>

                <SignUpForm />
            </div>
        </>
    );
}
