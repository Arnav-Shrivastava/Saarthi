import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Activity, ArrowLeft, ArrowRight, Target, 
  FileText, AlertTriangle, ShieldCheck, Terminal,
  Map, BarChart3, Users, ExternalLink, RefreshCcw,
  Search, Info, AlertOctagon, X
} from 'lucide-react';
import Logo from './ui/Logo';
import { cn } from '@/lib/utils';

const GEO_URL = '/india.topo.json';

const STATE_NAMES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export default function AdminDashboard({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);
  const [stateMetrics, setStateMetrics] = useState({});

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://saarthi-production-7b58.up.railway.app';
    fetch(`${API_BASE_URL}/benchmarks`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
        // Simulate Geospatial Mapping of the 100 queries
        if (json && json.detailed_results) {
          const metricsByState = {};
          
          json.detailed_results.forEach((queryObj, idx) => {
            const randomIdx = (idx * 17 + queryObj.query.length) % STATE_NAMES.length;
            const stateName = STATE_NAMES[randomIdx];
            
            if (!metricsByState[stateName]) {
              metricsByState[stateName] = { name: stateName, queries: [], scamCount: 0, schemeCount: 0, complaintCount: 0 };
            }
            
            metricsByState[stateName].queries.push(queryObj);
            if (queryObj.category === 'scam_check') metricsByState[stateName].scamCount++;
            if (queryObj.category === 'scheme_query') metricsByState[stateName].schemeCount++;
            if (queryObj.category === 'complaint_draft') metricsByState[stateName].complaintCount++;
          });
          
          setStateMetrics(metricsByState);
        }
      })
      .catch(err => {
        console.error("Failed to load map data", err);
        setLoading(false);
      });
  }, []);

  const maxScams = useMemo(() => {
    let max = 1;
    Object.values(stateMetrics).forEach(m => {
      if (m.scamCount > max) max = m.scamCount;
    });
    return max;
  }, [stateMetrics]);

  const colorScale = scaleLinear()
    .domain([0, 2, maxScams / 2, maxScams])
    .range(["#F3F3EF", "#FFF4E0", "#FF9F1C", "#EF4444"]); // Surface to Yellow to Saffron to Red

  return (
    <div className="h-screen w-full relative font-sans bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">
      
      {/* Premium Background Layer: Grid & Blow Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-saarthi opacity-60" />
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] glow-indigo opacity-30" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] glow-saffron opacity-20" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] glow-indigo opacity-20" />
      </div>

      {/* Premium Header - Reinforced Glassmorphism */}
      <header className="h-16 shrink-0 border-b border-[var(--border-soft)] bg-[var(--bg-base)]/80 backdrop-blur-xl text-[var(--text-primary)] shadow-[0_2px_15px_-3px_rgba(27,20,100,0.04)] z-50">
        <div className="max-w-screen-2xl mx-auto h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-[var(--bg-surface-hover)] rounded-xl transition-all text-[var(--brand-indigo)] group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[var(--brand-indigo)] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldAlert size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tighter uppercase text-[var(--brand-indigo)]" style={{ fontFamily: 'Syne, sans-serif' }}>
                SAARTHI | <span className="font-medium opacity-60">STATE ADMIN</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-50/50 border border-emerald-100/50">
              <Activity size={14} className="text-emerald-500 animate-[pulse_2s_infinite]" />
              <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">SYSTEM ONLINE</span>
            </div>
            {data && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-[var(--text-tertiary)] tracking-[0.2em] uppercase">
                  TOTAL QUERIES: <span className="text-[var(--brand-indigo)]">{data.total_samples}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] relative z-10 overflow-hidden">
        
        {/* Map Visualization Area */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-[var(--brand-indigo)] rounded-full animate-spin" />
                <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em]">Mapping Intelligence...</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full max-w-none relative flex items-center justify-center p-4"
              >
                {/* Subtle soft glow behind map */}
                <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full" />
                
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    scale: 1020,
                    center: [82.4, 21.5]
                  }}
                  className="w-full h-full relative z-10 drop-shadow-[0_20px_50px_rgba(27,20,100,0.08)]"
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const stateName = geo.properties.name || geo.properties.st_nm || geo.id;
                        const metrics = stateMetrics[stateName];
                        const scanValue = metrics ? metrics.scamCount : 0;
                        const isSelected = selectedState?.name === stateName;
                        const isHighRisk = scanValue > (maxScams * 0.7);
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => setSelectedState(metrics ? metrics : { name: stateName, queries: [], scamCount: 0 })}
                            style={{
                              default: {
                                fill: scanValue > 0 ? colorScale(scanValue) : 'rgba(255,255,255,0.8)',
                                stroke: isHighRisk ? '#EF4444' : isSelected ? 'var(--brand-indigo)' : 'rgba(27, 20, 100, 0.08)',
                                strokeWidth: isHighRisk ? 3 : isSelected ? 2.5 : 0.8,
                                outline: 'none',
                                filter: isHighRisk ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))' : 'none',
                                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
                              },
                              hover: {
                                fill: 'var(--brand-indigo)',
                                stroke: 'var(--brand-indigo)',
                                strokeWidth: 2,
                                outline: 'none',
                                filter: 'none',
                                cursor: 'pointer'
                              }
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {/* Faint Nation Border Layer */}
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) => (
                      <path
                        fill="none"
                        stroke="rgba(0,0,0,0.1)"
                        strokeWidth="1.2"
                        pointerEvents="none"
                        d={geographies.map((geo) => geo.svgPath).join(' ')}
                        className="opacity-40"
                      />
                    )}
                  </Geographies>
                </ComposableMap>
              </motion.div>

              {/* Legend - Updated with Branding Tints */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute bottom-6 left-8 p-4 bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-2xl z-20"
              >
                <h4 className="text-[10px] font-black text-[var(--brand-indigo)] uppercase tracking-[0.2em] mb-4 border-b border-indigo-500/10 pb-2">Scam Activity Heatmap</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Normal Activity', color: '#FFF4E0', description: 'Safe Zone' },
                    { label: 'Elevated Queries', color: '#FF9F1C', description: 'Monitor' },
                    { label: 'High Scam Activity', color: '#EF4444', description: 'Critical' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="h-5 w-5 rounded-lg shadow-sm border border-indigo-500/10" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none mb-1">{item.label}</span>
                        <span className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{item.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Intelligence Side Panel - Warmer, Textured */}
        <AnimatePresence>
          {selectedState && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 35, stiffness: 300 }}
              className="w-full lg:w-[440px] border-l border-[var(--border-soft)] bg-[var(--bg-surface)] relative z-40 shadow-[-20px_0_50px_rgba(27,20,100,0.05)] flex flex-col h-full overflow-hidden"
            >
              {/* Subtle pattern for sidebar */}
              <div className="absolute inset-0 bg-grid-saarthi opacity-[0.03] pointer-events-none" />

              {/* Panel Header */}
              <div className="p-8 pb-5 relative z-10 shrink-0">
                <div className="flex items-center justify-between mb-6 gap-4">
                  <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {selectedState.name}
                  </h2>
                  <button 
                    onClick={() => setSelectedState(null)}
                    className="px-4 py-1.5 rounded-lg border border-[var(--border-soft)] text-[var(--text-tertiary)] hover:border-[var(--brand-indigo)] hover:text-[var(--brand-indigo)] hover:bg-indigo-50/50 transition-all font-bold text-[10px] uppercase tracking-widest group shrink-0 shadow-sm"
                  >
                    CLOSE
                  </button>
                </div>

                {/* State Metrics Cards - Sexy Saarthi Rounds */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-[32px] bg-white border border-white/60 shadow-[0_10px_30px_rgba(27,20,100,0.03)] hover:shadow-lg hover:border-[var(--brand-indigo)] transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-[var(--brand-indigo)] mb-4 shadow-inner transition-transform group-hover:scale-110">
                      <Target size={20} />
                    </div>
                    <div className="text-2xl font-black text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>{selectedState.schemeCount || 0}</div>
                    <div className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mt-1">
                       Sectors
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-[32px] bg-red-50/40 border border-red-100 shadow-[0_10px_30px_rgba(239,68,68,0.03)] hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-red-500/5 blur-3xl rounded-full -translate-x-10 translate-y-10" />
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-100/50 text-red-500 mb-4 shadow-inner transition-transform group-hover:scale-110">
                      <AlertTriangle size={20} className={selectedState.scamCount > 10 ? 'animate-pulse' : ''} />
                    </div>
                    <div className="text-2xl font-black text-red-600" style={{ fontFamily: 'Syne, sans-serif' }}>{selectedState.scamCount || 0}</div>
                    <div className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mt-1">Threats</div>
                  </div>
                </div>
              </div>

              {/* Activity Logs Area - Elegant Contrast */}
              <div className="flex-1 overflow-hidden flex flex-col bg-white/40 backdrop-blur-md rounded-t-[40px] border-t border-white/60 shadow-[0_-10px_30px_rgba(27,20,100,0.02)] relative z-10">
                <div className="px-10 flex items-center gap-3 py-6 border-b border-indigo-500/5 shrink-0">
                  <div className="h-2 w-2 rounded-full bg-[var(--brand-indigo)] animate-pulse" />
                  <span className="text-[11px] font-black text-[var(--brand-indigo)] uppercase tracking-[0.2em]">INTELLIGENCE STREAM</span>
                </div>
                
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-5 pb-16 scrollbar-hide">
                  {selectedState.queries.length > 0 ? (
                    selectedState.queries.map((q, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="p-6 rounded-[28px] border border-indigo-500/5 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${
                            q.category === 'scam_check' ? 'bg-red-500 text-white' : 
                            q.category === 'complaint_draft' ? 'bg-blue-500 text-white' : 
                            'bg-[var(--brand-indigo)] text-white'
                          }`}>
                            {q.category.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-base)] px-2.5 py-1 rounded-lg border border-indigo-500/5 font-mono">
                            {q.latency_ms}ms
                          </span>
                        </div>
                        <p className="text-[15px] font-bold text-[var(--text-primary)] mb-4 leading-relaxed group-hover:text-[var(--brand-indigo)] transition-colors">
                          "{q.query}"
                        </p>
                        <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-indigo-500/5 text-[12px] text-[var(--text-secondary)] leading-relaxed italic opacity-90 group-hover:opacity-100 transition-opacity">
                          {q.output.length > 180 ? q.output.substring(0, 180) + '...' : q.output}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-60 opacity-30">
                      <RefreshCcw size={40} className="mb-4 text-[var(--brand-indigo)] animate-spin-slow" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Node Scanning...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
