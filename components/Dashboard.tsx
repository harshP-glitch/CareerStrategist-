
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  profile: {
    name: string;
    targetRole: string;
    bio: string;
    skills: string;
    hasResume: boolean;
  };
}

const data = [
  { name: 'Mon', value: 4 },
  { name: 'Tue', value: 3 },
  { name: 'Wed', value: 7 },
  { name: 'Thu', value: 5 },
  { name: 'Fri', value: 8 },
  { name: 'Sat', value: 6 },
  { name: 'Sun', value: 4 },
];

const salaryData = [
  { year: '2020', sal: 65 },
  { year: '2021', sal: 72 },
  { year: '2022', sal: 85 },
  { year: '2023', sal: 98 },
  { year: '2024', sal: 115 },
];

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  // Calculate dynamic profile strength
  const strength = useMemo(() => {
    let score = 0;
    if (profile.name && profile.name !== 'Alex Johnson') score += 20; // Changed from default
    else if (profile.name) score += 10;
    
    if (profile.bio && profile.bio.length > 50) score += 30;
    else if (profile.bio) score += 15;
    
    if (profile.skills && profile.skills.split(',').length > 3) score += 30;
    else if (profile.skills) score += 15;
    
    if (profile.hasResume) score += 20;
    
    return Math.min(score, 100);
  }, [profile]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Profile Strength</h3>
            <span className={`px-2 py-1 text-xs font-bold rounded-md ${
              strength > 70 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {strength}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                strength > 70 ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${strength}%` }}
            ></div>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {strength === 100 
              ? "Perfect! Your profile is fully optimized for AI scouting." 
              : `Increase your score by ${100 - strength}% to improve matching accuracy.`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Weekly Applications</h3>
            <i className="fa-solid fa-paper-plane text-blue-500"></i>
          </div>
          <p className="text-3xl font-bold text-slate-800">24</p>
          <p className="text-sm text-slate-600 mt-1"><span className="text-blue-500 font-medium">+12%</span> from last week</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Interview Rate</h3>
            <i className="fa-solid fa-users text-purple-500"></i>
          </div>
          <p className="text-3xl font-bold text-slate-800">18.5%</p>
          <p className="text-sm text-slate-600 mt-1"><span className="text-green-500 font-medium">+2.1%</span> improvement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Market Visibility</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Salary Potential Trend ($k)</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salaryData}>
                <defs>
                  <linearGradient id="colorSal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="sal" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recommended Actions</h3>
        <div className="space-y-4">
          {[
            { 
              icon: 'fa-file-signature', 
              title: `Update Resume for ${profile.targetRole}`, 
              desc: `Your current resume matches 65% of trending ${profile.targetRole} roles.`, 
              color: 'blue' 
            },
            { 
              icon: 'fa-brain', 
              title: 'Upskill in System Design', 
              desc: 'System design is a high-demand skill missing from your profile.', 
              color: 'purple' 
            },
            { 
              icon: 'fa-handshake', 
              title: 'Network with 5 Alumni', 
              desc: 'Connect with former colleagues now at Tier-1 tech companies.', 
              color: 'green' 
            },
          ].map((action, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group hover:border-slate-200">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                action.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                action.color === 'purple' ? 'bg-purple-50 text-purple-600' : 
                'bg-green-50 text-green-600'
              }`}>
                <i className={`fa-solid ${action.icon}`}></i>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                <p className="text-sm text-slate-500">{action.desc}</p>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-300 self-center group-hover:translate-x-1 transition-transform"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
