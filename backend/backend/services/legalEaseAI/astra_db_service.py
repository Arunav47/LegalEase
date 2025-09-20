"""
Astra DB Vector Database Service
Provides connection and vector operations for legal document analysis
"""

import os
import logging
from typing import List, Dict, Any, Optional
from astrapy import DataAPIClient
from astrapy.collection import Collection
from sentence_transformers import SentenceTransformer
import asyncio
from functools import lru_cache

logger = logging.getLogger(__name__)

class AstraDBService:
    """Service for managing Astra DB vector operations"""
    
    def __init__(self):
        self.client = None
        self.database = None
        self.collection: Optional[Collection] = None
        self.embedding_model = None
        self._initialize_connection()
        
    def _initialize_connection(self):
        """Initialize connection to Astra DB"""
        try:
            # Get Astra DB credentials from environment
            astra_db_token = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
            astra_db_id = os.getenv("ASTRA_DB_ID")
            astra_db_endpoint = os.getenv("ASTRA_DB_ENDPOINT")
            
            if not all([astra_db_token, astra_db_id]):
                raise ValueError("Missing Astra DB credentials. Please set ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_ID")
            
            # Initialize the client
            self.client = DataAPIClient(astra_db_token)
            
            # Connect to database
            if astra_db_endpoint:
                self.database = self.client.get_database(astra_db_endpoint)
            else:
                self.database = self.client.get_database_by_api_endpoint(
                    f"https://{astra_db_id}-{os.getenv('ASTRA_DB_REGION', 'us-east1')}.apps.astra.datastax.com"
                )
            
            # Get or create collection for legal documents
            collection_name = "legal_documents"
            try:
                self.collection = self.database.get_collection(collection_name)
            except Exception:
                # Create collection if it doesn't exist
                self.collection = self.database.create_collection(
                    collection_name,
                    dimension=384,  # sentence-transformers/all-MiniLM-L6-v2 dimension
                    metric="cosine"
                )
            
            # Initialize embedding model
            self.embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
            
            logger.info("Successfully connected to Astra DB")
            
        except Exception as e:
            logger.error(f"Failed to initialize Astra DB connection: {e}")
            raise
    
    @lru_cache(maxsize=1000)
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using cached results"""
        if not self.embedding_model:
            raise RuntimeError("Embedding model not initialized")
        
        embedding = self.embedding_model.encode(text, convert_to_tensor=False)
        return embedding.tolist()
    
    async def store_document_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> bool:
        """
        Store document chunks with embeddings in Astra DB
        
        Args:
            document_id: Unique identifier for the document
            chunks: List of document chunks with metadata
            
        Returns:
            bool: Success status
        """
        try:
            documents_to_insert = []
            
            for i, chunk in enumerate(chunks):
                # Generate embedding for the chunk text
                embedding = self.generate_embedding(chunk['text'])
                
                # Prepare document for insertion
                doc = {
                    "_id": f"{document_id}_chunk_{i}",
                    "document_id": document_id,
                    "chunk_index": i,
                    "text": chunk['text'],
                    "page_number": chunk.get('page_number', 0),
                    "section": chunk.get('section', ''),
                    "metadata": chunk.get('metadata', {}),
                    "$vector": embedding
                }
                documents_to_insert.append(doc)
            
            # Insert documents in batch
            if documents_to_insert:
                self.collection.insert_many(documents_to_insert)
                logger.info(f"Stored {len(documents_to_insert)} chunks for document {document_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error storing document chunks: {e}")
            return False
    
    async def similarity_search(self, query: str, document_id: Optional[str] = None, 
                              limit: int = 5, min_score: float = 0.7) -> List[Dict[str, Any]]:
        """
        Perform similarity search on stored document chunks
        
        Args:
            query: Search query text
            document_id: Optional filter by document ID
            limit: Maximum number of results
            min_score: Minimum similarity score threshold
            
        Returns:
            List of matching chunks with scores
        """
        try:
            # Generate embedding for query
            query_embedding = self.generate_embedding(query)
            
            # Prepare filter
            filter_dict = {}
            if document_id:
                filter_dict["document_id"] = document_id
            
            # Perform vector search
            search_params = {
                "vector": query_embedding,
                "limit": limit,
                "include_similarity": True
            }
            
            if filter_dict:
                search_params["filter"] = filter_dict
            
            results = self.collection.vector_search(**search_params)
            
            # Filter by minimum score and format results
            filtered_results = []
            for doc in results:
                similarity = doc.get("$similarity", 0)
                if similarity >= min_score:
                    result = {
                        "text": doc["text"],
                        "document_id": doc["document_id"],
                        "chunk_index": doc["chunk_index"],
                        "page_number": doc.get("page_number", 0),
                        "section": doc.get("section", ""),
                        "metadata": doc.get("metadata", {}),
                        "similarity_score": similarity
                    }
                    filtered_results.append(result)
            
            return filtered_results
            
        except Exception as e:
            logger.error(f"Error performing similarity search: {e}")
            return []
    
    async def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Retrieve all chunks for a specific document"""
        try:
            filter_dict = {"document_id": document_id}
            
            cursor = self.collection.find(filter_dict, sort={"chunk_index": 1})
            chunks = []
            
            for doc in cursor:
                chunk = {
                    "text": doc["text"],
                    "chunk_index": doc["chunk_index"],
                    "page_number": doc.get("page_number", 0),
                    "section": doc.get("section", ""),
                    "metadata": doc.get("metadata", {})
                }
                chunks.append(chunk)
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error retrieving document chunks: {e}")
            return []
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete all chunks for a specific document"""
        try:
            filter_dict = {"document_id": document_id}
            result = self.collection.delete_many(filter_dict)
            
            logger.info(f"Deleted {result.deleted_count} chunks for document {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection"""
        try:
            # Get document count by document_id
            pipeline = [
                {"$group": {"_id": "$document_id", "chunk_count": {"$sum": 1}}},
                {"$group": {"_id": None, "total_documents": {"$sum": 1}, "total_chunks": {"$sum": "$chunk_count"}}}
            ]
            
            result = list(self.collection.aggregate(pipeline))
            
            if result:
                stats = result[0]
                return {
                    "total_documents": stats.get("total_documents", 0),
                    "total_chunks": stats.get("total_chunks", 0)
                }
            else:
                return {"total_documents": 0, "total_chunks": 0}
                
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {"total_documents": 0, "total_chunks": 0}

# Global instance
astra_db_service = None

def get_astra_db_service() -> AstraDBService:
    """Get or create the global AstraDB service instance"""
    global astra_db_service
    if astra_db_service is None:
        astra_db_service = AstraDBService()
    return astra_db_service