"use client";

import { MainNav } from "@/app/ui/components";

export default function NavLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <MainNav />
            <main className="flex-grow pt-20">
                {children}
            </main>
        </div>
    );
}