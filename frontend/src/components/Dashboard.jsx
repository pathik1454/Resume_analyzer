import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await api.get(`/result/${id}`);
        setData(response.data);
      } catch (err) {
        console.error("Error fetching result", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-xl font-medium">Loading Results...</div>;
  if (!data) return <div className="text-center mt-20 text-red-500">Result not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500 mb-2">ATS Score</h3>
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-gray-100">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-blue-500 opacity-75" style={{ clipPath: `inset(0 ${100 - (data.atsScore || 0)}% 0 0)`}}></div>
            <span className="text-4xl font-bold text-gray-800">{data.atsScore || 0}</span>
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">Score evaluated based on formatting, skills, and match.</p>
        </div>

        {/* Job Match Score */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
          <TrendingUp className="w-10 h-10 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Job Match</h3>
          <span className="text-4xl font-bold text-gray-800">{data.jobMatchScore || 0}%</span>
          <p className="mt-4 text-sm text-gray-500 text-center">Relevance to target job description.</p>
        </div>

        {/* Summary Info */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-center">
          <p className="text-sm text-gray-500 mb-1">File Name</p>
          <p className="font-medium text-gray-800 mb-4 truncate">{data.originalFilename}</p>
          
          <p className="text-sm text-gray-500 mb-1">Upload Date</p>
          <p className="font-medium text-gray-800">{new Date(data.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Detected Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skills && data.skills.length > 0 ? (
              data.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No specific tech skills detected.</p>
            )}
          </div>

          {data.missingSkills && data.missingSkills.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                Missing Job Description Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Improvement Suggestions</h3>
          <ul className="space-y-4">
            {data.suggestions && data.suggestions.length > 0 ? (
              data.suggestions.map((sug, i) => (
                <li key={i} className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <span className="text-blue-600 font-bold text-xs">{i + 1}</span>
                  </div>
                  <p className="ml-3 text-gray-700 leading-relaxed">{sug}</p>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No suggestions available.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
