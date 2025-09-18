"use client";

import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "./resizable-navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function MainNav() {
    const navItems = [
        { name: "Features", link: "/" },
        { name: "Pricing", link: "/pricing" },
        { name: "Developers", link: "/developers" },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="relative w-full">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <NavbarButton
                                onClick={() => {
                                    auth.signOut();
                                    router.replace("/");
                                }}
                                variant="primary"
                                className="text-lg px-6 py-3"
                            >
                                Logout
                            </NavbarButton>
                        ) : (
                            <>
                                <NavbarButton
                                    onClick={() => router.push("/auth/login")}
                                    variant="primary"
                                    className="text-lg px-6 py-3"
                                >
                                    Login
                                </NavbarButton>
                                <NavbarButton
                                    onClick={() => router.push("/auth/signup")}
                                    variant="primary"
                                    className="text-lg px-6 py-3"
                                >
                                    Sign Up
                                </NavbarButton>
                            </>
                        )}
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item, idx) => (
                            <a
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="block">{item.name}</span>
                            </a>
                        ))}
                        <div className="flex w-full flex-col gap-4">
                            {isLoggedIn ? (
                                <NavbarButton
                                    onClick={() => {
                                        auth.signOut();
                                        router.replace("/");
                                        setIsMobileMenuOpen(false);
                                    }}
                                    variant="primary"
                                    className="w-full"
                                >
                                    Logout
                                </NavbarButton>
                            ) : (
                                <>
                                    <NavbarButton
                                        onClick={() => {
                                            router.push("/auth/login");
                                            setIsMobileMenuOpen(false);
                                        }}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        Login
                                    </NavbarButton>
                                    <NavbarButton
                                        onClick={() => {
                                            router.push("/auth/signup");
                                            setIsMobileMenuOpen(false);
                                        }}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        Sign Up
                                    </NavbarButton>
                                </>
                            )}
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
}
