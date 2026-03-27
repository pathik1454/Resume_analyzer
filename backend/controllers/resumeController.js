import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import axios from 'axios';
import Resume from '../models/Resume.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// S3 config
let upload;

if (process.env.AWS_ACCESS_KEY_ID && process.env.S3_BUCKET_NAME) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET_NAME,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname);
      }
    })
  });
} else {
  // Local fallback if no S3 keys
  console.log("No S3 credentials found, using local storage");
  const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  });
  upload = multer({ storage });
}

export { upload };

// Analyze Resume
export const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { jobDescription } = req.body;
    const fileUrl = req.file.location || `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    
    // 1. Create DB entry
    const resumeDoc = new Resume({
      originalFilename: req.file.originalname,
      fileUrl,
      jobDescription
    });
    
    // 2. Send to AI Service
    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/analyze`, {
      file_url: fileUrl,
      job_description: jobDescription || ""
    });

    const aiData = aiResponse.data;

    // 3. Update DB entry
    resumeDoc.atsScore = aiData.ats_score;
    resumeDoc.skills = aiData.skills;
    resumeDoc.missingSkills = aiData.missing_skills;
    resumeDoc.jobMatchScore = aiData.job_match;
    resumeDoc.suggestions = aiData.suggestions;
    resumeDoc.extractedText = aiData.extracted_text;

    await resumeDoc.save();

    res.status(200).json({ message: "Analysis complete", data: resumeDoc });

  } catch (error) {
    console.error("AI Service Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to communicate with AI Service or process resume." });
  }
};

export const getResult = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: "Not found" });
    res.json(resume);
  } catch (error) {
    next(error);
  }
};
