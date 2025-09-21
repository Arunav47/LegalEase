// API Response Types
export interface DocumentUploadResponse {
  success: boolean;
  document_id?: string;
  message: string;
  statistics?: Record<string, unknown>;
  error?: string;
}

export interface AnalysisResponse {
  analysis_type: string;
  document_id: string;
  timestamp: string;
  context_chunks_used: number;
  result: Record<string, unknown>;
  error?: string;
}

export interface ChatRequest {
  document_id: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  context_used: number;
  sources: unknown[];
  document_id: string;
  timestamp: string;
}

export interface DocumentStatusResponse {
  exists: boolean;
  document_id?: string;
  statistics?: Record<string, unknown>;
  chunks_count?: number;
  message?: string;
  error?: string;
}

export interface DatabaseStatsResponse {
  total_documents: number;
  total_chunks: number;
  error?: string;
}

// Frontend specific types
export interface DocumentData {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: string;
  summary?: string;
  keyClauses?: KeyClause[];
  importantDates?: ImportantDate[];
  locations?: Location[];
  detailedBreakdown?: DetailedSection[];
  entities?: unknown;
  risks?: unknown;
  mindmap?: string;
}

export interface KeyClause {
  title: string;
  content: string;
  type: string;
  importance: string;
}

export interface ImportantDate {
  date: string;
  event: string;
  type: string;
}

export interface Location {
  place: string;
  address: string;
  type: string;
}

export interface DetailedSection {
  section: string;
  content: string;
  subsections: string[];
}