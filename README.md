# Cloud-Based Resume Analyzer with AI

A complete end-to-end full-stack project built with React, Node.js, Python (FastAPI), and MongoDB.

## Project Structure
- **/frontend**: React.js (Vite) + Tailwind CSS SPA for users to drop resumes and view ATS scores visually.
- **/backend**: Node.js + Express API. Handles MongoDB interactions, manages S3 uploads (or local fallback), and orchestrates calls to the AI service.
- **/ai-service**: Python + FastAPI microservice. Uses PyPDF2/docx to extract text, spaCy for NER/skill clustering, and scikit-learn for JD matching.

## How to Run Locally

### 1. Prerequisites
- Node.js (v16+)
- Python (3.9+)
- MongoDB (Local or Atlas connection string)

### 2. Setup AI Service (Python)
```bash
cd ai-service
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Start the service
uvicorn main:app --reload --port 8000
```

### 3. Setup Backend (Node.js)
```bash
cd backend
npm install

# Create a .env file based on .env.example
# Ensure MongoDB is running or configure MONGO_URI in .env

# Start server
npm run dev
```

### 4. Setup Frontend (React)
```bash
cd frontend
npm install

# Start Vite server
npm run dev
```

### Accessing the app
Navigate to `http://localhost:3000` in your browser. Upload a resume, optionally provide a JD, and view your ATS matching score and suggestions!
