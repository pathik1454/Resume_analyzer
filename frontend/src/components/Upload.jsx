import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UploadCloud, File, Loader } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please upload a file first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/result/${response.data.data._id}`);
    } catch (err) {
      const errorData = err.response?.data?.error;
      const errorMessage = typeof errorData === 'object' ? errorData.message : errorData;
      setError(errorMessage || 'Something went wrong during upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Analyze Your Resume</h2>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center">
            <File className="w-12 h-12 text-blue-500 mb-4" />
            <p className="text-lg font-medium text-gray-700">{file.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <UploadCloud className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg">Drag & drop your resume (PDF/DOCX) here</p>
            <p className="text-sm mt-2">or click to select file</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Job Description (Optional but recommended for matching)
        </label>
        <textarea
          rows={6}
          className="w-full border-gray-300 border rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Paste job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}

      <div className="mt-8 text-center">
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-3 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            'Analyze Resume'
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;
