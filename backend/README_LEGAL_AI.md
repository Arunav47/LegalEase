# Legal AI Enhancement with Astra DB Vector Database

This enhancement integrates Astra DB vector database with LangFlow and LangGraph to provide comprehensive legal document analysis capabilities with RAG (Retrieval-Augmented Generation) functionality.

## Features

### 🔍 Document Analysis Capabilities

1. **Summary** - Concise overview of the entire document in plain language
2. **Important Clauses** - Extract exact text lines of significant clauses affecting obligations, liabilities, rights, and risks
3. **Important Dates** - Extract date mentions with context (deadlines, renewals, terminations, payments)
4. **Attention Points (Risks)** - Highlight sentences describing risks, obligations, unusual terms, or ambiguous conditions
5. **Key People & Places** - List parties, signatories, companies, locations, and jurisdictions with exact references
6. **Detailed Breakdown** - Section-by-section analysis with exact references
7. **Mind Map (Mermaid Code)** - Visual representation of document structure and key elements
8. **Chat Mode** - Interactive RAG-powered chatbot for document questions with source citations

## Architecture

### Tech Stack
- **Vector Database**: Astra DB (DataStax)
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)
- **LLM**: Google Gemini 2.0 Flash
- **Workflow**: LangGraph for structured analysis
- **API**: FastAPI with async support
- **Document Processing**: PyMuPDF for PDF text extraction

### Components

1. **AstraDBService** - Vector database operations and similarity search
2. **DocumentVectorizationService** - PDF processing, chunking, and entity extraction
3. **LangGraphWorkflow** - Structured analysis workflow with context retrieval
4. **EnhancedLegalAnalysisService** - Main service orchestrating all components
5. **API Endpoints** - REST API for all analysis functions

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
poetry install
```

### 2. Set Up Astra DB

1. Create an Astra DB account at https://astra.datastax.com/
2. Create a new Vector Database
3. Generate an Application Token
4. Note your Database ID and Region

### 3. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Configure the following environment variables in `.env`:

```env
# Astra DB Configuration
ASTRA_DB_APPLICATION_TOKEN=your_astra_db_token_here
ASTRA_DB_ID=your_database_id_here
ASTRA_DB_ENDPOINT=https://your-database-id-region.apps.astra.datastax.com
ASTRA_DB_REGION=us-east1

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

### 4. Initialize Vector Collection

The vector collection will be automatically created when the service starts. The collection specifications:
- Name: `legal_documents`
- Dimension: 384 (sentence-transformers/all-MiniLM-L6-v2)
- Metric: Cosine similarity

### 5. Start the Application

```bash
poetry run python -m backend
```

## API Endpoints

### Document Management

#### Upload Document
```http
POST /api/legalai/upload
Content-Type: multipart/form-data

file: <PDF file>
document_id: <optional custom ID>
```

#### Get Document Status
```http
GET /api/legalai/documents/{document_id}/status
```

#### Delete Document
```http
DELETE /api/legalai/documents/{document_id}
```

### Document Analysis

#### Generate Summary
```http
GET /api/legalai/documents/{document_id}/summary
```

Response:
```json
{
  "analysis_type": "summary",
  "document_id": "doc_123",
  "timestamp": "2024-01-01T10:00:00",
  "context_chunks_used": 5,
  "result": {
    "summary": "Concise overview in plain language",
    "document_type": "Service Agreement",
    "main_points": ["Point 1", "Point 2"],
    "key_stakeholders": ["Company A", "Company B"],
    "purpose": "Main purpose of the document"
  }
}
```

#### Extract Important Clauses
```http
GET /api/legalai/documents/{document_id}/clauses
```

Response:
```json
{
  "result": {
    "important_clauses": [
      {
        "clause_text": "Exact text from document",
        "clause_type": "obligation",
        "page_number": 2,
        "section": "Section 3 - Obligations",
        "significance": "Defines key responsibilities"
      }
    ]
  }
}
```

#### Extract Important Dates
```http
GET /api/legalai/documents/{document_id}/dates
```

#### Identify Attention Points (Risks)
```http
GET /api/legalai/documents/{document_id}/risks
```

#### Extract Key Entities
```http
GET /api/legalai/documents/{document_id}/entities
```

#### Generate Detailed Breakdown
```http
GET /api/legalai/documents/{document_id}/breakdown
```

#### Generate Mind Map
```http
GET /api/legalai/documents/{document_id}/mindmap
```

Response:
```json
{
  "result": {
    "mindmap": {
      "mermaid_code": "```mermaid\\nmindmap\\n  root)Service Agreement(\\n    Parties\\n      Company A\\n      Company B\\n    Terms\\n      Payment Terms\\n      Termination\\n```",
      "structure": {
        "main_sections": ["Parties", "Terms", "Conditions"],
        "key_clauses": ["Payment", "Termination"],
        "important_dates": ["2024-12-31"],
        "risks": ["Liability clause"],
        "entities": ["Company A", "Company B"]
      }
    }
  }
}
```

### Interactive Chat

#### Chat with Document
```http
POST /api/legalai/documents/chat
Content-Type: application/json

{
  "document_id": "doc_123",
  "question": "What are the payment terms?"
}
```

Response:
```json
{
  "answer": "According to Section 4 of the agreement...",
  "context_used": 3,
  "sources": [
    {
      "text": "Relevant clause text...",
      "page": 2,
      "section": "Payment Terms"
    }
  ],
  "document_id": "doc_123",
  "timestamp": "2024-01-01T10:00:00"
}
```

### Database Statistics

#### Get Database Stats
```http
GET /api/legalai/database/stats
```

Response:
```json
{
  "total_documents": 15,
  "total_chunks": 450
}
```

## Usage Examples

### 1. Upload and Analyze a Contract

```python
import requests

# Upload document
files = {'file': open('contract.pdf', 'rb')}
response = requests.post('http://localhost:8000/api/legalai/upload', files=files)
doc_data = response.json()
document_id = doc_data['document_id']

# Generate summary
summary = requests.get(f'http://localhost:8000/api/legalai/documents/{document_id}/summary')
print(summary.json())

# Extract important clauses
clauses = requests.get(f'http://localhost:8000/api/legalai/documents/{document_id}/clauses')
print(clauses.json())

# Chat about the document
chat_data = {
    "document_id": document_id,
    "question": "What are the termination conditions?"
}
chat_response = requests.post('http://localhost:8000/api/legalai/documents/chat', json=chat_data)
print(chat_response.json())
```

### 2. Generate Mind Map for Visualization

```python
# Get mind map
mindmap = requests.get(f'http://localhost:8000/api/legalai/documents/{document_id}/mindmap')
mermaid_code = mindmap.json()['result']['mindmap']['mermaid_code']

# Use mermaid_code in your frontend for visualization
print(mermaid_code)
```

## Testing

Run the test suite:

```bash
poetry run pytest tests/test_legal_ai.py -v
```

The test suite includes:
- Unit tests for all service components
- Integration tests for the complete workflow
- API endpoint tests
- Mock data and fixtures

## Performance Considerations

### Vector Search Optimization
- Use appropriate similarity thresholds (0.7+ recommended)
- Limit search results to relevant chunks (5-10 for specific analysis, 15+ for comprehensive breakdown)
- Consider document-specific filtering for multi-document scenarios

### Chunking Strategy
- Default chunk size: 1000 characters with 200 character overlap
- Maintains sentence boundaries where possible
- Preserves section context and metadata

### LLM Usage
- Structured prompts for consistent JSON output
- Context-aware analysis based on document type
- Fallback handling for malformed responses

## Error Handling

The system includes comprehensive error handling:
- Database connection failures
- Document processing errors
- LLM API failures
- Invalid file formats
- Missing environment variables

## Security Considerations

- Environment variables for sensitive credentials
- Input validation for all API endpoints
- File type restrictions (PDF only)
- Temporary file cleanup
- Rate limiting (implement as needed)

## Monitoring and Logging

- Structured logging throughout the application
- Performance metrics for vector operations
- Error tracking and alerting
- Database statistics endpoint for monitoring

## Future Enhancements

1. **Multiple Document Support** - Analyze relationships across documents
2. **Custom Entity Recognition** - Train domain-specific NER models
3. **Comparative Analysis** - Compare clauses across different contracts
4. **Template Generation** - Generate contract templates based on analysis
5. **Integration with Legal Databases** - Connect to case law and regulations
6. **Advanced Visualization** - Interactive document maps and clause relationships

## Troubleshooting

### Common Issues

1. **Astra DB Connection Failures**
   - Verify credentials in `.env`
   - Check network connectivity
   - Ensure database is active

2. **Embedding Model Loading Issues**
   - First run downloads model files (384MB)
   - Ensure sufficient disk space
   - Check internet connectivity

3. **PDF Processing Errors**
   - Verify PDF is not password-protected
   - Check file corruption
   - Ensure sufficient memory for large files

4. **LLM API Errors**
   - Verify Gemini API key
   - Check API quotas and limits
   - Review request payload size

For additional support, check the logs and error messages for specific guidance.