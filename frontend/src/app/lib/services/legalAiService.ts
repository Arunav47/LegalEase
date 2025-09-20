import { 
  DocumentUploadResponse, 
  AnalysisResponse, 
  ChatRequest, 
  ChatResponse, 
  DocumentStatusResponse, 
  DatabaseStatsResponse 
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/legalai';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, errorData.detail || 'Request failed');
  }
  return response.json();
}

export const legalAiService = {
  /**
   * Upload a document for processing
   */
  async uploadDocument(file: File, documentId?: string): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (documentId) {
      formData.append('document_id', documentId);
    }

    const response = await fetch(`${API_BASE_URL}/upload/supabase-first`, {
      method: 'POST',
      body: formData,
    });

    return handleResponse<DocumentUploadResponse>(response);
  },

  /**
   * Get document summary
   */
  async getDocumentSummary(documentId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/summary`);
    return handleResponse<AnalysisResponse>(response);
  },

  /**
   * Get important clauses
   */
  async getImportantClauses(documentId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/clauses`);
    return handleResponse<AnalysisResponse>(response);
  },

  /**
   * Get important dates
   */
  async getImportantDates(documentId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/dates`);
    return handleResponse<AnalysisResponse>(response);
  },

  /**
   * Get attention points/risks
   */
  async getAttentionPoints(documentId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/risks`);
    return handleResponse<AnalysisResponse>(response);
  },

  /**
   * Get key entities
   */
  async getKeyEntities(documentId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/entities`);
    return handleResponse<AnalysisResponse>(response);
  },

  /**
   * Get detailed breakdown
   */
  async getDetailedBreakdown(documentId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/breakdown`);
    return handleResponse<AnalysisResponse>(response);
  },

  /**
   * Get mind map
   */
  async getMindMap(documentId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/mindmap`);
    return handleResponse<AnalysisResponse>(response);
  },

  /**
   * Chat with document
   */
  async chatWithDocument(chatRequest: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatRequest),
    });

    return handleResponse<ChatResponse>(response);
  },

  /**
   * Get document status
   */
  async getDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/status`);
    return handleResponse<DocumentStatusResponse>(response);
  },

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<DatabaseStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/database/stats`);
    return handleResponse<DatabaseStatsResponse>(response);
  },
};

export { ApiError };