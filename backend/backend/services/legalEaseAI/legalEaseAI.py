"""
Enhanced Legal Document Analysis Service with RAG capabilities
Integrates Astra DB vector database with LangGraph for comprehensive document analysis
"""

import os
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
import asyncio

from .astra_db_service import get_astra_db_service
from .document_vectorization_service import get_document_vectorization_service
from .langgraph_workflow import get_legal_analysis_workflow

logger = logging.getLogger(__name__)

class EnhancedLegalAnalysisService:
    """Enhanced service for legal document analysis with RAG capabilities"""
    
    def __init__(self):
        self.astra_db = get_astra_db_service()
        self.vectorization_service = get_document_vectorization_service()
        self.workflow = get_legal_analysis_workflow()
    
    async def upload_and_process_document(self, file_path: str, document_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload a document, process it, and store in vector database
        
        Args:
            file_path: Path to the document file
            document_id: Optional custom document ID
            
        Returns:
            Processing results with document ID and statistics
        """
        try:
            # Process the document
            doc_id, chunks = await self.vectorization_service.process_document(file_path, document_id)
            
            if not chunks:
                return {
                    "success": False,
                    "error": "Failed to process document - no content extracted"
                }
            
            # Store chunks in vector database
            success = await self.astra_db.store_document_chunks(doc_id, chunks)
            
            if not success:
                return {
                    "success": False,
                    "error": "Failed to store document in vector database"
                }
            
            # Calculate document statistics
            stats = self.vectorization_service.calculate_document_stats(chunks)
            
            return {
                "success": True,
                "document_id": doc_id,
                "message": f"Successfully processed and stored document",
                "statistics": stats
            }
            
        except Exception as e:
            logger.error(f"Error uploading and processing document: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_summary(self, document_id: str) -> Dict[str, Any]:
        """Generate a concise document summary"""
        try:
            result = await self.workflow.analyze_document(
                document_id=document_id,
                analysis_type="summary"
            )
            return result
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return {"error": str(e)}
    
    async def extract_important_clauses(self, document_id: str) -> Dict[str, Any]:
        """Extract important clauses that impact obligations, liabilities, rights, and risks"""
        try:
            result = await self.workflow.analyze_document(
                document_id=document_id,
                analysis_type="clauses"
            )
            return result
        except Exception as e:
            logger.error(f"Error extracting clauses: {e}")
            return {"error": str(e)}
    
    async def extract_important_dates(self, document_id: str) -> Dict[str, Any]:
        """Extract important dates with context"""
        try:
            result = await self.workflow.analyze_document(
                document_id=document_id,
                analysis_type="dates"
            )
            return result
        except Exception as e:
            logger.error(f"Error extracting dates: {e}")
            return {"error": str(e)}
    
    async def identify_attention_points(self, document_id: str) -> Dict[str, Any]:
        """Identify risks, heavy obligations, and unusual terms"""
        try:
            result = await self.workflow.analyze_document(
                document_id=document_id,
                analysis_type="risks"
            )
            return result
        except Exception as e:
            logger.error(f"Error identifying attention points: {e}")
            return {"error": str(e)}
    
    async def extract_key_entities(self, document_id: str) -> Dict[str, Any]:
        """Extract key people, places, and organizations"""
        try:
            result = await self.workflow.analyze_document(
                document_id=document_id,
                analysis_type="entities"
            )
            return result
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return {"error": str(e)}
    
    async def generate_detailed_breakdown(self, document_id: str) -> Dict[str, Any]:
        """Generate section-by-section detailed breakdown"""
        try:
            result = await self.workflow.analyze_document(
                document_id=document_id,
                analysis_type="breakdown"
            )
            return result
        except Exception as e:
            logger.error(f"Error generating breakdown: {e}")
            return {"error": str(e)}
    
    async def generate_mind_map(self, document_id: str) -> Dict[str, Any]:
        """Generate Mermaid mind map code for the document"""
        try:
            result = await self.workflow.analyze_document(
                document_id=document_id,
                analysis_type="mindmap"
            )
            return result
        except Exception as e:
            logger.error(f"Error generating mind map: {e}")
            return {"error": str(e)}
    
    async def chat_about_document(self, document_id: str, question: str) -> Dict[str, Any]:
        """Interactive chat about the document with RAG"""
        try:
            result = await self.workflow.analyze_document(
                document_id=document_id,
                analysis_type="chat",
                user_question=question
            )
            return result
        except Exception as e:
            logger.error(f"Error in document chat: {e}")
            return {"error": str(e)}
    
    async def get_document_status(self, document_id: str) -> Dict[str, Any]:
        """Get status and metadata about a processed document"""
        try:
            # Get document chunks to verify it exists
            chunks = await self.astra_db.get_document_chunks(document_id)
            
            if not chunks:
                return {
                    "exists": False,
                    "message": "Document not found in vector database"
                }
            
            # Calculate statistics
            stats = self.vectorization_service.calculate_document_stats(chunks)
            
            return {
                "exists": True,
                "document_id": document_id,
                "statistics": stats,
                "chunks_count": len(chunks)
            }
            
        except Exception as e:
            logger.error(f"Error getting document status: {e}")
            return {"error": str(e)}
    
    async def delete_document(self, document_id: str) -> Dict[str, Any]:
        """Delete a document from the vector database"""
        try:
            success = await self.astra_db.delete_document(document_id)
            
            if success:
                return {
                    "success": True,
                    "message": f"Document {document_id} deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to delete document"
                }
                
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return {"error": str(e)}
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector database"""
        try:
            return self.astra_db.get_collection_stats()
        except Exception as e:
            logger.error(f"Error getting database stats: {e}")
            return {"error": str(e)}

# Global instance
enhanced_legal_service = None

def get_enhanced_legal_service() -> EnhancedLegalAnalysisService:
    """Get or create the global enhanced legal analysis service instance"""
    global enhanced_legal_service
    if enhanced_legal_service is None:
        enhanced_legal_service = EnhancedLegalAnalysisService()
    return enhanced_legal_service
