import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import subprocess
import sys

# Load spacy model dynamically if not present
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

COMMON_SKILLS = {"javascript", "python", "react", "node", "aws", "docker", "kubernetes", 
                 "java", "c++", "sql", "mongodb", "express", "api", "machine learning",
                 "html", "css", "git", "linux", "cloud", "agile", "nlp", "fastapi"}

def extract_skills(text: str):
    doc = nlp(text.lower())
    found_skills = set()
    
    for token in doc:
        if token.text in COMMON_SKILLS:
            found_skills.add(token.text)
            
    for chunk in doc.noun_chunks:
        if chunk.text in COMMON_SKILLS:
            found_skills.add(chunk.text)
            
    return list(found_skills)

def calculate_job_match(resume_text: str, jd_text: str):
    if not jd_text.strip():
        return 0.0
        
    documents = [resume_text.lower(), jd_text.lower()]
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return round(cos_sim * 100, 2)

def analyze_resume(text: str, jd_text: str = ""):
    skills = extract_skills(text)
    jd_skills = extract_skills(jd_text) if jd_text else []
    
    missing_skills = [s for s in jd_skills if s not in skills]
    job_match = calculate_job_match(text, jd_text)
    
    # ATS Score heuristics
    ats_score = 50
    ats_score += min(len(skills) * 2, 20) 
    if len(text.split()) > 200:
        ats_score += 10 
    ats_score += min(job_match * 0.2, 20) 
    
    ats_score = min(max(int(ats_score), 0), 100) 
    
    suggestions = []
    if len(skills) < 5:
        suggestions.append("Consider adding more explicit technical skills to your resume.")
    if len(text.split()) < 200:
        suggestions.append("Your resume is a bit short. Add more details about your responsibilities.")
    if missing_skills:
        suggestions.append(f"You are missing key skills from the job description: {', '.join(missing_skills)}")
    if not missing_skills and jd_text:
        suggestions.append("Great job! Your skills align well with the job description.")
        
    return {
        "ats_score": ats_score,
        "skills": [s.title() for s in skills],
        "missing_skills": [s.title() for s in missing_skills],
        "job_match": job_match,
        "suggestions": suggestions
    }
