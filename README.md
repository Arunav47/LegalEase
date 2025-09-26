# LegalEase *-Make Legal Documents Easy*


Generative AI for Demystifying Legal Documents

[Youtube Video Link:](https://youtu.be/yax_VB4LkT4?si=e90e0QPz9qJ3LBHd)

[Deployed Link:](https://legal-ease1-mqov.vercel.app/)
 
# Brief
1. Reads legal documents and provides overviews in text & audio format (powered by
**Gemini**)
2. Extracts key clauses and delivers risk assessments
3. Identifies important dates, deadlines, and locations directly from documents
4. Provides a detailed section-by-section breakdown for clarity
5. Enables an interactive chatbot where users can ask questions and get
document-grounded answers (using **Gemini + Google Cloud tools**)
6. Creates intuitive mind maps that visually simplify complex legal documents, helping users
quickly understand relationships, obligations, and potential risks.

## Features

1. **Multilingual Summaries with Text-to-Speech:** Instantly generates and vocalizes
document summaries in the user's preferred language.
2. **Automated Key Clause Identification:** Automatically pinpoints and highlights the most
crucial clauses so you don't miss them.
3. **Flagging Clauses Requiring User Review:** Proactively flags high-risk or ambiguous clauses
that demand your direct attention.
4. **Visual Mind Map Generation:** Transforms complex legal text into a simple, at-a-glance
visual mind map.
5. **Context-Aware Q&A with RAG:** Ask any question and get precise, evidence-based answers
pulled directly from the document.
6. **Our advanced OCR** reads text from any scanned document or image, allowing our AI to instantly extract a summary, critical clauses, and key dates.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Poetry (Python package manager)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Arunav47/LegalEase.git
cd LegalEase
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
pip install poetry
poetry install
```

#### Environment Configuration

Create a keys folder in the `backend` directory:

```bash
cd backend
create keys folder
```
Add the document-ai and vertex-ai key (from GCP) in the keys folder:

Create a `.env` file in the `backend` directory:

```bash
cd backend
create .env file
```

Edit the `.env` file with the following configuration:

```env

# Google Cloud Configuration (Alternative to API key)
GOOGLE_APPLICATION_CREDENTIALS=backend/keys/vertexai-sa-key.json
PROJECT_ID=your-google-cloud-project-id
LOCATION=examplelocation
PROCESSOR_ID=exampleid
GOOGLE_CLOUD_API_KEY=googlecloudAPIKEY

# AI Configuration
GEMINI_API_KEY=AIzaSyDummyKeyReplace_With_Your_Actual_Key_123456
MISTRAL_API_KEY=AIzaSyDummyKeyReplace_With_Your_Actual_Key_123456

# Database Configuration (Optional - for vector storage)
ASTRA_DB_APPLICATION_TOKEN=AstraCS:dummy-token-replace-with-actual
ASTRA_DB_ID=your-astra-database-id
ASTRA_DB_ENDPOINT=AstraDB_endpoint
ASTRA_DB_REGION=AstraDB_region

# Supabase Configuration 
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=anonkey
SUPABASE_BUCKET=bucketname

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

```

#### Start the Backend Server

```bash
# Option 1: Using the uvicorn 
uvicorn backend.main:app --reload 

# Option 2: Using Poetry
poetry run python -m backend 

# Option 3: Using Python directly
python -m backend

```

The backend will start on `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Environment Configuration

Create a `.env.local` file in the `frontend` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Configuration (if using authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=dummy-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCD123456
```

#### Start the Frontend Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Keys Setup

### Google Gemini API Key (Required)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Replace `AIzaSyDummyKeyReplace_With_Your_Actual_Key_123456` in your `.env` file

### Astra DB (for vector storage)

1. Sign up at [DataStax Astra](https://astra.datastax.com/)
2. Create a new database
3. Generate an application token
4. Replace the dummy values in your `.env` file

### Supabase (for Doc-file storage)

1. Sign up at [Supabase](https://supabase.com/)
2. Create a new project
3. Get your project URL and service role key
4. Replace the dummy values in your `.env` file

## Docker Setup (Alternative)

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

Once the backend is running, you can access:

- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/monitoring/health`
- **Legal AI Endpoints**: `http://localhost:8000/api/legal-ai/`

## Troubleshooting

### Common Issues

1. **"Legal service initialization error"**
   - Ensure your `GEMINI_API_KEY` is set correctly
   - Check that the API key is valid and has the necessary permissions

2. **"Port already in use"**
   - Backend: Change the port in `backend/settings.py`
   - Frontend: Use `npm run dev -- -p 3001` to use a different port

3. **Module not found errors**
   - Backend: Ensure you're in the backend directory and using `poetry run`
   - Frontend: Run `npm install` to ensure all dependencies are installed


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository.