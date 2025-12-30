
import React, { useState } from 'react';
import { getCareerRoadmap } from '../services/geminiService';
import { CareerPathNode } from '../types';

const CareerRoadmap: React.FC = () => {
  const [current, setCurrent] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerPathNode[] | null>(null);

  const handleGenerate = async () => {
    if (!current || !goal) return;
    setLoading(true);
    try {
      const data = await getCareerRoadmap(current, goal);
      setRoadmap(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-route text-blue-500"></i>
          Roadmap Generator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Role</label>
            <input 
              type="text" 
              placeholder="e.g. Junior Developer"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Career Goal</label>
            <input 
              type="text" 
              placeholder="e.g. CTO"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !current || !goal}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
        >
          {loading ? 'Plotting Career Trajectory...' : 'Generate Roadmap'}
        </button>
      </div>

      {roadmap && (
        <div className="relative space-y-12 before:content-[''] before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {roadmap.map((step, i) => (
            <div key={i} className="relative pl-20 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="absolute left-0 top-0 w-16 h-16 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center text-blue-600 z-10 shadow-sm">
                <span className="text-lg font-black">{i + 1}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">{step.role}</h4>
                    <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg font-bold text-xs">
                      {step.salaryRange}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400">DIFF:</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <div key={idx} className={`w-3 h-1.5 rounded-full ${idx < Math.ceil(step.difficulty/2) ? 'bg-amber-400' : 'bg-slate-100'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {step.keySkills.map((skill, j) => (
                    <span key={j} className="text-[10px] px-2 py-1 bg-slate-50 text-slate-600 rounded-md border border-slate-100 uppercase tracking-wider font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
