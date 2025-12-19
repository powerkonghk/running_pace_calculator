"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pace-to-time" | "time-to-pace" | "vdot">("pace-to-time");
  
  // Pace to Time states
  const [paceMinutes, setPaceMinutes] = useState("");
  const [paceSeconds, setPaceSeconds] = useState("");
  const [calculatedTimes, setCalculatedTimes] = useState<{
    "100m": string;
    "200m": string;
    "400m": string;
    "1.4k(HV)": string;
    "3k": string;
    "5k": string;
    "10k": string;
    "half": string;
    "full": string;
  } | null>(null);

  // Time to Pace states
  const [targetDistance, setTargetDistance] = useState<"100m" | "200m" | "400m" | "1.4k(HV)" | "3k" | "5k" | "10k" | "half" | "full">("5k");
  const [targetHours, setTargetHours] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("");
  const [targetSeconds, setTargetSeconds] = useState("");
  const [calculatedPace, setCalculatedPace] = useState<string | null>(null);

  // VDOT states
  const [vdotDistance, setVdotDistance] = useState<"5k" | "10k" | "half" | "full">("5k");
  const [vdotHours, setVdotHours] = useState("");
  const [vdotMinutes, setVdotMinutes] = useState("");
  const [vdotSeconds, setVdotSeconds] = useState("");
  const [vdotProjections, setVdotProjections] = useState<{
    vdot: number;
    "5k": string;
    "10k": string;
    "half": string;
    "full": string;
  } | null>(null);

  // Stride Length states
  const [cadence, setCadence] = useState(180);
  const [strideLength, setStrideLength] = useState<number | null>(null);

  const formatTime = (totalSeconds: number): string => {
    // Round total seconds first to avoid seconds = 60 issue
    totalSeconds = Math.round(totalSeconds);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateVDOT = (distanceMeters: number, timeSeconds: number): number => {
    const timeMinutes = timeSeconds / 60;
    const velocityMperMin = distanceMeters / timeMinutes;
    const vo2 = -4.60 + 0.182258 * velocityMperMin + 0.000104 * velocityMperMin * velocityMperMin;
    const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMinutes) + 0.2989558 * Math.exp(-0.1932605 * timeMinutes);
    return vo2 / percentMax;
  };

  const calculateRaceTime = (vdot: number, distanceMeters: number): number => {
    // Use iterative approach to find race time for given VDOT and distance
    let timeSeconds = distanceMeters / 5; // Initial guess (around 5 m/s)
    
    for (let i = 0; i < 20; i++) {
      const timeMinutes = timeSeconds / 60;
      const velocityMperMin = distanceMeters / timeMinutes;
      const vo2 = -4.60 + 0.182258 * velocityMperMin + 0.000104 * velocityMperMin * velocityMperMin;
      const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMinutes) + 0.2989558 * Math.exp(-0.1932605 * timeMinutes);
      const predictedVDOT = vo2 / percentMax;
      
      const error = predictedVDOT - vdot;
      timeSeconds = timeSeconds * (1 + error / 100);
      
      // Break if converged
      if (Math.abs(error) < 0.01) break;
    }
    
    return timeSeconds;
  };

  const handlePaceToTime = () => {
    const mins = parseInt(paceMinutes) || 0;
    const secs = parseInt(paceSeconds) || 0;
    const pacePerKmSeconds = mins * 60 + secs;
    
    if (pacePerKmSeconds <= 0) return;

    const times = {
      "100m": formatTime((pacePerKmSeconds / 1000) * 100),
      "200m": formatTime((pacePerKmSeconds / 1000) * 200),
      "400m": formatTime((pacePerKmSeconds / 1000) * 400),
      "1.4k(HV)": formatTime(pacePerKmSeconds * 1.4),
      "3k": formatTime(pacePerKmSeconds * 3),
      "5k": formatTime(pacePerKmSeconds * 5),
      "10k": formatTime(pacePerKmSeconds * 10),
      "half": formatTime(pacePerKmSeconds * 21.0975),
      "full": formatTime(pacePerKmSeconds * 42.195),
    };
    setCalculatedTimes(times);

    // Calculate stride length
    calculateStrideLength();
  };

  const calculateStrideLength = () => {
    const mins = parseInt(paceMinutes) || 0;
    const secs = parseInt(paceSeconds) || 0;
    const pacePerKmSeconds = mins * 60 + secs;
    
    if (pacePerKmSeconds > 0 && cadence > 0) {
      const speedMperMin = 1000 / (pacePerKmSeconds / 60);
      const strideLengthMeters = speedMperMin / cadence;
      setStrideLength(Math.round(strideLengthMeters * 1000) / 10);
    } else {
      setStrideLength(null);
    }
  };

  const handleCadenceChange = (newCadence: number) => {
    setCadence(newCadence);
    // Recalculate stride length immediately when cadence changes
    const mins = parseInt(paceMinutes) || 0;
    const secs = parseInt(paceSeconds) || 0;
    const pacePerKmSeconds = mins * 60 + secs;
    
    if (pacePerKmSeconds > 0 && newCadence > 0) {
      const speedMperMin = 1000 / (pacePerKmSeconds / 60);
      const strideLengthMeters = speedMperMin / newCadence;
      setStrideLength(Math.round(strideLengthMeters * 1000) / 10);
    }
  };

  const handleTimeToPace = () => {
    const hours = parseInt(targetHours) || 0;
    const mins = parseInt(targetMinutes) || 0;
    const secs = parseInt(targetSeconds) || 0;
    const totalSeconds = hours * 3600 + mins * 60 + secs;
    
    if (totalSeconds <= 0) return;

    const distances: Record<string, number> = {
      "100m": 0.1,
      "200m": 0.2,
      "400m": 0.4,
      "1.4k(HV)": 1.4,
      "3k": 3,
      "5k": 5,
      "10k": 10,
      "half": 21.0975,
      "full": 42.195,
    };

    const pacePerKmSeconds = totalSeconds / distances[targetDistance];
    const paceMinutes = Math.floor(pacePerKmSeconds / 60);
    const paceSeconds = Math.round(pacePerKmSeconds % 60);
    
    setCalculatedPace(`${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}/km`);
  };

  const handleVDOT = () => {
    const hours = parseInt(vdotHours) || 0;
    const mins = parseInt(vdotMinutes) || 0;
    const secs = parseInt(vdotSeconds) || 0;
    const totalSeconds = hours * 3600 + mins * 60 + secs;
    
    if (totalSeconds <= 0) return;

    const distances: Record<string, number> = {
      "5k": 5000,
      "10k": 10000,
      "half": 21097.5,
      "full": 42195,
    };

    const vdot = calculateVDOT(distances[vdotDistance], totalSeconds);
    
    const projections = {
      vdot: Math.round(vdot * 10) / 10,
      "5k": formatTime(calculateRaceTime(vdot, 5000)),
      "10k": formatTime(calculateRaceTime(vdot, 10000)),
      "half": formatTime(calculateRaceTime(vdot, 21097.5)),
      "full": formatTime(calculateRaceTime(vdot, 42195)),
    };
    
    setVdotProjections(projections);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-4 md:py-12 px-3 md:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Header with Bold Typography */}
        <div className="text-center mb-4 md:mb-10">
          <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-1 md:mb-3 tracking-tight">
            Running Calculator
          </h1>
          <p className="text-sm md:text-lg text-slate-400 font-medium">Train smarter with precision pace and stride analytics</p>
        </div>

        {/* Tab Navigation - Neo-brutalist with bold contrast */}
        <div className="flex gap-1.5 md:gap-3 mb-4 md:mb-8 bg-slate-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-1.5 md:p-2 shadow-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("pace-to-time")}
            className={`flex-1 py-2 md:py-4 px-2 md:px-6 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all duration-300 transform ${
              activeTab === "pace-to-time"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-102"
            }`}
          >
            Pace → Time
          </button>
          <button
            onClick={() => setActiveTab("time-to-pace")}
            className={`flex-1 py-2 md:py-4 px-2 md:px-6 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all duration-300 transform ${
              activeTab === "time-to-pace"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-102"
            }`}
          >
            Time → Pace
          </button>
          <button
            onClick={() => setActiveTab("vdot")}
            className={`flex-1 py-2 md:py-4 px-2 md:px-6 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all duration-300 transform ${
              activeTab === "vdot"
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-102"
            }`}
          >
            VDOT
          </button>
        </div>

        {/* Pace to Time Calculator */}
        {activeTab === "pace-to-time" && (
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-slate-800">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">
              Pace to Times
            </h2>
            <p className="text-slate-400 mb-4 md:mb-8 text-xs md:text-sm">Enter target pace and see projected finish times</p>
            
            <div className="mb-4 md:mb-8">
              <label className="block text-xs md:text-sm font-bold text-cyan-400 mb-2 md:mb-3 uppercase tracking-wide">
                Your Pace per km
              </label>
              <div className="flex gap-2 md:gap-3 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={paceMinutes}
                  onChange={(e) => setPaceMinutes(e.target.value)}
                  className="w-20 md:w-28 px-3 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white text-base md:text-lg font-bold placeholder-slate-600 transition-all duration-200"
                  min="0"
                />
                <span className="text-slate-500 text-lg md:text-2xl font-bold">:</span>
                <input
                  type="number"
                  placeholder="Sec"
                  value={paceSeconds}
                  onChange={(e) => setPaceSeconds(e.target.value)}
                  className="w-20 md:w-28 px-3 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white text-base md:text-lg font-bold placeholder-slate-600 transition-all duration-200"
                  min="0"
                  max="59"
                />
                <span className="text-slate-400 font-semibold text-sm md:text-lg">/km</span>
              </div>
            </div>
            
            <div className="mb-4 md:mb-8">
              <label className="block text-xs md:text-sm font-bold text-purple-400 mb-2 md:mb-3 uppercase tracking-wide">
                Cadence (spm)
              </label>
              <div className="space-y-2 md:space-y-4">
                <input
                  type="range"
                  min="170"
                  max="200"
                  value={cadence}
                  onChange={(e) => handleCadenceChange(parseInt(e.target.value))}
                  className="w-full h-2 md:h-3 bg-slate-800/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 md:[&::-webkit-slider-thumb]:w-6 md:[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-purple-500/50 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                />
                <div className="text-center bg-slate-800/30 rounded-lg md:rounded-xl py-2 md:py-3 border border-slate-700/50">
                  <span className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{cadence}</span>
                  <span className="text-slate-500 ml-1 md:ml-2 font-semibold text-xs md:text-base">spm</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePaceToTime}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 md:py-5 rounded-lg md:rounded-xl font-black text-sm md:text-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Calculate Times ⚡
            </button>
            {calculatedTimes && (
              <div className="mt-4 md:mt-8 space-y-3 md:space-y-6">
                <h3 className="text-base md:text-2xl font-black text-white uppercase tracking-tight">
                  Race Times
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">100m</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["100m"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">200m</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["200m"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">400m</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["400m"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">1.4K</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["1.4k(HV)"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">3K</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["3k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">5K</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["5k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">10K</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["10k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">Half</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {calculatedTimes["half"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">Full</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {calculatedTimes["full"]}
                    </div>
                  </div>
                </div>
                {strideLength && (
                  <div className="mt-4 md:mt-8">
                    <h3 className="text-base md:text-2xl font-black text-white uppercase tracking-tight mb-2 md:mb-4">
                      Stride
                    </h3>
                    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                      <div className="text-center">
                        <div className="text-3xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 md:mb-2">
                          {strideLength} cm
                        </div>
                        <div className="text-xs md:text-sm text-purple-300 font-semibold">
                          at {cadence} steps/min
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Time to Pace Calculator */}
        {activeTab === "time-to-pace" && (
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-slate-800">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">
              Time to Pace
            </h2>
            <p className="text-slate-400 mb-4 md:mb-8 text-xs md:text-sm">Set goal time and discover the pace you need</p>
            
            <div className="mb-4 md:mb-6">
              <label className="block text-xs md:text-sm font-bold text-purple-400 mb-2 md:mb-3 uppercase tracking-wide">
                Distance
              </label>
              <select
                value={targetDistance}
                onChange={(e) => setTargetDistance(e.target.value as any)}
                className="w-full px-3 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-base md:text-lg font-bold cursor-pointer transition-all duration-200"
              >
                <option value="100m">100m</option>
                <option value="200m">200m</option>
                <option value="400m">400m</option>
                <option value="1.4k(HV)">1.4K (HV)</option>
                <option value="3k">3K</option>
                <option value="5k">5K</option>
                <option value="10k">10K</option>
                <option value="half">Half Marathon</option>
                <option value="full">Full Marathon</option>
              </select>
            </div>
            
            <div className="mb-4 md:mb-8">
              <label className="block text-xs md:text-sm font-bold text-purple-400 mb-2 md:mb-3 uppercase tracking-wide">
                Target Time
              </label>
              <div className="flex gap-2 md:gap-3 items-center">
                <input
                  type="number"
                  placeholder="H"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-16 md:w-24 px-2 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-base md:text-lg font-bold placeholder-slate-600 transition-all duration-200"
                  min="0"
                />
                <span className="text-slate-500 text-lg md:text-2xl font-bold">:</span>
                <input
                  type="number"
                  placeholder="M"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  className="w-16 md:w-24 px-2 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-base md:text-lg font-bold placeholder-slate-600 transition-all duration-200"
                  min="0"
                  max="59"
                />
                <span className="text-slate-500 text-lg md:text-2xl font-bold">:</span>
                <input
                  type="number"
                  placeholder="S"
                  value={targetSeconds}
                  onChange={(e) => setTargetSeconds(e.target.value)}
                  className="w-16 md:w-24 px-2 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-base md:text-lg font-bold placeholder-slate-600 transition-all duration-200"
                  min="0"
                  max="59"
                />
              </div>
            </div>
            
            <button
              onClick={handleTimeToPace}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 md:py-5 rounded-lg md:rounded-xl font-black text-sm md:text-lg hover:from-purple-400 hover:to-pink-400 transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Calculate Pace ⚡
            </button>
            
            {calculatedPace && (
              <div className="mt-4 md:mt-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur p-6 md:p-8 rounded-xl md:rounded-2xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 text-center">
                <div className="text-xs md:text-sm font-bold text-purple-300 uppercase tracking-wider mb-2 md:mb-3">
                  Required Pace
                </div>
                <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {calculatedPace}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VDOT Calculator */}
        {activeTab === "vdot" && (
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-slate-800">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">
              VDOT Projection
            </h2>
            <p className="text-slate-400 mb-4 md:mb-8 text-xs md:text-sm">
              Enter recent race to project other distances
            </p>
            
            <div className="mb-4 md:mb-6">
              <label className="block text-xs md:text-sm font-bold text-orange-400 mb-2 md:mb-3 uppercase tracking-wide">
                Race Distance
              </label>
              <select
                value={vdotDistance}
                onChange={(e) => setVdotDistance(e.target.value as any)}
                className="w-full px-3 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white text-base md:text-lg font-bold cursor-pointer transition-all duration-200"
              >
                <option value="5k">5K</option>
                <option value="10k">10K</option>
                <option value="half">Half Marathon</option>
                <option value="full">Full Marathon</option>
              </select>
            </div>
            
            <div className="mb-4 md:mb-8">
              <label className="block text-xs md:text-sm font-bold text-orange-400 mb-2 md:mb-3 uppercase tracking-wide">
                Finish Time
              </label>
              <div className="flex gap-2 md:gap-3 items-center">
                <input
                  type="number"
                  placeholder="H"
                  value={vdotHours}
                  onChange={(e) => setVdotHours(e.target.value)}
                  className="w-16 md:w-24 px-2 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white text-base md:text-lg font-bold placeholder-slate-600 transition-all duration-200"
                  min="0"
                />
                <span className="text-slate-500 text-lg md:text-2xl font-bold">:</span>
                <input
                  type="number"
                  placeholder="M"
                  value={vdotMinutes}
                  onChange={(e) => setVdotMinutes(e.target.value)}
                  className="w-16 md:w-24 px-2 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white text-base md:text-lg font-bold placeholder-slate-600 transition-all duration-200"
                  min="0"
                  max="59"
                />
                <span className="text-slate-500 text-lg md:text-2xl font-bold">:</span>
                <input
                  type="number"
                  placeholder="S"
                  value={vdotSeconds}
                  onChange={(e) => setVdotSeconds(e.target.value)}
                  className="w-16 md:w-24 px-2 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white text-base md:text-lg font-bold placeholder-slate-600 transition-all duration-200"
                  min="0"
                  max="59"
                />
              </div>
            </div>
            
            <button
              onClick={handleVDOT}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 md:py-5 rounded-lg md:rounded-xl font-black text-sm md:text-lg hover:from-orange-400 hover:to-red-400 transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Calculate VDOT ⚡
            </button>
            
            {vdotProjections && (
              <div className="mt-4 md:mt-8 space-y-3 md:space-y-6">
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-green-500/50 shadow-lg shadow-green-500/20 text-center">
                  <div className="text-xs md:text-sm font-bold text-green-300 uppercase tracking-wider mb-1 md:mb-2">VDOT Score</div>
                  <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {vdotProjections.vdot}
                  </div>
                </div>
                
                <h3 className="text-base md:text-2xl font-black text-white uppercase tracking-tight">
                  Projected Times
                </h3>
                
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-3 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">5K</div>
                    <div className="text-xl md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {vdotProjections["5k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-3 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">10K</div>
                    <div className="text-xl md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {vdotProjections["10k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-3 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">Half</div>
                    <div className="text-xl md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {vdotProjections["half"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-3 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">Full</div>
                    <div className="text-xl md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {vdotProjections["full"]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
}
