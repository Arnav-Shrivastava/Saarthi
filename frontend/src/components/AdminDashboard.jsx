import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity, ArrowLeft, Target, FileText, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';

// Palantir Theme Colors
const COLORS = {
  bg: '#0B0D17',         // Deep space dark
  bgPanel: '#15192B',    // Darker muted blue
  border: '#2A3158',     // Glowing blue stroke
  textPrime: '#E0E7FF',
  textMuted: '#818CF8',
  mapFill: '#1A1F36',
  mapHover: '#4F46E5',   // Brand Indigo glowing
  threatLow: '#2A3158', 
  threatHigh: '#EF4444', // Red glow
};

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
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://saarthi-production-7b58.up.railway.app';
    fetch(`${baseUrl}/benchmarks`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
        // Simulate Geospatial Mapping of the 100 queries
        if (json && json.detailed_results) {
          const metricsByState = {};
          
          json.detailed_results.forEach((queryObj, idx) => {
            // Pseudo-randomly assign a state to demo the heatmap based on index
            // We weigh larger states heavier for realism
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

  // Determine Max Scams for heatmap scaling
  const maxScams = useMemo(() => {
    let max = 1;
    Object.values(stateMetrics).forEach(m => {
      if (m.scamCount > max) max = m.scamCount;
    });
    return max;
  }, [stateMetrics]);

  // D3 Color Scale (Dark Blue to High Threat Red)
  const colorScale = scaleLinear()
    .domain([0, maxScams])
    .range([COLORS.threatLow, COLORS.threatHigh]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans" style={{ backgroundColor: COLORS.bg, color: COLORS.textPrime }}>
      
      {/* Top Navbar / Header */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 z-20 border-b" style={{ borderColor: COLORS.border, backgroundColor: 'rgba(11, 13, 23, 0.8)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} color={COLORS.textPrime} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert size={22} className="text-red-500 animate-pulse" />
            <h1 className="text-xl font-bold tracking-wider uppercase" style={{ letterSpacing: '0.1em' }}>Foundry | Homeland Security</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-mono">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-green-400" />
            <span className="text-green-400">SYS_ONLINE</span>
          </div>
          {data && <span>NODES: {data.total_samples}</span>}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex h-screen pt-16">
        
        {/* Map Area */}
        <div className="flex-1 relative flex items-center justify-center p-8">
          {loading ? (
             <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 border-4 border-t-indigo-500 border-indigo-500/20 rounded-full animate-spin"></div>
               <p className="font-mono text-indigo-400 animate-pulse">ESTABLISHING UPLINK...</p>
             </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="w-full h-full max-w-4xl max-h-[800px] mt-10">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 1100,
                  center: [82.8, 22.5] // Center of India
                }}
                className="w-full h-full drop-shadow-2xl"
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      // Topojson usually places name in properties.name or properties.st_nm
                      const stateName = geo.properties.name || geo.properties.st_nm || geo.id;
                      const metrics = stateMetrics[stateName];
                      const scanValue = metrics ? metrics.scamCount : 0;
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => setSelectedState(metrics ? metrics : { name: stateName, queries: [], scamCount: 0 })}
                          style={{
                            default: {
                              fill: scanValue > 0 ? colorScale(scanValue) : COLORS.mapFill,
                              stroke: COLORS.border,
                              strokeWidth: 0.75,
                              outline: 'none',
                              transition: 'fill 250ms'
                            },
                            hover: {
                              fill: COLORS.mapHover,
                              stroke: '#fff',
                              strokeWidth: 1.5,
                              outline: 'none',
                              cursor: 'pointer'
                            },
                            pressed: {
                              fill: '#fff',
                              outline: 'none'
                            }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            </motion.div>
          )}

          {/* Overlay Map Labels */}
          {!loading && (
            <div className="absolute bottom-8 left-8 pointer-events-none">
              <div className="bg-black/50 backdrop-blur border border-indigo-500/30 p-4 rounded-xl font-mono text-xs text-indigo-200">
                <p className="font-bold text-white mb-2 uppercase">Threat Density Legend</p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.threatLow }}></div>
                  <span>Secure (Nominal)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded" style={{ background: `linear-gradient(to right, ${COLORS.threatLow}, ${COLORS.threatHigh})` }}></div>
                  <span>Elevated Chatter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.threatHigh, boxShadow: '0 0 10px #EF4444' }}></div>
                  <span className="text-red-400 font-bold animate-pulse">High Risk Intercepts</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel Palantir Slide Out */}
        <AnimatePresence>
          {selectedState && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="w-full max-w-md border-l shrink-0 h-full overflow-y-auto"
              style={{ backgroundColor: COLORS.bgPanel, borderColor: COLORS.border }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8 cursor-pointer" onClick={() => setSelectedState(null)}>
                  <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">{selectedState.name || "Unknown Region"}</h2>
                  <span className="border border-indigo-500 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer px-3 py-1 rounded-full text-xs font-bold tracking-widest transition-colors">CLOSE</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/40 border border-indigo-500/20 p-4 rounded-xl flex flex-col items-center justify-center">
                    <Target className="text-blue-400 mb-2" size={20} />
                    <span className="text-2xl font-bold text-white">{selectedState.schemeCount || 0}</span>
                    <span className="text-[10px] text-indigo-300 font-mono text-center mt-1">SCHEME UPLINKS</span>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                    <AlertTriangle className="text-red-500 mb-2" size={20} />
                    <span className="text-2xl font-bold text-red-500">{selectedState.scamCount || 0}</span>
                    <span className="text-[10px] text-red-300 font-mono text-center mt-1">ACTIVE THREATS</span>
                  </div>
                </div>

                <h3 className="font-mono text-indigo-400 mb-4 border-b border-indigo-500/30 pb-2 flex items-center gap-2">
                  <Terminal size={14}/> REGIONAL INTERCEPTS
                </h3>
                
                <div className="space-y-4 pb-20">
                  {selectedState.queries?.length > 0 ? (
                    selectedState.queries.map((q, idx) => (
                      <div key={idx} className="bg-black/30 border border-indigo-500/20 rounded-lg p-3 text-xs leading-relaxed">
                        <div className="flex justify-between items-center mb-2 font-mono">
                          <span className={q.category === 'scam_check' ? 'text-red-400 font-bold' : 'text-blue-400'}>
                            [{q.category.toUpperCase()}]
                          </span>
                          <span className="text-gray-500">{q.latency_ms}ms</span>
                        </div>
                        <p className="text-gray-300 line-clamp-2" title={q.query}>"{q.query}"</p>
                        <div className="mt-2 pt-2 border-t border-white/5 text-gray-500 line-clamp-3">
                          {q.output}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 border border-dashed border-indigo-500/30 rounded-xl text-indigo-400 font-mono text-xs cursor-default">
                      NO INTERCEPTS FOUND
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
