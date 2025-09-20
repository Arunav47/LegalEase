"use client";

import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { legalAiService, ApiError } from "@/app/lib/services/legalAiService";
import { DocumentData } from "@/app/lib/types/api";

export default function DocumentPage() {
    const { isLoading, isAuthenticated } = useAuthGuard('protected');
    const params = useParams();
    const router = useRouter();
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [loadingDocument, setLoadingDocument] = useState(true);
    const [documentError, setDocumentError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSection, setActiveSection] = useState("overview");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [sectionLoading, setSectionLoading] = useState<Record<string, boolean>>({});
    const [sectionData, setSectionData] = useState<Record<string, any>>({});
    const [chatMessages, setChatMessages] = useState<Array<{ id: number, text: string, sender: 'user' | 'bot', timestamp: Date }>>([
        {
            id: 1,
            text: "Hello! I'm your Gemini-powered document assistant. I've analyzed this document. Ask me anything about it!",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Helper function to safely get document ID as string
    const getDocumentId = (): string | null => {
        if (!params.id) return null;
        return Array.isArray(params.id) ? params.id[0] : params.id;
    };

    // Fetch section data dynamically
    const fetchSectionData = async (section: string, documentId: string) => {
        if (sectionData[section]) return; // Already loaded
        
        setSectionLoading(prev => ({ ...prev, [section]: true }));
        
        try {
            let result;
            switch (section) {
                case 'clauses':
                    result = await legalAiService.getImportantClauses(documentId);
                    break;
                case 'dates':
                    result = await legalAiService.getImportantDates(documentId);
                    break;
                case 'locations':
                    result = await legalAiService.getKeyEntities(documentId); // This includes locations
                    break;
                case 'breakdown':
                    result = await legalAiService.getDetailedBreakdown(documentId);
                    break;
                case 'risks':
                    result = await legalAiService.getAttentionPoints(documentId);
                    break;
                case 'mindmap':
                    result = await legalAiService.getMindMap(documentId);
                    break;
                default:
                    return;
            }
            
            setSectionData(prev => ({ ...prev, [section]: result.result }));
        } catch (error) {
            console.error(`Error fetching ${section}:`, error);
            setSectionData(prev => ({ 
                ...prev, 
                [section]: { error: error instanceof ApiError ? error.message : 'Failed to load data' }
            }));
        } finally {
            setSectionLoading(prev => ({ ...prev, [section]: false }));
        }
    };

    useEffect(() => {
        const fetchDocument = async () => {
            const documentId = getDocumentId();
            if (!documentId) {
                setDocumentError('Invalid document ID');
                setLoadingDocument(false);
                return;
            }

            setLoadingDocument(true);
            setDocumentError(null);
            
            try {
                // First check if document exists and get its status
                const statusResult = await legalAiService.getDocumentStatus(documentId);
                
                if (!statusResult.exists) {
                    throw new Error('Document not found');
                }

                // Get document summary (this gives us basic info)
                const summaryResult = await legalAiService.getDocumentSummary(documentId);
                
                // Build document data from the API response
                const docData: DocumentData = {
                    id: documentId,
                    name: `Document_${documentId}.pdf`, // You might want to store this in the backend
                    type: "Gemini Deep Analysis",
                    uploadDate: new Date().toISOString().split('T')[0], // or get from statusResult
                    status: "AI Analyzed",
                    summary: summaryResult.result?.summary || summaryResult.result?.content || 'No summary available',
                };
                
                setDocumentData(docData);
            } catch (error) {
                console.error("Failed to load document:", error);
                if (error instanceof ApiError) {
                    setDocumentError(`Failed to load document: ${error.message}`);
                } else {
                    setDocumentError('Failed to load document. Please try again.');
                }
            } finally {
                setLoadingDocument(false);
            }
        };

        const documentId = getDocumentId();
        if (documentId) {
            fetchDocument();
        }
    }, [params.id]);

    // Handle tab changes and fetch section data
    useEffect(() => {
        const documentId = getDocumentId();
        if (documentId && activeSection !== 'overview') {
            fetchSectionData(activeSection, documentId);
        }
    }, [activeSection, params.id]);

    const handleAudioPlay = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying && documentData?.summary) {
            const utterance = new SpeechSynthesisUtterance(documentData.summary);
            utterance.onend = () => setIsPlaying(false);
            speechSynthesis.speak(utterance);
        } else {
            speechSynthesis.cancel();
        }
    };

    // Helper function to render loading state
    const renderLoadingState = (title: string) => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-4 text-gray-600">Loading {title.toLowerCase()}...</span>
                </div>
            </div>
        </div>
    );

    // Helper function to render error state
    const renderErrorState = (title: string, error: string) => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => {
                            const documentId = getDocumentId();
                            if (documentId) {
                                setSectionData(prev => ({ ...prev, [activeSection]: undefined }));
                                fetchSectionData(activeSection, documentId);
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );

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

        try {
            const documentId = getDocumentId();
            if (!documentId) {
                throw new Error('Invalid document ID');
            }

            const response = await legalAiService.chatWithDocument({
                document_id: documentId,
                question: currentMessage
            });

            const botResponse = {
                id: chatMessages.length + 2,
                text: response.answer,
                sender: 'bot' as const,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorResponse = {
                id: chatMessages.length + 2,
                text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
                sender: 'bot' as const,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
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

    if (documentError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md mx-4">
                    <div className="text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Document Not Found</h2>
                        <p className="text-gray-600 mb-6">{documentError}</p>
                        <div className="space-x-3">
                            <button 
                                onClick={() => router.back()}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Go Back
                            </button>
                            <button 
                                onClick={() => router.push('/home')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                        sectionLoading.clauses ? renderLoadingState("Key Clauses Analysis") :
                        sectionData.clauses?.error ? renderErrorState("Key Clauses Analysis", sectionData.clauses.error) :
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Clauses Analysis</h2>
                                <div className="grid gap-6">
                                    {sectionData.clauses && Array.isArray(sectionData.clauses.clauses) ? 
                                        sectionData.clauses.clauses.map((clause: any, index: number) => (
                                            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0 text-blue-600">
                                                            {getTypeIcon('legal')}
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {clause.title || clause.clause_text?.substring(0, 50) + '...' || `Clause ${index + 1}`}
                                                        </h3>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getImportanceColor(clause.importance || 'medium')}`}>
                                                        {(clause.importance || 'medium').toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {clause.content || clause.clause_text || clause.text || 'No content available'}
                                                </p>
                                                {clause.source && (
                                                    <p className="text-sm text-gray-500 mt-2">Source: {clause.source}</p>
                                                )}
                                            </div>
                                        )) :
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">No clauses found or data is being processed.</p>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'dates' && (
                        sectionLoading.dates ? renderLoadingState("Important Dates Timeline") :
                        sectionData.dates?.error ? renderErrorState("Important Dates Timeline", sectionData.dates.error) :
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Dates Timeline</h2>
                                <div className="space-y-6">
                                    {sectionData.dates && Array.isArray(sectionData.dates.dates) ? 
                                        sectionData.dates.dates.map((dateItem: any, index: number) => (
                                            <div key={index} className="flex items-center space-x-6 p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-blue-500`}>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {dateItem.event || dateItem.description || `Date ${index + 1}`}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        {dateItem.date && new Date(dateItem.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    {dateItem.context && (
                                                        <p className="text-sm text-gray-500 mt-1">{dateItem.context}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${dateItem.date && new Date(dateItem.date) > new Date() ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {dateItem.date && new Date(dateItem.date) > new Date() ? 'Upcoming' : 'Past'}
                                                    </span>
                                                </div>
                                            </div>
                                        )) :
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">No important dates found or data is being processed.</p>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'locations' && (
                        sectionLoading.locations ? renderLoadingState("Key Entities & Locations") :
                        sectionData.locations?.error ? renderErrorState("Key Entities & Locations", sectionData.locations.error) :
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Entities & Locations</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {sectionData.locations && (
                                        sectionData.locations.entities || sectionData.locations.parties || sectionData.locations
                                    ) ? (
                                        Object.entries(sectionData.locations.entities || sectionData.locations.parties || sectionData.locations).map(([key, value]: [string, any], index: number) => (
                                            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                                <div className="flex items-start space-x-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white bg-purple-500`}>
                                                        {key.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h3 className="text-lg font-semibold text-gray-900">{key}</h3>
                                                        <p className="text-gray-600 mt-1">
                                                            {Array.isArray(value) ? value.join(', ') : 
                                                             typeof value === 'string' ? value : 
                                                             JSON.stringify(value)}
                                                        </p>
                                                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                            {key}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 col-span-2">
                                            <p className="text-gray-600">No entities or locations found or data is being processed.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'breakdown' && (
                        sectionLoading.breakdown ? renderLoadingState("Detailed Breakdown") :
                        sectionData.breakdown?.error ? renderErrorState("Detailed Breakdown", sectionData.breakdown.error) :
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 backdrop-blur-sm bg-opacity-95">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Breakdown</h2>
                                <div className="space-y-8">
                                    {sectionData.breakdown && sectionData.breakdown.breakdown ? (
                                        typeof sectionData.breakdown.breakdown === 'string' ? (
                                            <div className="border border-gray-200 rounded-xl p-6">
                                                <div className="prose max-w-none">
                                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                        {sectionData.breakdown.breakdown}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : Array.isArray(sectionData.breakdown.breakdown) ? (
                                            sectionData.breakdown.breakdown.map((section: any, index: number) => (
                                                <div key={index} className="border border-gray-200 rounded-xl p-6">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                                        {section.section || section.title || `Section ${index + 1}`}
                                                    </h3>
                                                    <p className="text-gray-700 leading-relaxed mb-4">
                                                        {section.content || section.description || section.text}
                                                    </p>
                                                    {section.subsections && Array.isArray(section.subsections) && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {section.subsections.map((subsection: any, subIndex: number) => (
                                                                <span
                                                                    key={subIndex}
                                                                    className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm font-medium"
                                                                >
                                                                    {typeof subsection === 'string' ? subsection : subsection.title || subsection.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="border border-gray-200 rounded-xl p-6">
                                                <div className="prose max-w-none">
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {JSON.stringify(sectionData.breakdown.breakdown, null, 2)}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">No detailed breakdown available or data is being processed.</p>
                                        </div>
                                    )}
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