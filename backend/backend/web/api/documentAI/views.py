import os
import traceback
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from backend.services.documentAI.ocr_service import process_pdf_file, process_image_file
import vertexai
from vertexai.generative_models import GenerativeModel

# Load environment variables
load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID")
LOCATION = os.getenv("LOCATION")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Ensure credentials are set
if GOOGLE_APPLICATION_CREDENTIALS:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

# Initialize Vertex AI (Gemini)
vertexai.init(project=PROJECT_ID, location=LOCATION)
gemini_model = GenerativeModel("gemini-2.5-pro")

router = APIRouter()


@router.post("/process-pdf/")
async def process_pdf(file: UploadFile = File(...)):
    """Upload a PDF → Extract text using Tesseract → Summarize with Gemini."""
    try:
        pdf_bytes = await file.read()
        result = process_pdf_file(pdf_bytes)
        extracted_text = result["full_text"]

        # Call Gemini to summarize
        summary_response = gemini_model.generate_content(
            f"Summarize the following text in simple language:\n\n{extracted_text}"
        )

        return {
            "filename": file.filename,
            "text_preview": result["preview"],
            "text_length": result["text_length"],
            "summary": summary_response.text,
        }

    except Exception as e:
        print("🔥 Error in process_pdf:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    """Upload an image → Extract text using Tesseract → Summarize with Gemini."""
    try:
        image_bytes = await file.read()
        result = process_image_file(image_bytes)
        extracted_text = result["full_text"]

        # Call Gemini to summarize
        summary_response = gemini_model.generate_content(
            f"Summarize the following text in simple language:\n\n{extracted_text}"
        )

        return {
            "filename": file.filename,
            "text_preview": result["preview"],
            "text_length": result["text_length"],
            "summary": summary_response.text,
        }

    except Exception as e:
        print("🔥 Error in process_image:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
