import os
from google.cloud import documentai
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID")
LOCATION = os.getenv("LOCATION")
PROCESSOR_ID = os.getenv("PROCESSOR_ID")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

def process_pdf(file_path):
    client = documentai.DocumentProcessorServiceClient()
    processor_name = f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{PROCESSOR_ID}"

    with open(file_path, "rb") as f:
        pdf_bytes = f.read()

    raw_document = {"content": pdf_bytes, "mime_type": "application/pdf"}
    request = {"name": processor_name, "raw_document": raw_document}

    result = client.process_document(request=request)
    doc = result.document

    print("=== Extracted Text Preview ===")
    print(doc.text[:1000])  # print first 1000 characters
    print("\nTotal text length:", len(doc.text))

if __name__ == "__main__":
    # Change this path to your sample PDF
    process_pdf(r"C:\Users\suraj gupta\Desktop\sample.pdf")
