
import React, { useState, useRef } from 'react';
import { syncLinkedInProfile, parseResumeToProfile, analyzeResume } from '../services/geminiService';
import { UserProfile } from '../services/storageService';
import { ResumeReport } from '../types';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (profile: any) => void;
  onAutoFill: (text: string, update: Partial<UserProfile>, report: ResumeReport) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, setProfile, onAutoFill }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [saved, setSaved] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncPreviewData, setSyncPreviewData] = useState<any>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResumeClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Sanitizes text to remove non-printable characters often found in raw PDF/DOCX reads
   */
  const cleanText = (text: string) => {
    return text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setLowConfidence(false);
    
    try {
      const text = await file.text();
      const sanitizedText = cleanText(text);
      
      // If we got almost nothing, the browser's file.text() failed for this format
      if (sanitizedText.length < 50) {
        throw new Error("Text extraction failed. Format might be incompatible for direct browser reading.");
      }

      // Parallel AI processing for speed
      const [extractedData, report] = await Promise.all([
        parseResumeToProfile(sanitizedText),
        analyzeResume(sanitizedText, profile.targetRole)
      ]);
      
      // Check confidence
      if (extractedData.confidenceScore < 60) {
        setLowConfidence(true);
      }

      const profileUpdate = {
        name: extractedData.name !== "Unknown" ? extractedData.name : profile.name,
        targetRole: extractedData.targetRole !== "Role Not Identified" ? extractedData.targetRole : profile.targetRole,
        bio: extractedData.bio || profile.bio,
        skills: extractedData.skills || profile.skills,
        resumeName: file.name
      };

      // Push to central App state
      onAutoFill(sanitizedText, profileUpdate, report);
      
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      console.error("Auto-extraction pipeline failed:", err);
      setSyncError("Format Error: Browser could not read text from this file. Try a .txt file for maximum accuracy.");
      setTimeout(() => setSyncError(null), 5000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLinkedInSync = async () => {
    if (!linkedInUrl) return;
    setIsSyncing(true);
    setSyncError(null);
    setSyncPreviewData(null);
    try {
      const result = await syncLinkedInProfile(linkedInUrl, locationHint);
      if (!result.matchConfirmed) {
        setSyncError("Identity Mismatch: Information found does not match your criteria.");
      } else {
        setSyncPreviewData(result);
      }
    } catch (err: any) {
      setSyncError("Search grounding failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const applySyncData = () => {
    if (syncPreviewData) {
      setProfile({
        ...profile,
        name: syncPreviewData.name !== "Information not public" ? syncPreviewData.name : profile.name,
        targetRole: syncPreviewData.targetRole || syncPreviewData.headline || profile.targetRole,
        bio: syncPreviewData.bio !== "Information not public" ? syncPreviewData.bio : profile.bio,
        skills: syncPreviewData.skills !== "Information not public" ? syncPreviewData.skills : profile.skills
      });
      setSyncSuccess(true);
      setTimeout(() => {
        setShowLinkedInModal(false);
        setSyncSuccess(false);
        setSyncPreviewData(null);
        setLinkedInUrl('');
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.pdf,.doc,.docx" />

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        {isUploading && (
          <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[3px] z-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl border border-blue-100 flex flex-col items-center gap-4 text-center">
              <i className="fa-solid fa-wand-magic-sparkles text-blue-600 text-3xl animate-pulse"></i>
              <div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Strict Analysis Mode</p>
                <p className="text-xs text-slate-500 mt-1">Cross-referencing text chunks... No guessing allowed.</p>
              </div>
            </div>
          </div>
        )}

        <div className="relative pt-16 flex flex-col md:flex-row items-end gap-6 mb-10 px-4">
          <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl border border-white/20">
            <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-5xl">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
          <div className="flex-1 pb-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{profile.name}</h3>
            <p className="text-slate-500 font-medium">{profile.targetRole}</p>
          </div>
          <button onClick={handleSave} className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {saved ? <><i className="fa-solid fa-check"></i> Saved</> : <><i className="fa-solid fa-floppy-disk"></i> Save Profile</>}
          </button>
        </div>

        {lowConfidence && (
          <div className="mx-4 mb-6 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700 text-xs font-medium animate-in slide-in-from-top-2">
            <i className="fa-solid fa-circle-exclamation text-amber-500 text-base"></i>
            <span>AI had difficulty reading that file. Some fields might be incomplete to avoid incorrect data entry.</span>
          </div>
        )}

        {syncError && (
          <div className="mx-4 mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-xs font-medium animate-in slide-in-from-top-2">
            <i className="fa-solid fa-triangle-exclamation text-red-500 text-base"></i>
            <span>{syncError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Mission (Role)</label>
              <input type="text" value={profile.targetRole} onChange={e => setProfile({...profile, targetRole: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
              <textarea rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Skill Matrix</label>
              <input type="text" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={handleResumeClick} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-300 transition-all text-left w-full disabled:opacity-50" disabled={isUploading}>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            {isUploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-arrow-up"></i>}
          </div>
          <div><h4 className="font-bold text-slate-800 text-sm">Strict Resume Sync</h4><p className="text-xs text-slate-500 truncate max-w-[120px]">{profile.resumeName || 'Evidence-only sync'}</p></div>
        </button>

        <button onClick={() => setShowLinkedInModal(true)} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-300 transition-all text-left w-full">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><i className="fa-brands fa-linkedin"></i></div>
          <div><h4 className="font-bold text-slate-800 text-sm">LinkedIn Sync</h4><p className="text-xs text-slate-500">Identity Alignment</p></div>
        </button>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 bg-white text-slate-400 rounded-2xl flex items-center justify-center"><i className="fa-solid fa-shield-halved"></i></div>
          <div><h4 className="font-bold text-slate-400 text-sm">Privacy Vault</h4><p className="text-[10px] text-slate-400 uppercase tracking-tighter">Encrypted by Default</p></div>
        </div>
      </div>

      {showLinkedInModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{syncPreviewData ? 'Verify Profile' : 'Accurate Identity Sync'}</h3>
                <p className="text-sm text-slate-500">Using Gemini 3 Grounding Technology.</p>
              </div>
              <button onClick={() => { setShowLinkedInModal(false); setSyncPreviewData(null); setSyncError(null); }} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-times text-slate-400"></i>
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {!syncPreviewData && !isSyncing && (
                <div className="space-y-6">
                  {syncError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium">
                      {syncError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LinkedIn Profile URL</label>
                      <input type="text" placeholder="https://linkedin.com/in/username" value={linkedInUrl} onChange={(e) => setLinkedInUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Context (City/Company)</label>
                      <input type="text" placeholder="e.g. London, Microsoft" value={locationHint} onChange={(e) => setLocationHint(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" />
                    </div>
                  </div>
                </div>
              )}

              {isSyncing && (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin mx-auto"></div>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Grounding with Pro Engine...</p>
                </div>
              )}

              {syncPreviewData && !syncSuccess && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-[10px] font-black text-indigo-700 uppercase mb-3">Verified Sources</p>
                    <div className="space-y-2">
                      {syncPreviewData.sources.map((src: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-indigo-600 bg-white p-2 rounded border border-indigo-100">
                          <i className="fa-solid fa-link shrink-0"></i>
                          {src.title}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{syncPreviewData.name} — {syncPreviewData.targetRole || syncPreviewData.headline}</p>
                    <p className="text-xs text-slate-600 italic mt-2 leading-relaxed">{syncPreviewData.bio}</p>
                  </div>
                </div>
              )}

              {syncSuccess && (
                <div className="py-12 text-center text-green-600 space-y-3">
                  <i className="fa-solid fa-circle-check text-6xl"></i>
                  <p className="text-xl font-black tracking-tight">Identity Aligned!</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 flex gap-4 shrink-0">
              {!syncPreviewData ? (
                <>
                  <button onClick={() => setShowLinkedInModal(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
                  <button onClick={handleLinkedInSync} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold">Sync Profile</button>
                </>
              ) : !syncSuccess && (
                <>
                  <button onClick={() => setSyncPreviewData(null)} className="flex-1 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-600">Reject</button>
                  <button onClick={applySyncData} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold">Approve Sync</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
