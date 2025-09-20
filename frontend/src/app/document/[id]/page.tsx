"use client";

import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DocumentPage() {
    const { isLoading, isAuthenticated } = useAuthGuard('protected');
    const params = useParams();
    const router = useRouter();
    const [documentData, setDocumentData] = useState<any>(null);
    const [loadingDocument, setLoadingDocument] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSection, setActiveSection] = useState("overview");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<Array<{ id: number, text: string, sender: 'user' | 'bot', timestamp: Date }>>([
        {
            id: 1,
            text: "Hello! I'm your Gemini-powered document assistant. I've analyzed this Agreement for Sale document. Ask me about the seller, buyer, price, timeline, or any specific terms in the agreement.",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const mockDocumentData = {
        id: params.id,
        name: "Agreement_for_Sale_Guwahati_2025.pdf",
        type: "Gemini Deep Analysis",
        uploadDate: "2025-09-20",
        status: "AI Analyzed",
        summary: "This document is an Agreement for Sale for a residential house. It outlines the terms and conditions for the sale of a property located in Guwahati, Assam. The agreement was made on September 20, 2025, between the seller, Mr. Ramesh Chandra Sharma (the Vendor), and the buyer, Mrs. Anjali Das (the Purchaser). The total sale price is ₹85,00,000, with an initial earnest money payment of ₹10,00,000 already made by the purchaser.",
        keyClauses: [
            {
                title: "Sale and Price",
                content: "The vendor agrees to sell the house for ₹85,00,000, free from all encumbrances.",
                type: "financial",
                importance: "high"
            },
            {
                title: "Earnest Money",
                content: "The purchaser has paid ₹10,00,000 as earnest money on the date of the agreement. The remaining balance is to be paid when the final conveyance deed is executed.",
                type: "financial",
                importance: "high"
            },
            {
                title: "Timeframe",
                content: "The sale must be completed within three months from the agreement date, with time being of the essence.",
                type: "timeline",
                importance: "critical"
            },
            {
                title: "Title Verification",
                content: "The vendor must provide the property's title deeds to the purchaser's advocate within one week. The advocate then has 15 days to report on the title's clarity.",
                type: "legal",
                importance: "high"
            },
            {
                title: "Purchaser's Default",
                content: "If the purchaser breaks the agreement, the vendor is entitled to forfeit the earnest money and is free to sell the property to someone else.",
                type: "default",
                importance: "medium"
            },
            {
                title: "Vendor's Default",
                content: "If the vendor breaks the agreement, he must refund the earnest money and also pay ₹5,00,000 as liquidated damages to the purchaser.",
                type: "default",
                importance: "high"
            },
            {
                title: "Expenses",
                content: "The purchaser is responsible for bearing all costs related to the preparation of the conveyance deed, stamp duty, and registration charges.",
                type: "financial",
                importance: "medium"
            }
        ],
        importantDates: [
            { date: "2025-09-20", event: "Agreement Date", type: "start" },
            { date: "2025-09-27", event: "Title Deed Submission (within one week of agreement)", type: "milestone" },
            { date: "2025-10-12", event: "Advocate's Report Deadline (within 15 days after deeds submission)", type: "review" },
            { date: "2025-12-20", event: "Sale Completion Deadline (three months from agreement date)", type: "deadline" },
            { date: "2025-09-27", event: "Earnest Money Refund (within 7 days of negative advocate's report)", type: "refund" }
        ],
        locations: [
            { place: "Place of Agreement", address: "Guwahati, Assam", type: "legal" },
            { place: "Vendor's Address", address: "House No. 45, Rajgarh Road, Guwahati, Assam, 781007", type: "vendor" },
            { place: "Purchaser's Address", address: "Flat 3B, Sunshine Residency, Zoo Road, Guwahati, Assam, 781024", type: "purchaser" },
            { place: "Property for Sale", address: "House No. 12, Lachit Nagar, G.S. Road, Guwahati, Assam, 781005", type: "property" }
        ],
        detailedBreakdown: [
            {
                section: "Agreement Overview",
                content: "This is a standard sale agreement that clearly defines the roles, responsibilities, and liabilities of both parties.",
                subsections: ["Document Type", "Parties Involved", "Property Details", "Agreement Terms"]
            },
            {
                section: "Vendor's Obligations & Rights",
                content: "Must provide a property free from any legal claims or liabilities (encumbrances). Must submit title deeds for verification in a timely manner. Must hand over vacant possession of the house upon final payment and registration. Must obtain necessary clearance certificates, such as from the Income Tax Act. Has the right to keep the ₹10,00,000 earnest money if the purchaser backs out of the deal.",
                subsections: ["Property Clearance", "Title Deed Submission", "Vacant Possession", "Income Tax Clearance", "Earnest Money Rights"]
            },
            {
                section: "Purchaser's Obligations & Rights",
                content: "Must pay the remaining balance of the sale price at the time of the final deed. Must complete the purchase within the three-month window. Must cover all ancillary costs like stamp duty and registration. Has the right to a clear title. If the title is found to be defective, she is entitled to a full refund of her earnest money within 7 days. Has the right to receive not only the earnest money back but also an additional ₹5,00,000 in damages if the vendor fails to honor the agreement.",
                subsections: ["Payment Obligations", "Timeline Compliance", "Cost Responsibilities", "Title Rights", "Refund Rights", "Damage Claims"]
            },
            {
                section: "Penalty Clause & Protection",
                content: "A key feature is the penalty for a late refund by the vendor. If the vendor fails to return the earnest money within 7 days (after a bad title report), he will be charged interest at 1.5% per month until it is paid. This protects the purchaser's funds from being held up.",
                subsections: ["Late Payment Penalty", "Interest Rate", "Purchaser Protection", "Timeline Enforcement"]
            }
        ]
    };

    useEffect(() => {
        const fetchDocument = async () => {
            setLoadingDocument(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setDocumentData(mockDocumentData);
            } catch (error) {
                console.error("Failed to load document:", error);
            } finally {
                setLoadingDocument(false);
            }
        };

        if (params.id) {
            fetchDocument();
        }
    }, [params.id]);

    const handleAudioPlay = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            const utterance = new SpeechSynthesisUtterance(documentData.summary);
            utterance.onend = () => setIsPlaying(false);
            speechSynthesis.speak(utterance);
        } else {
            speechSynthesis.cancel();
        }
    };

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'financial':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                );
            case 'legal':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                );
            case 'confidentiality':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage = {
            id: chatMessages.length + 1,
            text: newMessage,
            sender: 'user' as const,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        const currentMessage = newMessage;
        setNewMessage("");
        setIsTyping(true);

        // Predefined Q&A for mockup
        const mockResponses: { [key: string]: string } = {
            'who is selling the house': "Mr. Ramesh Chandra Sharma is the vendor selling the house.",
            'who is the seller': "Mr. Ramesh Chandra Sharma is the vendor selling the house.",
            'what is the total price': "The total price is ₹85,00,000.",
            'what is the price': "The total price is ₹85,00,000.",
            'how much is the house': "The total price is ₹85,00,000.",
            'how much do i need to pay now': "The agreement states that an earnest money of ₹10,00,000 has already been paid. The balance is due later.",
            'how much to pay now': "The agreement states that an earnest money of ₹10,00,000 has already been paid. The balance is due later.",
            'what happens if i change my mind': "If you breach the agreement, you will lose the ₹10,00,000 earnest money you paid.",
            'what if i back out': "If you breach the agreement, you will lose the ₹10,00,000 earnest money you paid.",
            'what if buyer changes mind': "If you breach the agreement, you will lose the ₹10,00,000 earnest money you paid.",
            'who pays for registration': "The purchaser, Mrs. Anjali Das, is responsible for those expenses.",
            'who pays stamp duty': "The purchaser, Mrs. Anjali Das, is responsible for those expenses.",
            'who pays for registration and stamp duty': "The purchaser, Mrs. Anjali Das, is responsible for those expenses.",
            'how long to finalize': "The sale must be completed within three months from September 20, 2025.",
            'what is the timeline': "The sale must be completed within three months from September 20, 2025.",
            'when is the deadline': "The sale must be completed within three months from September 20, 2025."
        };

        setTimeout(() => {
            // Find matching response
            let response = "I can help you understand this Agreement for Sale document. Feel free to ask about the parties involved, pricing, timeline, or any specific clauses.";

            const lowerMessage = currentMessage.toLowerCase().trim();
            for (const [key, value] of Object.entries(mockResponses)) {
                if (lowerMessage.includes(key)) {
                    response = value;
                    break;
                }
            }

            const botResponse = {
                id: chatMessages.length + 2,
                text: response,
                sender: 'bot' as const,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (isLoading || loadingDocument) {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-[480px]' : ''}`}>
                <div className="bg-white shadow-sm border-b backdrop-blur-sm bg-opacity-95">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{documentData?.name}</h1>
                                    <p className="text-sm text-gray-500">{documentData?.type} • Uploaded {documentData?.uploadDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {documentData?.status}
                                </span>
                                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-6">
                        <nav className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border">
                            {[
                                { id: 'overview', label: 'Gemini Overview', icon: '' },
                                { id: 'clauses', label: 'Key Clauses', icon: '' },
                                { id: 'dates', label: 'Important Dates', icon: '' },
                                { id: 'locations', label: 'Places & Jurisdiction', icon: '' },
                                { id: 'breakdown', label: 'Detailed Breakdown', icon: '' }
                            ].map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === section.id
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {section.icon && <span className="mr-2">{section.icon}</span>}
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {activeSection === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Gemini Document Intelligence</h2>
                                    <button
                                        onClick={handleAudioPlay}
                                        className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${isPlaying
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                            }`}
                                    >
                                        {isPlaying ? (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                                                </svg>
                                                Stop Google TTS
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                </svg>
                                                Listen with Google Text-to-Speech
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed text-lg">{documentData?.summary}</p>
                                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <p className="text-sm text-blue-800">
                                            <strong>Gemini Analysis Complete:</strong> This document has been processed using Google's most advanced language model and Vertex AI Document Processing to extract key insights, identify risks, and highlight important provisions in plain English.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'clauses' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Clauses Analysis</h2>
                                <div className="grid gap-6">
                                    {documentData?.keyClauses?.map((clause: any, index: number) => (
                                        <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0 text-blue-600">
                                                        {getTypeIcon(clause.type)}
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{clause.title}</h3>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getImportanceColor(clause.importance)}`}>
                                                    {clause.importance.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{clause.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'dates' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Dates Timeline</h2>
                                <div className="space-y-6">
                                    {documentData?.importantDates?.map((dateItem: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-6 p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
                                            <div className="flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${dateItem.type === 'start' ? 'bg-green-500' :
                                                    dateItem.type === 'milestone' ? 'bg-blue-500' :
                                                        dateItem.type === 'review' ? 'bg-purple-500' :
                                                            'bg-orange-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-semibold text-gray-900">{dateItem.event}</h3>
                                                <p className="text-gray-600">{new Date(dateItem.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${new Date(dateItem.date) > new Date() ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {new Date(dateItem.date) > new Date() ? 'Upcoming' : 'Completed'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'locations' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Locations</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {documentData?.locations?.map((location: any, index: number) => (
                                        <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-start space-x-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${location.type === 'workplace' ? 'bg-blue-500' :
                                                    location.type === 'remote' ? 'bg-green-500' :
                                                        'bg-purple-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="text-lg font-semibold text-gray-900">{location.place}</h3>
                                                    <p className="text-gray-600 mt-1">{location.address}</p>
                                                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                        {location.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'breakdown' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Breakdown</h2>
                                <div className="space-y-8">
                                    {documentData?.detailedBreakdown?.map((section: any, index: number) => (
                                        <div key={index} className="border border-gray-200 rounded-xl p-6">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.section}</h3>
                                            <p className="text-gray-700 leading-relaxed mb-4">{section.content}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {section.subsections.map((subsection: any, subIndex: number) => (
                                                    <span
                                                        key={subIndex}
                                                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm font-medium"
                                                    >
                                                        {subsection}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 group"
                >
                    <div className="flex items-center">
                        <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="ml-3 font-medium whitespace-nowrap">Ask about document</span>
                    </div>
                </button>

                <div className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'
                    } border-l border-gray-200`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Document Assistant</h3>
                                    <p className="text-sm text-gray-600">Ask questions about this document</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map((message) => (
                                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${message.sender === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{message.text}</p>
                                        <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="flex items-end space-x-3">
                                <div className="flex-1">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask about this document..."
                                        className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={1}
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}