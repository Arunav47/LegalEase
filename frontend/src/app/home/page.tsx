"use client";

import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useState, useEffect } from "react";
import Threads from "@/app/ui/Threads";
import ResponsiveSearchBar from "@/app/ui/ResponsiveSearchBar";

export default function HomePage() {
    const { isLoading, isAuthenticated } = useAuthGuard(true);
    const [scrollY, setScrollY] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const documentHistory = [
        { id: 1, name: "Contract_Analysis_Report.pdf", date: "2024-01-15", type: "Contract Analysis" },
        { id: 2, name: "Legal_Research_Summary.docx", date: "2024-01-14", type: "Legal Research" },
        { id: 3, name: "NDA_Review.pdf", date: "2024-01-13", type: "Document Review" },
        { id: 4, name: "Employment_Agreement.pdf", date: "2024-01-12", type: "Contract Analysis" },
        { id: 5, name: "Patent_Application.pdf", date: "2024-01-11", type: "IP Analysis" },
    ];

    const searchResults = [
        { id: 1, title: "Contract Clause Analysis", snippet: "Found 15 potential issues in the liability section..." },
        { id: 2, title: "Legal Precedent Match", snippet: "Similar case found: Smith vs. Johnson (2023)..." },
        { id: 3, title: "Compliance Check", snippet: "Document complies with GDPR requirements..." },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            if (window.scrollY > 100) {
                setShowHistory(!showResults);
            } else {
                setShowHistory(false);
                if (showResults && window.scrollY < 50) {
                    setShowResults(false);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [showResults]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setShowResults(true);
            setShowHistory(false);
        } else {
            setShowResults(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="fixed inset-0 top-40 z-0 will-change-transform">
                <Threads enableMouseInteraction={true} />
            </div>

            <div className="relative z-10 min-h-screen">
                <div className="flex items-center justify-center h-screen pt-0 mt-[-220px]">
                    <div className="text-center w-full max-w-6xl px-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                            LegalEase AI
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Your intelligent legal assistant. Search documents, analyze contracts, and get instant legal insights.
                        </p>
                        <ResponsiveSearchBar
                            onSearch={handleSearch}
                            placeholder="Ask LegalEase anything about your documents..."
                        />
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-20 transition-opacity duration-500 ease-in-out ${showHistory ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-black bg-opacity-30`}
                >
                    <div className="h-full overflow-y-auto pt-20 pb-8">
                        <div className="max-w-4xl mx-auto px-4">
                            <h2 className="text-3xl font-bold text-white mb-8 text-center">Document History</h2>
                            <div className="grid gap-4">
                                {documentHistory.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="bg-white bg-opacity-20 rounded-lg p-6 border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">{doc.name}</h3>
                                                <p className="text-gray-300 mb-1">{doc.type}</p>
                                                <p className="text-gray-400 text-sm">{new Date(doc.date).toLocaleDateString()}</p>
                                            </div>
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                                View Analysis
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-20 transition-opacity duration-500 ease-in-out ${showResults ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-black bg-opacity-30`}
                >
                    <div className="h-full overflow-y-auto pt-20 pb-8">
                        <div className="max-w-4xl mx-auto px-4">
                            <h2 className="text-3xl font-bold text-white mb-8 text-center">Search Results for "{searchQuery}"</h2>
                            <div className="grid gap-4">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="bg-white bg-opacity-20 rounded-lg p-6 border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-200 cursor-pointer"
                                    >
                                        <h3 className="text-xl font-semibold text-white mb-2">{result.title}</h3>
                                        <p className="text-gray-300">{result.snippet}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                    <div
                        className={`bg-white bg-opacity-20 rounded-full px-4 py-2 text-white text-sm transition-opacity duration-300 ${scrollY > 50 || showResults ? 'opacity-0' : 'opacity-100'}`}
                    >
                        Scroll up to view document history
                    </div>
                </div>

                {/* Spacer for scroll */}
                <div className="h-screen"></div>
            </div>
        </div>
    );
}