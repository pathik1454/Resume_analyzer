import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRoutes from './routes/api.js';
import fs from 'fs';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads dir exists for fallback
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

// Connect DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resume-analyzer')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  }).catch(err => {
    console.error('Database connection failed', err);
  });
