import React, { useState, useEffect } from 'react';
import { Activity, Map as MapIcon, AlertTriangle, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import './index.css';

interface SeismicEvent {
  id: string;
  magnitude: number;
  depth: number;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
}

interface RiskPrediction {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  probabilityPercentage: number;
  estimatedWaveHeightMeters: number;
  analysis: string;
}

const generateMockEvent = (): SeismicEvent => {
    const isCritical = Math.random() > 0.8;
    return {
        id: Math.random().toString(36).substr(2, 9),
        magnitude: isCritical ? 7.0 + Math.random() * 2 : 3.0 + Math.random() * 3,
        depth: 10 + Math.random() * 100,
        location: Math.random() > 0.5 ? 'Offshore plate boundary' : 'Inland fault',
        lat: 20 + Math.random() * 40 * (Math.random() > 0.5 ? 1 : -1),
        lng: 130 + Math.random() * 40 * (Math.random() > 0.5 ? 1 : -1),
        timestamp: new Date().toLocaleTimeString()
    };
};

function App() {
  const [events, setEvents] = useState<SeismicEvent[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SeismicEvent | null>(null);
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate some initial mock events
    const initEvents = Array.from({ length: 5 }, generateMockEvent);
    setEvents(initEvents);
    setSelectedEvent(initEvents[0]);

    setChartData(initEvents.map(e => ({
        time: e.timestamp,
        magnitude: e.magnitude
    })));

  }, []);

  useEffect(() => {
    if (selectedEvent) {
      analyzeRisk(selectedEvent);
    }
  }, [selectedEvent]);

  const analyzeRisk = async (event: SeismicEvent) => {
    setLoading(true);
    try {
      // Connects to our backend which runs the Vertex AI model
      const res = await fetch('https://resqnet-backend-ivczkwp2iq-uc.a.run.app/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          magnitude: event.magnitude,
          depth: event.depth,
          location: event.location,
        })
      });
      const data = await res.json();
      setPrediction(data);
    } catch (error) {
      console.error("Failed to fetch prediction");
      // Fallback
      setPrediction({
          riskLevel: 'MODERATE',
          probabilityPercentage: 45,
          estimatedWaveHeightMeters: 1.2,
          analysis: 'Analysis failed to fetch. Local heuristics estimate moderate danger.'
      });
    }
    setLoading(false);
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'text-red-500';
      case 'HIGH': return 'text-orange-500';
      case 'MODERATE': return 'text-yellow-400';
      default: return 'text-green-500';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-500/10 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/10 border-orange-500/50';
      case 'MODERATE': return 'bg-yellow-400/10 border-yellow-400/50';
      default: return 'bg-green-500/10 border-green-500/50';
    }
  };

  const IconForRisk = prediction?.riskLevel === 'CRITICAL' || prediction?.riskLevel === 'HIGH' ? AlertTriangle : 
                      prediction?.riskLevel === 'MODERATE' ? AlertCircle : CheckCircle2;

  return (
    <div className="min-h-screen bg-gray-950 text-slate-200 font-sans p-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-800 pb-4 mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 w-8 h-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            ResQNet Tsunami Watch
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            <span className="text-sm font-medium text-emerald-400 tracking-wide uppercase">AI Vertex Core Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-hidden shadow-2xl relative">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><MapIcon size={18} className="text-blue-400"/> Global Seismic Activity</h2>
                </div>
                <div className="h-[450px] w-full bg-slate-900">
                    <MapContainer center={[20, 130]} zoom={3} scrollWheelZoom={true} style={{ height: '100%', width: '100%', backgroundColor: '#0f172a', zIndex: 1 }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                        />
                        {events.map(ev => (
                            <CircleMarker 
                                key={ev.id} 
                                center={[ev.lat, ev.lng]} 
                                radius={ev.magnitude * 2.5}
                                pathOptions={{ 
                                    fillColor: ev.magnitude > 6.5 ? '#ef4444' : (ev.magnitude > 5 ? '#f97316' : '#eab308'), 
                                    color: ev.magnitude > 6.5 ? '#ef4444' : (ev.magnitude > 5 ? '#f97316' : '#eab308'),
                                    fillOpacity: 0.6
                                }}
                                eventHandlers={{
                                    click: () => setSelectedEvent(ev),
                                }}
                            >
                                <Popup className="bg-gray-800 border-none text-white !m-0">
                                    <div className="p-2 text-gray-800">
                                        <strong>Mag: {ev.magnitude.toFixed(1)}</strong><br/>
                                        Depth: {ev.depth.toFixed(1)}km
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Activity size={18} className="text-blue-400"/> Magnitude Timeline</h2>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                              itemStyle={{ color: '#3b82f6' }}
                            />
                            <Line type="monotone" dataKey="magnitude" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e293b'}} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className={`p-6 rounded-xl border transition-all duration-700 shadow-2xl ${prediction ? getRiskBgColor(prediction.riskLevel) : 'bg-gray-900 border-gray-800'}`}>
                <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                    <span>Vertex AI Risk Assessment</span>
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-r-2 border-white"></div>
                    ) : (
                        <IconForRisk className={prediction ? getRiskColor(prediction.riskLevel) : 'text-gray-500'} />
                    )}
                </h2>

                {selectedEvent && prediction ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 border border-white/5 p-4 rounded-lg backdrop-blur-md">
                                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Target Mag</span>
                                <span className="text-3xl font-light text-white">{selectedEvent.magnitude.toFixed(1)}</span>
                            </div>
                            <div className="bg-black/40 border border-white/5 p-4 rounded-lg backdrop-blur-md">
                                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Status</span>
                                <span className={`text-xl font-bold ${getRiskColor(prediction.riskLevel)}`}>{prediction.riskLevel}</span>
                            </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-gray-400 font-medium tracking-wide">Tsunami Probability</span>
                                <span className="font-bold text-white">{prediction.probabilityPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${prediction.probabilityPercentage > 60 ? 'bg-red-500' : (prediction.probabilityPercentage > 30 ? 'bg-orange-500' : 'bg-green-500')}`} 
                                    style={{ width: `${prediction.probabilityPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {prediction.estimatedWaveHeightMeters > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-lg shadow-inner">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Est. Wave Height (Max)</span>
                                <div className="text-3xl font-bold text-blue-400 mt-2 flex items-baseline gap-1">
                                    {prediction.estimatedWaveHeightMeters.toFixed(1)} <span className="text-sm font-normal text-blue-500/70">Meters</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-5 border-t border-white/10 mt-6 relative">
                            <div className="absolute top-0 left-4 -translate-y-1/2 bg-gray-900 border border-gray-800 px-2 rounded text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                                <ShieldCheck size={12}/> AI Analysis
                            </div>
                            <p className="text-sm leading-relaxed text-gray-300 pt-2 font-medium">
                                {prediction.analysis}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 italic">
                        Select a seismic event from the map to initiate analysis.
                    </div>
                )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-xl">
                <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-white">
                    <Activity size={18} className="text-emerald-400"/> Recent Events Feed
                </h2>
                <div className="space-y-3">
                    {events.map(ev => (
                        <div 
                            key={ev.id} 
                            onClick={() => setSelectedEvent(ev)}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${selectedEvent?.id === ev.id ? 'bg-blue-900/30 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-gray-800/40 border-transparent hover:bg-gray-800/80 hover:border-gray-700'}`}
                        >
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="font-semibold text-sm flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${ev.magnitude > 6.5 ? 'bg-red-500' : (ev.magnitude > 5 ? 'bg-orange-500' : 'bg-yellow-500')}`}></span>
                                    Mag {ev.magnitude.toFixed(1)} - {ev.location}
                                </span>
                                <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded">{ev.timestamp}</span>
                            </div>
                            <div className="text-xs text-gray-500 ml-4 font-mono">
                                D: {ev.depth.toFixed(0)}km | Coord: [{ev.lat.toFixed(2)}, {ev.lng.toFixed(2)}]
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
