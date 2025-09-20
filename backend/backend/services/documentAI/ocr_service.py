from pathlib import Path
from io import BytesIO
import pytesseract
from PIL import Image
import fitz  # PyMuPDF
import os
import vertexai
from vertexai.generative_models import GenerativeModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Tesseract path (adjust if needed)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Vertex AI configuration
PROJECT_ID = os.getenv("PROJECT_ID")
LOCATION = os.getenv("LOCATION", "us-central1")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Initialize Vertex AI
vertexai.init(project=PROJECT_ID, location=LOCATION)

def pdf_to_images(pdf_path: Path, dpi: int = 300):
    """Convert PDF pages to PIL Images."""
    doc = fitz.open(str(pdf_path))
    images = []
    for page in doc:
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img = Image.open(BytesIO(pix.tobytes("png")))
        images.append(img)
    doc.close()
    return images

def extract_text_with_tesseract(pdf_path: Path, dpi: int = 300) -> str:
    """Extract text from PDF using Tesseract OCR."""
    images = pdf_to_images(pdf_path, dpi=dpi)
    
    all_text = ""
    for i, page in enumerate(images):
        try:
            # Use Tesseract to extract text
            page_text = pytesseract.image_to_string(page, lang="eng")
            all_text += f"--- Page {i+1} ---\n{page_text}\n\n"
        except Exception as e:
            print(f"Error processing page {i+1}: {e}")
            all_text += f"--- Page {i+1} ---\nError extracting text from this page.\n\n"
    
    return all_text

def explain_with_vertex_ai(text: str, prompt_type: str = "summarize") -> str:
    """Use Vertex AI to explain/analyze the extracted text."""
    
    # Define different prompt templates
    prompts = {
        "summarize": f"""
        Please provide a clear summary of the following document text:
        
        {text}
        
        Summary:
        """,
        "legal_analysis": f"""
        Analyze the following legal document and provide:
        1. Document type
        2. Key legal points
        3. Important dates or deadlines
        4. Parties involved
        
        Document text:
        {text}
        
        Analysis:
        """,
        "extract_entities": f"""
        Extract key entities from the following text:
        - Names of people
        - Organizations
        - Dates
        - Locations
        - Important numbers/amounts
        
        Text:
        {text}
        
        Entities:
        """
    }
    
    selected_prompt = prompts.get(prompt_type, prompts["summarize"])
    
    try:
        # Use Vertex AI Gemini model
        model = GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(selected_prompt)
        return response.text
    except Exception as e:
        return f"Error generating explanation: {e}"

def process_pdf_with_ocr_and_ai(pdf_path: Path, analysis_type: str = "summarize") -> dict:
    """Complete pipeline: OCR extraction + AI explanation."""
    
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    
    # Step 1: Extract text using Tesseract OCR
    print("Extracting text with Tesseract OCR...")
    extracted_text = extract_text_with_tesseract(pdf_path)
    
    # Step 2: Get AI explanation
    print("Generating AI explanation...")
    ai_explanation = explain_with_vertex_ai(extracted_text, analysis_type)
    
    return {
        "full_text": extracted_text,
        "text_length": len(extracted_text),
        "preview": extracted_text[:500],
        "ai_explanation": ai_explanation,
        "analysis_type": analysis_type
    }

# Example usage
if __name__ == "__main__":
    pdf_path = Path(__file__).with_name("document1.pdf")
    
    try:
        result = process_pdf_with_ocr_and_ai(pdf_path, analysis_type="legal_analysis")
        
        print("=== EXTRACTED TEXT ===")
        print(result["preview"])
        print(f"\n[Total length: {result['text_length']} characters]")
        
        print("\n=== AI EXPLANATION ===")
        print(result["ai_explanation"])
        
    except Exception as e:
        print(f"Error: {e}")
