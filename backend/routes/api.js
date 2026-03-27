import express from 'express';
import { upload, analyzeResume, getResult } from '../controllers/resumeController.js';

const router = express.Router();

router.post('/upload', upload.single('resume'), analyzeResume);
router.get('/result/:id', getResult);

export default router;
