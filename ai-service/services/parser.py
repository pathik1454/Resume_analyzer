import tempfile
import requests
import os
import PyPDF2
import docx
from urllib.parse import urlparse

def extract_text_from_url(file_url: str) -> str:
    # Download file to a temp file
    response = requests.get(file_url)
    if response.status_code != 200:
        raise Exception(f"Failed to download file from {file_url}")
        
    ext = os.path.splitext(urlparse(file_url).path)[1].lower()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
        temp_file.write(response.content)
        temp_path = temp_file.name

    text = ""
    try:
        if ext == '.pdf':
            with open(temp_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        elif ext in ['.docx', '.doc']:
            doc = docx.Document(temp_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            # Fallback assuming plain text
            try:
                with open(temp_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            except:
                raise Exception("Unsupported file format. Please upload PDF or DOCX.")
    finally:
        os.remove(temp_path)

    return text
