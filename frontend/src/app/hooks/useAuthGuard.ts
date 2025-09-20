"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useAuthGuard(mode: 'protected' | 'auth-only' | 'public' = 'protected') {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setIsLoading(false);

            if (mode === 'protected' && !user) {
                // Protected route - redirect to login if not authenticated
                router.replace("/auth/login");
            } else if (mode === 'auth-only' && user) {
                // Auth-only pages (login/signup) - redirect to home if already authenticated
                router.replace("/home");
            }
            // For 'public' mode, no redirects - allow access to everyone
        });

        return () => unsubscribe();
    }, [mode, router]);

    return { isLoading, isAuthenticated };
}