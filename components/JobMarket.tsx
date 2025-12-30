
import React, { useState } from 'react';
import { searchJobMarket } from '../services/geminiService';
import { JobMarketTrend } from '../types';

const JobMarket: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobMarketTrend | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await searchJobMarket(query);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-magnifying-glass text-indigo-500"></i>
          Market Explorer
        </h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search roles, locations, or companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button 
            onClick={handleSearch}
            disabled={loading || !query}
            className="px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:bg-slate-300 shadow-lg shadow-indigo-100"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Search'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-4 flex items-center gap-2">
          <i className="fa-solid fa-earth-americas"></i>
          Powered by Google Search Grounding for real-time accuracy.
        </p>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Market Insights: {result.title}</h4>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {result.summary}
            </div>
          </div>

          {result.sources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.sources.map((src, i) => (
                <a 
                  key={i} 
                  href={src.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-link text-sm"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm line-clamp-1">{src.title}</h5>
                    <p className="text-xs text-slate-400 mt-1 truncate">{src.uri}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobMarket;
