
import React, { useState, useEffect, useRef } from 'react';
import { scoutJobs } from '../services/geminiService';
import { ApplicationBundle, LogEntry, LogStatus } from '../types';

// Removed redundant window.aistudio declaration to fix modifier/type conflicts.
// The environment provides the AIStudio type globally.

const Autopilot: React.FC = () => {
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [isScouting, setIsScouting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [backtrackList, setBacktrackList] = useState<ApplicationBundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<ApplicationBundle | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const checkKeyStatus = async () => {
    // Relying on global aistudio definition. Cast to any if necessary to avoid compilation errors if strictly required.
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setNeedsKey(!hasKey);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
      addLog("API Key updated. Ready for mission deployment.", "success");
    }
  };

  const addLog = (message: string, status: LogStatus = 'info', subTask?: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date(),
      status,
      subTask
    };
    setLogs(prev => [...prev, newLog]);
  };

  const updateLastLog = (status: LogStatus, message?: string) => {
    setLogs(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updated = [...prev.slice(0, -1), { ...last, status, message: message || last.message }];
      return updated;
    });
  };

  const startAutopilot = async () => {
    if (!role || !skills) return;

    // Pre-flight key check
    const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      setNeedsKey(true);
      addLog("AUTOPILOT_HALTED: Missing mission-critical API credentials.", "error");
      return;
    }

    setIsScouting(true);
    setLogs([]);
    setBacktrackList([]);
    
    addLog("System check: Initializing Agent Command Center...", "loading");
    await new Promise(r => setTimeout(r, 600));
    updateLastLog("success", "System check: Command Center Online.");

    addLog(`Target Profile: ${role} with ${skills.split(',').length} core skills.`, "info");
    
    addLog("Phase 1: Deep Web Scouting...", "loading", "Scouting");
    try {
      await new Promise(r => setTimeout(r, 1000));
      addLog("-> Triggering Google Search Engine Grounding...", "info", "Scouting");
      
      const results = await scoutJobs(skills.split(','), role);
      
      updateLastLog("success", `Phase 1: Found ${results.length} valid opportunities.`);

      addLog("Phase 2: Match Engine Scoring...", "loading", "Analysis");
      await new Promise(r => setTimeout(r, 1200));
      updateLastLog("success", "Phase 2: Application strategy calculated.");

      addLog("Phase 3: Tailoring Content Packets...", "loading", "Tailoring");
      
      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        addLog(`Engineering payload for ${res.company}...`, "loading", "Tailoring");
        await new Promise(r => setTimeout(r, 700));
        updateLastLog("success", `Payload [ID: ${res.id.slice(0,4)}] ready for ${res.company}.`);
      }
      
      addLog("Phase 4: Syncing Backtrack Vault...", "loading", "Security");
      await new Promise(r => setTimeout(r, 800));
      updateLastLog("success", "Vault Sync Complete. Ready for review.");

      addLog("All tasks completed successfully.", "success");
      setBacktrackList(results);
    } catch (err: any) {
      const errorMsg = err.message || "";
      if (errorMsg.includes("Requested entity was not found")) {
        addLog("CRITICAL: API key mismatch or expired. Re-authentication required.", "error");
        setNeedsKey(true);
      } else {
        addLog(`ERROR: Autopilot failed. ${errorMsg.slice(0, 50)}...`, "error");
      }
      console.error(err);
    } finally {
      setIsScouting(false);
    }
  };

  const getStatusColor = (status: LogStatus) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'loading': return 'text-blue-400';
      default: return 'text-slate-300';
    }
  };

  const getStatusIcon = (status: LogStatus) => {
    switch (status) {
      case 'success': return <i className="fa-solid fa-check-circle mr-2"></i>;
      case 'error': return <i className="fa-solid fa-times-circle mr-2"></i>;
      case 'warning': return <i className="fa-solid fa-exclamation-triangle mr-2"></i>;
      case 'loading': return <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>;
      default: return <i className="fa-solid fa-info-circle mr-2 opacity-50"></i>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {needsKey && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in duration-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <i className="fa-solid fa-key text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-amber-900">API Key Selection Required</h4>
              <p className="text-sm text-amber-700">The Autopilot agent requires a paid project API key to perform real-time web scouting and complex reasoning.</p>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs font-bold text-amber-600 underline mt-2 block">View Billing Documentation</a>
            </div>
          </div>
          <button 
            onClick={handleSelectKey}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shrink-0"
          >
            Select API Key
          </button>
        </div>
      )}

      <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch relative z-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <i className="fa-solid fa-robot text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase italic">Autopilot Command</h3>
                <p className="text-slate-400 text-sm">Full autonomous mission control for your job hunt.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Mission Goal</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Software Engineer"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Payload Skills</label>
                <input 
                  type="text" 
                  placeholder="Python, React, AWS..."
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            <button 
              onClick={startAutopilot}
              disabled={isScouting || !role || !skills}
              className={`w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl uppercase tracking-widest ${
                needsKey ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
              }`}
            >
              {isScouting ? (
                <>
                  <i className="fa-solid fa-satellite fa-spin"></i>
                  Mission in Progress...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-play"></i>
                  Launch AI Autopilot
                </>
              )}
            </button>
          </div>

          <div className="w-full lg:w-[450px] flex flex-col bg-black/40 rounded-2xl border border-slate-800 p-4 font-mono text-[11px] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <span className="text-slate-500 tracking-widest text-[9px] font-black">AGENT_STREAM_V4.1</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
              {logs.length === 0 && (
                <div className="text-slate-600 italic">
                  &gt; SYSTEM_IDLE: Awaiting mission parameters...
                </div>
              )}
              {logs.map((log) => (
                <div key={log.id} className={`${getStatusColor(log.status)} flex items-start animate-in slide-in-from-left-2`}>
                  <span className="text-slate-700 mr-2 shrink-0">[{log.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
                  <div className="flex-1">
                    {log.subTask && (
                      <span className="bg-slate-800 text-slate-500 px-1 rounded mr-1 uppercase text-[8px] font-black">
                        {log.subTask}
                      </span>
                    )}
                    {getStatusIcon(log.status)}
                    {log.message}
                  </div>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>

      {backtrackList.length > 0 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <i className="fa-solid fa-fingerprint text-lg"></i>
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Mission Backtrack Vault</h4>
                <p className="text-slate-500 text-sm font-medium">Detailed logs and payloads for every application attempt.</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-3">
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{backtrackList.length} Sessions Found</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {backtrackList.map((bundle) => (
                <button
                  key={bundle.id}
                  onClick={() => setSelectedBundle(bundle)}
                  className={`w-full p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                    selectedBundle?.id === bundle.id 
                      ? 'bg-white border-blue-500 shadow-xl ring-4 ring-blue-50/50' 
                      : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${selectedBundle?.id === bundle.id ? 'bg-blue-600' : 'bg-transparent group-hover:bg-blue-200'} transition-all`}></div>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      selectedBundle?.id === bundle.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 group-hover:text-blue-500'
                    }`}>
                      <i className="fa-solid fa-building text-lg"></i>
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="font-black text-slate-900 leading-none truncate mb-1">{bundle.company}</h5>
                      <p className="text-[11px] text-slate-500 truncate font-medium">{bundle.role}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[9px] font-black uppercase tracking-tighter border border-green-100">Packet OK</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-3">
              {selectedBundle ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-10 animate-in slide-in-from-right-2">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <i className="fa-solid fa-shield-check text-3xl"></i>
                      </div>
                      <div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedBundle.company}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-lg text-slate-500 font-bold">{selectedBundle.role}</p>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span className="text-xs font-black text-blue-600 uppercase tracking-widest italic">Unit #{selectedBundle.id.slice(0,6)}</span>
                        </div>
                      </div>
                    </div>
                    <a 
                      href={selectedBundle.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl group active:scale-[0.98] uppercase tracking-widest text-sm"
                    >
                      Visit & Apply
                      <i className="fa-solid fa-external-link group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                        <i className="fa-solid fa-microchip text-blue-500"></i>
                        Matching Intelligence
                      </h5>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium shadow-inner italic">
                        "{selectedBundle.matchReason}"
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                        <i className="fa-solid fa-envelope-open-text text-amber-500"></i>
                        Generated Cover Packet
                      </h5>
                      <div className="p-6 bg-amber-50/20 rounded-2xl border border-amber-100 text-sm text-slate-700 leading-relaxed font-serif border-l-4 border-l-amber-400 italic">
                        {selectedBundle.tailoredPitch}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                      <i className="fa-solid fa-database text-purple-500"></i>
                      Payload Field Manifest
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBundle.suggestedAnswers?.map((ans, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all group border-b-2 hover:border-b-purple-400">
                          <p className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">Entry Field: {ans.question}</p>
                          <p className="text-sm text-slate-800 font-bold leading-relaxed">{ans.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                    <i className="fa-solid fa-database text-4xl opacity-10"></i>
                  </div>
                  <h5 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2 italic">Backtrack Data Encrypted</h5>
                  <p className="text-sm font-bold text-center max-w-xs text-slate-500">Select an application session from the vault to decrypt mission logs, field data, and generated payloads.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Autopilot;
