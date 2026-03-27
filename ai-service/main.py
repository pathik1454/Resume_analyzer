from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.parser import extract_text_from_url
from services.analyzer import analyze_resume
import uvicorn

app = FastAPI(title="AI Resume Analyzer API")

class AnalyzeRequest(BaseModel):
    file_url: str
    job_description: str = ""

@app.post("/analyze")
async def analyze_endpoint(request: AnalyzeRequest):
    try:
        # 1. Extract text from the PDF/DOCX URL
        text = extract_text_from_url(request.file_url)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document")

        # 2. Analyze text against job description
        analysis_result = analyze_resume(text, request.job_description)
        
        # Merge text snippet into result
        analysis_result["extracted_text"] = text[:500] + "..." # only send a snippet back
        
        return analysis_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
