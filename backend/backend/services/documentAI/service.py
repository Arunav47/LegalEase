import os
from google.cloud import documentai
from dotenv import load_dotenv

# Load env vars
load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID")
LOCATION = os.getenv("LOCATION")
PROCESSOR_ID = os.getenv("PROCESSOR_ID")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Configure credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS


def process_pdf_file(pdf_bytes: bytes) -> dict:
    """Process PDF with Document AI and return extracted text + metadata."""
    client = documentai.DocumentProcessorServiceClient()
    processor_name = f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{PROCESSOR_ID}"

    raw_document = {"content": pdf_bytes, "mime_type": "application/pdf"}
    request = {"name": processor_name, "raw_document": raw_document}

    result = client.process_document(request=request)
    doc = result.document

    extracted_text = doc.text or ""

    return {
        "full_text": extracted_text,         # ✅ changed key
        "text_length": len(extracted_text),
        "preview": extracted_text[:500],
    }
