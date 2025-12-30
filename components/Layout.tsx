
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  currentView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: View.AUTOPILOT, label: 'AI Autopilot', icon: 'fa-rocket' },
    { id: View.RESUME_ANALYSIS, label: 'Resume Analyzer', icon: 'fa-file-lines' },
    { id: View.ROADMAP, label: 'Career Roadmap', icon: 'fa-route' },
    { id: View.SKILLS_INSIGHTS, label: 'Skill Gap', icon: 'fa-graduation-cap' },
    { id: View.JOB_SEARCH, label: 'Job Search', icon: 'fa-magnifying-glass' },
    { id: View.CAREER_COACH, label: 'AI Coach', icon: 'fa-robot' },
    { id: View.PROFILE, label: 'User Profile', icon: 'fa-user-gear' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-compass text-white text-lg"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">CareerStrat</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-4 rounded-2xl text-white">
            <p className="text-xs font-medium opacity-80 mb-1">AGENT ACTIVE</p>
            <p className="text-sm font-bold mb-3">Autopilot is available</p>
            <button 
              onClick={() => onNavigate(View.AUTOPILOT)}
              className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
            >
              Manage Agent
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-700">
              {navItems.find(n => n.id === currentView)?.label}
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Cloud Connected
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <i className="fa-regular fa-bell"></i>
            </button>
            <button 
              onClick={() => onNavigate(View.PROFILE)}
              className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all ${
                currentView === View.PROFILE 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              <i className="fa-solid fa-user text-sm"></i>
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
