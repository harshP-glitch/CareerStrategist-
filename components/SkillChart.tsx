
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { getSkillGapAnalysis } from '../services/geminiService';
import { SkillScore } from '../types';
import { UserProfile } from '../services/storageService';

interface SkillChartProps {
  profile: UserProfile;
}

const SkillChart: React.FC<SkillChartProps> = ({ profile }) => {
  const [role, setRole] = useState(profile.targetRole);
  const [skillsStr, setSkillsStr] = useState(profile.skills);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SkillScore[] | null>(null);

  // Update local fields when profile changes (e.g. after sync)
  useEffect(() => {
    setRole(profile.targetRole);
    setSkillsStr(profile.skills);
  }, [profile.targetRole, profile.skills]);

  const handleAnalyze = async () => {
    if (!role || !skillsStr) return;
    setLoading(true);
    try {
      const skills = skillsStr.split(',').map(s => s.trim());
      const result = await getSkillGapAnalysis(skills, role);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Market Skill Gap Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Target Role</label>
            <input 
              type="text" 
              placeholder="e.g. Data Scientist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Skills (comma separated)</label>
            <input 
              type="text" 
              placeholder="Python, SQL, Tableau..."
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={loading || !role || !skillsStr}
          className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors disabled:bg-slate-300"
        >
          {loading ? 'Crunching Data...' : 'Visualize Gap'}
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[450px]">
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                  <Radar name="Your Score" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  <Radar name="Market Requirement" dataKey="market" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 px-2 uppercase text-xs tracking-widest">Targeted Upskilling</h4>
            {data.sort((a, b) => (b.market - b.current) - (a.market - a.current)).slice(0, 4).map((skill, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-700">{skill.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded">
                    -{skill.market - skill.current}% Gap
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                  <div style={{ width: `${skill.current}%` }} className="bg-blue-500 h-full"></div>
                  <div style={{ width: `${skill.market - skill.current}%` }} className="bg-red-200 h-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillChart;
