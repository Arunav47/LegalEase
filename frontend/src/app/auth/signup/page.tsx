"use client";

import Link from "next/link";
import { SignUpForm } from "@/app/ui/components";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export default function SignUpPage() {
    const { isLoading } = useAuthGuard('auth-only'); // Auth-only page - redirect if authenticated

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
                    <h1 className="text-3xl font-bold mb-3 text-gray-800">Join LegalEase × Gemini Revolution</h1>
                    <span className="text-gray-600 text-lg max-w-md mx-auto block">
                        Start transforming complex legal documents with Google's Gemini AI, Vertex AI Document Processing, and intelligent conversational analysis
                    </span>
                </div>

                <SignUpForm />
            </div>
        </>
    );
}
