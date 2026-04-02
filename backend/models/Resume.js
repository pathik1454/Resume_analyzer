import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  originalFilename: { type: String, required: true },
  fileUrl: { type: String, required: true }, // S3 URL or local
  jobDescription: { type: String },
  atsScore: { type: Number },
  skills: [String],
  missingSkills: [String],
  jobMatchScore: { type: Number },
  suggestions: [String],
  extractedText: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resume', resumeSchema);
