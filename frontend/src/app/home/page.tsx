"use client";

import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export default function HomePage() {
    const { isLoading, isAuthenticated } = useAuthGuard(true); // Require auth

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Auth guard will handle redirect
    }

    return (
        <div>
            <h1>Hello, LegalEase!</h1>
        </div>
    );
}