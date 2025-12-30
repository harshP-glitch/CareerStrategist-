
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Chat from './components/Chat';
import SkillChart from './components/SkillChart';
import CareerRoadmap from './components/CareerRoadmap';
import JobMarket from './components/JobMarket';
import Autopilot from './components/Autopilot';
import Profile from './components/Profile';
import { View, ResumeReport } from './types';
import { loadProfile, saveProfile, UserProfile } from './services/storageService';
import { fetchProfileFromCloud, syncProfileToCloud } from './services/cloudService';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  targetRole: 'Senior Product Designer',
  location: 'San Francisco, CA',
  bio: 'Passionate designer with 6+ years of experience in fintech and SaaS. Expert in user-centric design systems and cross-functional leadership.',
  skills: 'Figma, React, TypeScript, User Research, Design Systems',
  hasResume: true,
  resumeName: 'Resume_v2_final.pdf'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSyncing, setIsSyncing] = useState(true);
  
  // Shared state for automatic resume processing
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeReport | null>(null);
  const [lastResumeText, setLastResumeText] = useState<string>('');
  
  // Initialize from storage or default
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return loadProfile() || DEFAULT_PROFILE;
  });

  // Fetch Cloud data on mount
  useEffect(() => {
    const initCloudData = async () => {
      setIsSyncing(true);
      const cloudData = await fetchProfileFromCloud();
      if (cloudData) {
        setUserProfile(cloudData);
      }
      setIsSyncing(false);
    };
    initCloudData();
  }, []);

  // Auto-save whenever profile changes (Local + Cloud Sync)
  useEffect(() => {
    saveProfile(userProfile);
    const timer = setTimeout(() => {
      syncProfileToCloud(userProfile);
    }, 2000);
    return () => clearTimeout(timer);
  }, [userProfile]);

  const handleResumeProcessed = (text: string, profileUpdate: Partial<UserProfile>, analysis: ResumeReport) => {
    // 1. Update Profile info
    setUserProfile(prev => ({ ...prev, ...profileUpdate, hasResume: true }));
    // 2. Store Analysis for the Analyzer tab
    setLastResumeText(text);
    setActiveAnalysis(analysis);
  };

  const renderView = () => {
    if (isSyncing) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
          <i className="fa-solid fa-cloud-arrow-down text-4xl animate-bounce"></i>
          <p className="font-bold tracking-widest uppercase text-xs">Syncing with Cloud Vault...</p>
        </div>
      );
    }

    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard profile={userProfile} />;
      case View.RESUME_ANALYSIS:
        return <ResumeAnalyzer 
          profile={userProfile} 
          preloadedAnalysis={activeAnalysis} 
          preloadedText={lastResumeText} 
        />;
      case View.CAREER_COACH:
        return <Chat />;
      case View.SKILLS_INSIGHTS:
        return <SkillChart profile={userProfile} />;
      case View.ROADMAP:
        return <CareerRoadmap />;
      case View.JOB_SEARCH:
        return <JobMarket />;
      case View.AUTOPILOT:
        return <Autopilot />;
      case View.PROFILE:
        return <Profile 
          profile={userProfile} 
          setProfile={setUserProfile} 
          onAutoFill={handleResumeProcessed}
        />;
      default:
        return <Dashboard profile={userProfile} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderView()}
      </div>
    </Layout>
  );
};

export default App;
