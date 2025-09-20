"""
Legal AI API Views
FastAPI endpoints for enhanced legal document analysis with RAG capabilities
"""

import os
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import tempfile
from pathlib import Path

from backend.services.legalEaseAI.legalEaseAI import get_enhanced_legal_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class DocumentUploadResponse(BaseModel):
    success: bool
    document_id: Optional[str] = None
    message: str
    statistics: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class AnalysisResponse(BaseModel):
    analysis_type: str
    document_id: str
    timestamp: str
    context_chunks_used: int
    result: Dict[str, Any]
    error: Optional[str] = None

class ChatRequest(BaseModel):
    document_id: str = Field(..., description="ID of the document to query")
    question: str = Field(..., description="Question about the document")

class ChatResponse(BaseModel):
    answer: str
    context_used: int
    sources: list
    document_id: str
    timestamp: str

class DocumentStatusResponse(BaseModel):
    exists: bool
    document_id: Optional[str] = None
    statistics: Optional[Dict[str, Any]] = None
    chunks_count: Optional[int] = None
    message: Optional[str] = None
    error: Optional[str] = None

class DatabaseStatsResponse(BaseModel):
    total_documents: int
    total_chunks: int
    error: Optional[str] = None

# Dependency to get the legal service
def get_legal_service():
    return get_enhanced_legal_service()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_id: Optional[str] = Form(None),
    legal_service = Depends(get_legal_service)
):
    """
    Upload and process a legal document for analysis
    
    - **file**: PDF file to upload and process
    - **document_id**: Optional custom document ID (auto-generated if not provided)
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Process the document
            result = await legal_service.upload_and_process_document(
                file_path=temp_file_path,
                document_id=document_id
            )
            
            return DocumentUploadResponse(**result)
            
        finally:
            # Clean up temporary file
            Path(temp_file_path).unlink(missing_ok=True)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/summary", response_model=AnalysisResponse)
async def get_document_summary(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    Generate a concise overview of the entire document in plain language
    
    - **document_id**: ID of the processed document
    """
    try:
        result = await legal_service.generate_summary(document_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return AnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/clauses", response_model=AnalysisResponse)
async def get_important_clauses(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    Extract the exact text lines of clauses that significantly impact obligations, 
    liabilities, rights, risks, and unusual conditions
    
    - **document_id**: ID of the processed document
    """
    try:
        result = await legal_service.extract_important_clauses(document_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return AnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting clauses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/dates", response_model=AnalysisResponse)
async def get_important_dates(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    Extract the exact date mentions (with surrounding context) such as deadlines, 
    renewal dates, termination windows, and payment dates
    
    - **document_id**: ID of the processed document
    """
    try:
        result = await legal_service.extract_important_dates(document_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return AnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting dates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/risks", response_model=AnalysisResponse)
async def get_attention_points(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    Highlight the exact sentences that describe risks, heavy obligations, 
    unusual terms, or ambiguous conditions
    
    - **document_id**: ID of the processed document
    """
    try:
        result = await legal_service.identify_attention_points(document_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return AnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error identifying attention points: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/entities", response_model=AnalysisResponse)
async def get_key_entities(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    List the parties, signatories, companies, locations, and jurisdictions 
    mentioned in the contract. Provide the exact names and references as they appear
    
    - **document_id**: ID of the processed document
    """
    try:
        result = await legal_service.extract_key_entities(document_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return AnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting entities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/breakdown", response_model=AnalysisResponse)
async def get_detailed_breakdown(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    Explain the document section by section, including exact references when possible
    
    - **document_id**: ID of the processed document
    """
    try:
        result = await legal_service.generate_detailed_breakdown(document_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return AnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/mindmap", response_model=AnalysisResponse)
async def get_mind_map(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    Provide a valid Mermaid mind map of the document, showing:
    - Main contract sections
    - Important clauses (with shortened labels, but linked back to their full text)
    - Important dates
    - Risks/attention points
    - People & places
    
    - **document_id**: ID of the processed document
    """
    try:
        result = await legal_service.generate_mind_map(document_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return AnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating mind map: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/chat")
async def chat_with_document(
    chat_request: ChatRequest,
    legal_service = Depends(get_legal_service)
):
    """
    Act as an interactive RAG-powered chatbot, answering any user question 
    about the document with references to the exact sentences/clauses
    
    - **document_id**: ID of the processed document
    - **question**: Question about the document
    """
    try:
        result = await legal_service.chat_about_document(
            document_id=chat_request.document_id,
            question=chat_request.question
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Extract the chat response from the result
        if "result" in result and isinstance(result["result"], dict):
            chat_result = result["result"]
            return ChatResponse(
                answer=chat_result.get("answer", "No answer generated"),
                context_used=chat_result.get("context_used", 0),
                sources=chat_result.get("sources", []),
                document_id=chat_request.document_id,
                timestamp=result.get("timestamp", "")
            )
        else:
            return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in document chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/status", response_model=DocumentStatusResponse)
async def get_document_status(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    Get status and metadata about a processed document
    
    - **document_id**: ID of the document to check
    """
    try:
        result = await legal_service.get_document_status(document_id)
        
        return DocumentStatusResponse(**result)
        
    except Exception as e:
        logger.error(f"Error getting document status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    legal_service = Depends(get_legal_service)
):
    """
    Delete a document from the vector database
    
    - **document_id**: ID of the document to delete
    """
    try:
        result = await legal_service.delete_document(document_id)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/database/stats", response_model=DatabaseStatsResponse)
async def get_database_stats(
    legal_service = Depends(get_legal_service)
):
    """
    Get statistics about the vector database
    """
    try:
        result = legal_service.get_database_stats()
        
        if "error" in result:
            return DatabaseStatsResponse(
                total_documents=0,
                total_chunks=0,
                error=result["error"]
            )
        
        return DatabaseStatsResponse(
            total_documents=result.get("total_documents", 0),
            total_chunks=result.get("total_chunks", 0)
        )
        
    except Exception as e:
        logger.error(f"Error getting database stats: {e}")
        return DatabaseStatsResponse(
            total_documents=0,
            total_chunks=0,
            error=str(e)
        )