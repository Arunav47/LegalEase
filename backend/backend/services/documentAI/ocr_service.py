import io
import fitz  # PyMuPDF
import pytesseract
from PIL import Image

def process_pdf_file(pdf_bytes: bytes) -> dict:
    """Process PDF with PyMuPDF + fallback OCR for scanned PDFs."""

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    all_text = []

    for page in doc:
        text = page.get_text("text")  # extract embedded text if available
        if not text.strip():
            # Fallback → render page as image + OCR
            pix = page.get_pixmap()
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            text = pytesseract.image_to_string(img)
        all_text.append(text)

    extracted_text = "\n".join(all_text)

    return {
        "full_text": extracted_text,
        "text_length": len(extracted_text),
        "preview": extracted_text[:500],
    }


def process_image_file(image_bytes: bytes) -> dict:
    """Process image with Tesseract OCR and return extracted text + metadata."""
    image = Image.open(io.BytesIO(image_bytes))
    extracted_text = pytesseract.image_to_string(image)

    return {
        "full_text": extracted_text,
        "text_length": len(extracted_text),
        "preview": extracted_text[:500],
    }
