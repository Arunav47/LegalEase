"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useAuthGuard(requireAuth: boolean = true) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setIsLoading(false);

            if (requireAuth && !user) {
                // User should be authenticated but isn't - redirect to login
                router.replace("/auth/login");
            } else if (!requireAuth && user) {
                // User shouldn't be on auth pages when logged in - redirect to home
                router.replace("/home");
            }
        });

        return () => unsubscribe();
    }, [requireAuth, router]);

    return { isLoading, isAuthenticated };
}