"use client";

import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Threads from "@/app/ui/Threads";
import ResponsiveSearchBar from "@/app/ui/ResponsiveSearchBar";

export default function HomePage() {
    const { isLoading, isAuthenticated } = useAuthGuard('protected');
    const router = useRouter();
    const [scrollY, setScrollY] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const documentHistory = [
        { id: 2, name: "Non_Disclosure_Agreement_Startup.pdf", date: "2025-09-15", type: "" },
        { id: 3, name: "Lease_Agreement_Commercial.pdf", date: "2025-09-10", type: "" },
        { id: 5, name: "Intellectual_Property_License.pdf", date: "2025-09-05", type: "" },
    ];

    const searchResults = [
        { id: 1, title: "Contract Termination Clauses", snippet: "Gemini AI identified 3 termination clauses with different notice periods using Google Vertex AI Document Processing. Clause 5.2 requires 30 days notice, while clause 8.1 allows immediate termination for breach..." },
        { id: 2, title: "Liability Limitations Found", snippet: "Gemini's legal analysis detected liability caps limiting damages to $50,000 via Google Cloud AutoML. This may be insufficient for your business size. Similar contracts typically include..." },
        { id: 3, title: "Intellectual Property Rights", snippet: "Google's advanced language model analyzed work-for-hire clauses - all IP ownership transfers to the company. Employee retains rights only to pre-existing inventions listed in Exhibit A..." },
    ];

    useEffect(() => {
        // Throttle scroll events to improve performance
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollPos = window.scrollY;
                    setScrollY(scrollPos);

                    if (scrollPos > 0 && !showResults) {
                        setShowHistory(true);
                    } else {
                        setShowHistory(false);
                    }

                    if (showResults && scrollPos === 0) {
                        setShowResults(false);
                    }

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [showResults, showHistory]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setShowResults(true);
            setShowHistory(false);
            window.scrollTo({ top: 10, behavior: 'smooth' }); // Small scroll to trigger showing results
        } else {
            setShowResults(false);
        }
    };

    const toggleHistory = () => {
        setShowHistory(!showHistory);
        setShowResults(false);
    };

    const validateFile = (file: File): boolean => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain'];
        const maxSize = 100 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            setUploadError('Please upload only PDF, JPEG, PNG, or TXT files');
            return false;
        }

        if (file.size > maxSize) {
            setUploadError('File size must be less than 100MB');
            return false;
        }

        setUploadError('');
        return true;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            if (validateFile(file)) {
                setUploadFile(file);
                console.log('File validation passed, uploadFile set');
            } else {
                console.log('File validation failed');
            }
        } else {
            console.log('No file selected');
        }
    };

    const submitUpload = async () => {
        if (!uploadFile) return;

        setIsUploading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setShowUpload(false);
            setUploadFile(null);
            setUploadError('');

            // Redirect to document page to show the mockup
            router.push('/document/new-upload');
        } catch (error) {
            setUploadError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleUpload = () => {
        setShowUpload(!showUpload);
        if (!showUpload) {
            // Only clear when opening the modal
            setUploadFile(null);
            setUploadError('');
        }
    };

    const handleDocumentClick = (docId: number) => {
        router.push(`/document/${docId}`);
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
                <div className="w-full h-full transform-gpu">
                    <Threads enableMouseInteraction={true} />
                </div>
            </div>

            <div className="relative z-10 min-h-screen">
                <div className="flex items-center justify-center h-screen pt-0 mt-[-220px]">
                    <div className="text-center w-full max-w-6xl px-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                            LegalEase × Gemini
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Powered by Google's Gemini AI and Vertex AI ecosystem. Transform complex legal documents with instant summaries, Google Text-to-Speech explanations, visual mind maps, and intelligent Q&A using the world's most advanced language model.
                        </p>
                        <ResponsiveSearchBar
                            onSearch={handleSearch}
                            placeholder="search documents"
                        />
                        <div className="mt-6">
                            <button
                                onClick={toggleUpload}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Upload Legal Document
                            </button>
                            <p className="text-sm text-gray-500 mt-2">
                                Gemini will instantly analyze, summarize & create interactive insights using Vertex AI
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-20 transition-all duration-300 ease-in-out ${showHistory ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'} bg-gray-900 bg-opacity-95`}
                >
                    <div className="h-full overflow-y-auto pt-20 pb-8">
                        <div className="max-w-4xl mx-auto px-4">
                            <h2 className="text-3xl font-bold text-white mb-4 text-center">Your Gemini-Analyzed Documents</h2>
                            <p className="text-center text-gray-300 mb-8">
                                Each document processed with Google's Gemini AI for summaries, risk analysis, and intelligent insights powered by Vertex AI
                            </p>
                            <div className="grid gap-4">
                                {documentHistory.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => handleDocumentClick(doc.id)}
                                        className="bg-white bg-opacity-95 rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-[1.02]"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-semibold text-black mb-2">{doc.name}</h3>
                                                <p className="text-gray-600 mb-1 font-medium">{doc.type}</p>
                                                <p className="text-gray-500 text-sm">{new Date(doc.date).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDocumentClick(doc.id);
                                                }}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                View Analytics
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-20 transition-all duration-300 ease-in-out ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'} bg-gray-900 bg-opacity-95`}
                >
                    <div className="h-full overflow-y-auto pt-20 pb-8">
                        <div className="max-w-4xl mx-auto px-4">
                            <h2 className="text-3xl font-bold text-white mb-4 text-center">Smart Search Results</h2>
                            <p className="text-center text-gray-300 mb-8">
                                AI-powered insights and analysis for: "{searchQuery}"
                            </p>
                            <div className="grid gap-4">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        onClick={() => handleDocumentClick(result.id)}
                                        className="bg-white bg-opacity-95 rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-[1.02]"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-black mb-3">{result.title}</h3>
                                                <p className="text-gray-600 leading-relaxed">{result.snippet}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDocumentClick(result.id);
                                                }}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ml-4"
                                            >
                                                View Analytics
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-20 transition-all duration-300 ease-in-out ${showUpload ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'} bg-gray-900 bg-opacity-95`}
                >
                    <div className="h-full overflow-y-auto pt-20 pb-8 flex items-center justify-center">
                        <div className="max-w-lg mx-auto px-4 w-full">
                            <div className="bg-white bg-opacity-95 rounded-xl p-8 border border-gray-200 shadow-xl backdrop-blur-sm">
                                <h2 className="text-2xl font-bold text-black mb-6 text-center">Upload for Gemini Analysis</h2>

                                <div className="mb-6">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.txt"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <div className="mb-4">
                                                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-600 font-medium mb-2">
                                                {uploadFile ? uploadFile.name : 'Click to upload or drag and drop'}
                                            </p>
                                            <p className="text-sm text-gray-500">PDF, JPEG, PNG, or TXT (max 100MB)</p>
                                        </label>
                                    </div>
                                </div>

                                {uploadError && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                                        <p className="text-red-700 text-sm">{uploadError}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={toggleUpload}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitUpload}
                                        disabled={!uploadFile || isUploading}
                                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${!uploadFile || isUploading
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg'
                                            }`}
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Analyzing with Gemini...
                                            </div>
                                        ) : !uploadFile ? 'Select a file first' : 'Upload & Analyze Document'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-20"></div>
            </div>
        </div>
    );
}