"""
LangGraph Document Analysis Workflow
Implements a graph-based workflow for legal document analysis with context retrieval
"""

import logging
from typing import Dict, Any, List, Optional, TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import asyncio
from datetime import datetime
import re

from .astra_db_service import get_astra_db_service
from .document_vectorization_service import get_document_vectorization_service

logger = logging.getLogger(__name__)

class DocumentAnalysisState(TypedDict):
    """State for the document analysis workflow"""
    messages: Annotated[List[BaseMessage], add_messages]
    document_id: str
    analysis_type: str  # summary, clauses, dates, risks, entities, breakdown, mindmap, chat
    query: Optional[str]
    context_chunks: List[Dict[str, Any]]
    analysis_result: Dict[str, Any]
    user_question: Optional[str]

class LegalDocumentAnalysisWorkflow:
    """LangGraph workflow for legal document analysis"""
    
    def __init__(self):
        self.astra_db = get_astra_db_service()
        self.vectorization_service = get_document_vectorization_service()
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.1
        )
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(DocumentAnalysisState)
        
        # Add nodes
        workflow.add_node("retrieve_context", self._retrieve_context)
        workflow.add_node("analyze_document", self._analyze_document)
        workflow.add_node("format_output", self._format_output)
        
        # Add edges
        workflow.add_edge(START, "retrieve_context")
        workflow.add_edge("retrieve_context", "analyze_document")
        workflow.add_edge("analyze_document", "format_output")
        workflow.add_edge("format_output", END)
        
        return workflow.compile()
    
    async def _retrieve_context(self, state: DocumentAnalysisState) -> DocumentAnalysisState:
        """Retrieve relevant context chunks from vector database"""
        try:
            document_id = state["document_id"]
            analysis_type = state["analysis_type"]
            user_question = state.get("user_question", "")
            
            # Define queries for different analysis types
            context_queries = {
                "summary": "document overview main points key information",
                "clauses": "obligations liabilities rights responsibilities conditions terms",
                "dates": "deadline date time period duration termination renewal",
                "risks": "risk liability penalty obligation restriction limitation",
                "entities": "party company person organization location address",
                "breakdown": "section article clause paragraph structure",
                "mindmap": "structure sections main points organization",
                "chat": user_question or "general document information"
            }
            
            query = context_queries.get(analysis_type, "document content")
            
            # Retrieve relevant chunks
            if analysis_type == "chat" and user_question:
                # For chat, use the user's question directly
                context_chunks = await self.astra_db.similarity_search(
                    query=user_question,
                    document_id=document_id,
                    limit=8,
                    min_score=0.6
                )
            elif analysis_type in ["breakdown", "mindmap"]:
                # For structural analysis, get broader context
                context_chunks = await self.astra_db.get_document_chunks(document_id)
                # Limit to prevent context overflow
                context_chunks = context_chunks[:15]
            else:
                # For specific analysis types, use targeted retrieval
                context_chunks = await self.astra_db.similarity_search(
                    query=query,
                    document_id=document_id,
                    limit=10,
                    min_score=0.7
                )
            
            state["context_chunks"] = context_chunks
            logger.info(f"Retrieved {len(context_chunks)} context chunks for {analysis_type} analysis")
            
            return state
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            state["context_chunks"] = []
            return state
    
    async def _analyze_document(self, state: DocumentAnalysisState) -> DocumentAnalysisState:
        """Analyze document using LLM with retrieved context"""
        try:
            analysis_type = state["analysis_type"]
            context_chunks = state["context_chunks"]
            user_question = state.get("user_question", "")
            
            # Build context string
            context_text = self._build_context_text(context_chunks)
            
            # Get analysis prompt based on type
            system_prompt = self._get_analysis_prompt(analysis_type)
            
            # Build user message
            if analysis_type == "chat" and user_question:
                user_message = f"""
User Question: {user_question}

Document Context:
{context_text}

Please answer the user's question based on the provided document context. Always cite specific clauses or sections when possible.
"""
            else:
                user_message = f"""
Please analyze the following legal document content and provide {analysis_type} analysis:

Document Context:
{context_text}

Provide the analysis in valid JSON format as specified in the system instructions.
"""
            
            # Create messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ]
            
            # Get LLM response
            response = await self.llm.ainvoke(messages)
            
            # Parse response
            if analysis_type == "chat":
                # For chat, return the response directly
                analysis_result = {
                    "answer": response.content,
                    "context_used": len(context_chunks),
                    "sources": [
                        {
                            "text": chunk["text"][:200] + "...",
                            "page": chunk["page_number"],
                            "section": chunk["section"]
                        }
                        for chunk in context_chunks[:3]
                    ]
                }
            else:
                # For other types, try to parse as JSON
                analysis_result = self._parse_llm_response(response.content, analysis_type)
            
            state["analysis_result"] = analysis_result
            
            return state
            
        except Exception as e:
            logger.error(f"Error in document analysis: {e}")
            state["analysis_result"] = {"error": str(e)}
            return state
    
    async def _format_output(self, state: DocumentAnalysisState) -> DocumentAnalysisState:
        """Format the final output"""
        try:
            analysis_result = state["analysis_result"]
            analysis_type = state["analysis_type"]
            
            # Add metadata
            formatted_result = {
                "analysis_type": analysis_type,
                "document_id": state["document_id"],
                "timestamp": datetime.now().isoformat(),
                "context_chunks_used": len(state["context_chunks"]),
                "result": analysis_result
            }
            
            state["analysis_result"] = formatted_result
            
            return state
            
        except Exception as e:
            logger.error(f"Error formatting output: {e}")
            state["analysis_result"] = {"error": str(e)}
            return state
    
    def _build_context_text(self, context_chunks: List[Dict[str, Any]]) -> str:
        """Build context text from chunks"""
        if not context_chunks:
            return "No relevant context found."
        
        context_parts = []
        for i, chunk in enumerate(context_chunks):
            section = chunk.get("section", "Unknown Section")
            page = chunk.get("page_number", "Unknown Page")
            text = chunk["text"]
            
            context_part = f"""
[Chunk {i+1}] - Section: {section}, Page: {page}
{text}
---
"""
            context_parts.append(context_part)
        
        return "\n".join(context_parts)
    
    def _get_analysis_prompt(self, analysis_type: str) -> str:
        """Get system prompt for different analysis types"""
        
        base_prompt = """You are a legal document analysis assistant specialized in contracts and agreements.
You must analyze the provided document content and extract information exactly as it appears in the document.
Always provide verbatim text from the document for clauses, dates, and important sentences.
Do not paraphrase unless explicitly asked. Respond in valid JSON format only."""
        
        type_prompts = {
            "summary": base_prompt + """
            
Provide a document summary in this JSON format:
{
    "summary": "Concise overview in plain language",
    "document_type": "Type of legal document",
    "main_points": ["point1", "point2", "point3"],
    "key_stakeholders": ["party1", "party2"],
    "purpose": "Main purpose of the document"
}""",
            
            "clauses": base_prompt + """
            
Extract important clauses in this JSON format:
{
    "important_clauses": [
        {
            "clause_text": "Exact text from document",
            "clause_type": "obligation/liability/right/risk/condition",
            "page_number": 1,
            "section": "Section name",
            "significance": "Why this clause is important"
        }
    ]
}""",
            
            "dates": base_prompt + """
            
Extract important dates in this JSON format:
{
    "important_dates": [
        {
            "date_text": "Exact date mention with context",
            "date_value": "Standardized date if possible",
            "date_type": "deadline/renewal/termination/payment/other",
            "page_number": 1,
            "section": "Section name",
            "context": "Surrounding context"
        }
    ]
}""",
            
            "risks": base_prompt + """
            
Identify attention points and risks in this JSON format:
{
    "attention_points": [
        {
            "risk_text": "Exact sentence describing the risk",
            "risk_type": "liability/obligation/penalty/unusual_term/ambiguous",
            "severity": "high/medium/low",
            "page_number": 1,
            "section": "Section name",
            "implications": "What this means for the parties"
        }
    ]
}""",
            
            "entities": base_prompt + """
            
Extract key people and places in this JSON format:
{
    "key_entities": {
        "parties": [
            {
                "name": "Exact name as it appears",
                "role": "Role in the contract",
                "page_number": 1,
                "context": "How they are referenced"
            }
        ],
        "companies": ["Company names as they appear"],
        "locations": ["Addresses and jurisdictions"],
        "signatories": ["People who sign the document"],
        "other_entities": ["Other important entities"]
    }
}""",
            
            "breakdown": base_prompt + """
            
Provide detailed section breakdown in this JSON format:
{
    "detailed_breakdown": [
        {
            "section_title": "Section name",
            "section_summary": "What this section covers",
            "key_points": ["point1", "point2"],
            "important_clauses": ["clause1", "clause2"],
            "page_numbers": [1, 2],
            "subsections": ["subsection1", "subsection2"]
        }
    ]
}""",
            
            "mindmap": base_prompt + """
            
Generate a Mermaid mind map in this JSON format:
{
    "mindmap": {
        "mermaid_code": "```mermaid\\nmindmap\\n  root)Document Title(\\n    Section1\\n      Clause1\\n      Clause2\\n    Section2\\n      Date1\\n      Risk1\\n```",
        "structure": {
            "main_sections": ["section1", "section2"],
            "key_clauses": ["clause1", "clause2"],
            "important_dates": ["date1", "date2"],
            "risks": ["risk1", "risk2"],
            "entities": ["party1", "party2"]
        }
    }
}""",
            
            "chat": base_prompt + """
            
Answer the user's question about the document. Always cite specific clauses or sections when possible.
Reference the exact text from the document to support your answer.
Be helpful but do not provide legal advice - only extract and explain what is in the document."""
        }
        
        return type_prompts.get(analysis_type, base_prompt)
    
    def _parse_llm_response(self, response: str, analysis_type: str) -> Dict[str, Any]:
        """Parse LLM response, handling potential JSON formatting issues"""
        try:
            # Try to extract JSON from the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
            else:
                # If no JSON found, wrap the response
                return {
                    "raw_response": response,
                    "note": "Response was not in expected JSON format"
                }
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw response
            return {
                "raw_response": response,
                "note": "Failed to parse JSON response"
            }
    
    async def analyze_document(
        self,
        document_id: str,
        analysis_type: str,
        user_question: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run the document analysis workflow
        
        Args:
            document_id: ID of the document to analyze
            analysis_type: Type of analysis to perform
            user_question: Question for chat mode
            
        Returns:
            Analysis results
        """
        try:
            # Create initial state
            initial_state = DocumentAnalysisState(
                messages=[],
                document_id=document_id,
                analysis_type=analysis_type,
                query=None,
                context_chunks=[],
                analysis_result={},
                user_question=user_question
            )
            
            # Run the workflow
            final_state = await self.workflow.ainvoke(initial_state)
            
            return final_state["analysis_result"]
            
        except Exception as e:
            logger.error(f"Error in workflow execution: {e}")
            return {
                "error": str(e),
                "analysis_type": analysis_type,
                "document_id": document_id
            }

# Global instance
legal_workflow = None

def get_legal_analysis_workflow() -> LegalDocumentAnalysisWorkflow:
    """Get or create the global legal analysis workflow instance"""
    global legal_workflow
    if legal_workflow is None:
        legal_workflow = LegalDocumentAnalysisWorkflow()
    return legal_workflow