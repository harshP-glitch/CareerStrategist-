
import React, { useState, useEffect } from 'react';
import { analyzeResume } from '../services/geminiService';
import { ResumeReport } from '../types';
import { UserProfile } from '../services/storageService';

interface ResumeAnalyzerProps {
  profile: UserProfile;
  preloadedAnalysis?: ResumeReport | null;
  preloadedText?: string;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ profile, preloadedAnalysis, preloadedText }) => {
  const [text, setText] = useState(preloadedText || '');
  const [role, setRole] = useState(profile.targetRole);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ResumeReport | null>(preloadedAnalysis || null);

  // Sync state if preloaded data changes (e.g. after a fresh upload in Profile)
  useEffect(() => {
    if (preloadedAnalysis) setReport(preloadedAnalysis);
    if (preloadedText) setText(preloadedText);
  }, [preloadedAnalysis, preloadedText]);

  useEffect(() => {
    if (!role) setRole(profile.targetRole);
  }, [profile.targetRole]);

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const result = await analyzeResume(text, role);
      setReport(result);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!report ? (
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Smart Resume Analysis</h2>
            <p className="text-slate-500 mt-2">Paste your resume content or upload it in the Profile tab for auto-analysis.</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Job Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Resume Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Paste the text from your resume here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !text}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i> Analyzing...
                </span>
              ) : 'Analyze Resume'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setReport(null)}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium"
            >
              <i className="fa-solid fa-arrow-left"></i> Re-analyze
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              AI Generated Analysis
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 58} 
                  strokeDashoffset={2 * Math.PI * 58 * (1 - report.overallScore / 100)} 
                  className="text-blue-500 transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-3xl font-bold text-slate-800">{report.overallScore}</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-800">Match Accuracy</h3>
              <p className="text-slate-500 mt-1">Benchmarked against high-performing {role || 'roles'} in your current market.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i> High Points
              </h4>
              <ul className="space-y-3">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-amber-600 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i> Growth Areas
              </h4>
              <ul className="space-y-3">
                {report.improvements.map((im, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                    {im}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-6">Recognized Skills</h4>
            <div className="flex flex-wrap gap-2">
              {report.skillsFound.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
