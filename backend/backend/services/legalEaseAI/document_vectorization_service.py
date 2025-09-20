"""
Document Vectorization Service
Handles document processing, chunking, and vectorization for legal document analysis
"""

import os
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
import fitz  # PyMuPDF
from pathlib import Path
import hashlib
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)

class DocumentVectorizationService:
    """Service for processing and vectorizing legal documents"""
    
    def __init__(self):
        self.chunk_size = 1000  # Characters per chunk
        self.chunk_overlap = 200  # Overlap between chunks
        self.min_chunk_size = 100  # Minimum chunk size
        
    def extract_text_from_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extract text from PDF with page and section information
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            List of text chunks with metadata
        """
        try:
            doc = fitz.open(file_path)
            pages_data = []
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                text = page.get_text()
                
                # Clean the text
                text = self._clean_text(text)
                
                if text.strip():  # Only include pages with content
                    page_data = {
                        'text': text,
                        'page_number': page_num + 1,
                        'metadata': {
                            'source': file_path,
                            'page_count': doc.page_count,
                            'extraction_time': datetime.now().isoformat()
                        }
                    }
                    pages_data.append(page_data)
            
            doc.close()
            logger.info(f"Extracted text from {len(pages_data)} pages from {file_path}")
            return pages_data
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {e}")
            return []
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove page numbers and headers/footers patterns
        text = re.sub(r'Page \d+ of \d+', '', text)
        text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)
        
        # Remove excessive line breaks
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
        
        return text.strip()
    
    def detect_sections(self, text: str) -> List[Dict[str, Any]]:
        """
        Detect document sections based on common legal document patterns
        
        Args:
            text: Document text
            
        Returns:
            List of sections with their text and metadata
        """
        sections = []
        
        # Common legal document section patterns
        section_patterns = [
            r'^(?:ARTICLE|SECTION|CLAUSE)\s+([IVX\d]+\.?)\s*[-:]?\s*(.+?)(?=\n)',
            r'^(\d+\.(?:\d+\.?)*)\s+(.+?)(?=\n)',
            r'^([A-Z][A-Z\s]+)(?=\n)',  # All caps headers
            r'^(WHEREAS|NOW THEREFORE|IN WITNESS WHEREOF)',  # Common legal phrases
            r'^(Parties?|Definitions?|Terms?|Conditions?|Obligations?|Rights?|Remedies?|Termination|Signatures?)',
        ]
        
        lines = text.split('\n')
        current_section = None
        current_text = []
        
        for line_num, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            # Check if line matches any section pattern
            is_section_header = False
            for pattern in section_patterns:
                match = re.match(pattern, line, re.IGNORECASE)
                if match:
                    # Save previous section if exists
                    if current_section and current_text:
                        sections.append({
                            'section_title': current_section,
                            'text': '\n'.join(current_text),
                            'start_line': sections[-1]['end_line'] + 1 if sections else 1,
                            'end_line': line_num
                        })
                    
                    # Start new section
                    current_section = line
                    current_text = []
                    is_section_header = True
                    break
            
            if not is_section_header:
                current_text.append(line)
        
        # Add the last section
        if current_section and current_text:
            sections.append({
                'section_title': current_section,
                'text': '\n'.join(current_text),
                'start_line': sections[-1]['end_line'] + 1 if sections else 1,
                'end_line': len(lines)
            })
        
        # If no sections found, treat entire text as one section
        if not sections:
            sections.append({
                'section_title': 'Document Content',
                'text': text,
                'start_line': 1,
                'end_line': len(lines)
            })
        
        return sections
    
    def chunk_text(self, text: str, section_title: str = "", page_number: int = 1) -> List[Dict[str, Any]]:
        """
        Split text into chunks with overlap for better context preservation
        
        Args:
            text: Text to chunk
            section_title: Title of the section
            page_number: Page number where text appears
            
        Returns:
            List of text chunks with metadata
        """
        if len(text) <= self.chunk_size:
            return [{
                'text': text,
                'section': section_title,
                'page_number': page_number,
                'chunk_size': len(text),
                'metadata': {
                    'is_complete_section': True
                }
            }]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # If we're not at the end, try to break at a sentence boundary
            if end < len(text):
                # Look for sentence endings within the last 200 characters
                sentence_end = -1
                for i in range(max(0, end - 200), end):
                    if text[i] in '.!?':
                        # Check if this is likely a sentence end (not abbreviation)
                        if i + 1 < len(text) and text[i + 1].isspace():
                            sentence_end = i + 1
                
                if sentence_end > 0:
                    end = sentence_end
            
            chunk_text = text[start:end].strip()
            
            if len(chunk_text) >= self.min_chunk_size:
                chunks.append({
                    'text': chunk_text,
                    'section': section_title,
                    'page_number': page_number,
                    'chunk_size': len(chunk_text),
                    'metadata': {
                        'start_char': start,
                        'end_char': end,
                        'is_complete_section': False
                    }
                })
            
            # Move start position with overlap
            start = max(start + self.chunk_size - self.chunk_overlap, end)
        
        return chunks
    
    async def process_document(self, file_path: str, document_id: Optional[str] = None) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Process a complete document: extract text, detect sections, and create chunks
        
        Args:
            file_path: Path to the document file
            document_id: Optional custom document ID
            
        Returns:
            Tuple of (document_id, list of processed chunks)
        """
        try:
            # Generate document ID if not provided
            if not document_id:
                file_hash = hashlib.md5(Path(file_path).read_bytes()).hexdigest()
                document_id = f"doc_{file_hash[:12]}"
            
            # Extract text from PDF
            pages_data = self.extract_text_from_pdf(file_path)
            if not pages_data:
                return document_id, []
            
            all_chunks = []
            
            for page_data in pages_data:
                page_text = page_data['text']
                page_number = page_data['page_number']
                
                # Detect sections in the page
                sections = self.detect_sections(page_text)
                
                for section in sections:
                    section_chunks = self.chunk_text(
                        section['text'],
                        section['section_title'],
                        page_number
                    )
                    
                    # Add section metadata to each chunk
                    for chunk in section_chunks:
                        chunk['metadata'].update({
                            'section_start_line': section['start_line'],
                            'section_end_line': section['end_line'],
                            'document_id': document_id,
                            'file_path': file_path
                        })
                        chunk['metadata'].update(page_data['metadata'])
                    
                    all_chunks.extend(section_chunks)
            
            logger.info(f"Processed document {document_id}: {len(all_chunks)} chunks from {len(pages_data)} pages")
            return document_id, all_chunks
            
        except Exception as e:
            logger.error(f"Error processing document {file_path}: {e}")
            return document_id or "unknown", []
    
    def extract_key_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract key entities from legal document text
        
        Args:
            text: Document text
            
        Returns:
            Dictionary of entity types and their values
        """
        entities = {
            'parties': [],
            'dates': [],
            'monetary_amounts': [],
            'locations': [],
            'companies': [],
            'email_addresses': [],
            'phone_numbers': []
        }
        
        # Patterns for different entity types
        patterns = {
            'dates': [
                r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
                r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b',
                r'\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b'
            ],
            'monetary_amounts': [
                r'\$[\d,]+(?:\.\d{2})?',
                r'\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD|usd)\b'
            ],
            'email_addresses': [
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            ],
            'phone_numbers': [
                r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
            ],
            'companies': [
                r'\b[A-Z][a-zA-Z\s&]+(?:Inc\.?|LLC|Corp\.?|Corporation|Company|Co\.?|Ltd\.?)\b'
            ]
        }
        
        # Extract entities using patterns
        for entity_type, type_patterns in patterns.items():
            for pattern in type_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                entities[entity_type].extend(matches)
        
        # Remove duplicates and clean
        for entity_type in entities:
            entities[entity_type] = list(set(entities[entity_type]))
        
        return entities
    
    def calculate_document_stats(self, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate statistics for processed document"""
        if not chunks:
            return {}
        
        # Safely handle missing keys
        total_chars = 0
        pages = set()
        sections = set()
        
        for chunk in chunks:
            # Safely handle 'chunk_size' - if missing, use text length or default to 0
            if 'chunk_size' in chunk:
                total_chars += chunk['chunk_size']
            elif 'text' in chunk:
                total_chars += len(chunk['text'])
            
            # Safely get page number
            if 'page_number' in chunk:
                pages.add(chunk['page_number'])
            
            # Safely get section
            if 'section' in chunk and chunk['section']:
                sections.add(chunk['section'])
        
        return {
            'total_chunks': len(chunks),
            'total_characters': total_chars,
            'total_pages': len(pages),
            'total_sections': len(sections),
            'average_chunk_size': total_chars / len(chunks) if chunks else 0,
            'sections_list': list(sections)
        }

# Global instance
document_vectorization_service = DocumentVectorizationService()

def get_document_vectorization_service() -> DocumentVectorizationService:
    """Get the global document vectorization service instance"""
    return document_vectorization_service