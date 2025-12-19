"use client";

import { useState } from "react";

// Language translations
const translations = {
  en: {
    title: "Running Calculator",
    subtitle: "Calculating your pain, one step at a time.",
    tabs: {
      paceToTime: "Pace → Time",
      timeToPace: "Time → Pace",
      vdot: "VDOT",
    },
    paceToTime: {
      title: "Pace to Times",
      subtitle: "Enter target pace and see projected finish times",
      paceLabel: "Your Pace per km",
      cadenceLabel: "Cadence (spm)",
      button: "Calculate Times ⚡",
      raceTimes: "Race Times",
      stride: "Stride",
      stepsMin: "steps/min",
    },
    timeToPace: {
      title: "Time to Pace",
      subtitle: "Set goal time and discover the pace you need",
      distanceLabel: "Distance",
      targetTimeLabel: "Target Time",
      button: "Calculate Pace ⚡",
      requiredPace: "Required Pace",
    },
    vdot: {
      title: "VDOT Projection",
      subtitle: "Enter recent race to project other distances",
      raceDistanceLabel: "Race Distance",
      finishTimeLabel: "Finish Time",
      button: "Calculate VDOT ⚡",
      vdotScore: "VDOT Score",
      projectedTimes: "Projected Times",
    },
    distances: {
      "100m": "100m",
      "200m": "200m",
      "400m": "400m",
      "1.4k": "1.4K (HV)",
      "3k": "3K",
      "5k": "5K",
      "10k": "10K",
      half: "Half Marathon",
      full: "Full Marathon",
      halfShort: "Half",
      fullShort: "Full",
    },
  },
  zh: {
    title: "跑步計算神器",
    subtitle: "數據唔會呃人 但出口術既人會",
    tabs: {
      paceToTime: "配速 → 時間",
      timeToPace: "時間 → 配速",
      vdot: "VDOT",
    },
    paceToTime: {
      title: "配速計時間",
      subtitle: "輸入目標配速,睇預計完成時間",
      paceLabel: "你嘅配速(每公里)",
      cadenceLabel: "步頻(每分鐘步數)",
      button: "計算時間 ⚡",
      raceTimes: "比賽時間",
      stride: "步幅",
      stepsMin: "步/分鐘",
    },
    timeToPace: {
      title: "時間計配速",
      subtitle: "設定目標時間,搵出你需要嘅配速",
      distanceLabel: "距離",
      targetTimeLabel: "目標時間",
      button: "計算配速 ⚡",
      requiredPace: "需要配速",
    },
    vdot: {
      title: "VDOT 預測",
      subtitle: "輸入最近比賽成績,預測其他距離表現",
      raceDistanceLabel: "比賽距離",
      finishTimeLabel: "完成時間",
      button: "計算 VDOT ⚡",
      vdotScore: "VDOT 分數",
      projectedTimes: "預測時間",
    },
    distances: {
      "100m": "100米",
      "200m": "200米",
      "400m": "400米",
      "1.4k": "1.4公里(跑馬地)",
      "3k": "3公里",
      "5k": "5公里",
      "10k": "10公里",
      half: "半馬拉松",
      full: "全馬拉松",
      halfShort: "半馬",
      fullShort: "全馬",
    },
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pace-to-time" | "time-to-pace" | "vdot">("pace-to-time");
  const [lang, setLang] = useState<"en" | "zh">("zh");
  const t = translations[lang];
  
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
        {/* Language Toggle */}
        <div className="flex justify-end mb-2 md:mb-4">
          <div className="flex gap-1 bg-slate-900/50 backdrop-blur-sm rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded text-xs md:text-sm font-bold transition-all duration-200 ${
                lang === "en"
                  ? "bg-cyan-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("zh")}
              className={`px-3 py-1.5 rounded text-xs md:text-sm font-bold transition-all duration-200 ${
                lang === "zh"
                  ? "bg-cyan-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              講
            </button>
          </div>
        </div>

        {/* Hero Header with Bold Typography */}
        <div className="text-center mb-4 md:mb-10">
          <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-1 md:mb-3 tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm md:text-lg text-slate-400 font-medium">{t.subtitle}</p>
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
            {t.tabs.paceToTime}
          </button>
          <button
            onClick={() => setActiveTab("time-to-pace")}
            className={`flex-1 py-2 md:py-4 px-2 md:px-6 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all duration-300 transform ${
              activeTab === "time-to-pace"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-102"
            }`}
          >
            {t.tabs.timeToPace}
          </button>
          <button
            onClick={() => setActiveTab("vdot")}
            className={`flex-1 py-2 md:py-4 px-2 md:px-6 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all duration-300 transform ${
              activeTab === "vdot"
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-102"
            }`}
          >
            {t.tabs.vdot}
          </button>
        </div>

        {/* Pace to Time Calculator */}
        {activeTab === "pace-to-time" && (
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border border-slate-800">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">
              {t.paceToTime.title}
            </h2>
            <p className="text-slate-400 mb-4 md:mb-8 text-xs md:text-sm">{t.paceToTime.subtitle}</p>
            
            <div className="mb-4 md:mb-8">
              <label className="block text-xs md:text-sm font-bold text-cyan-400 mb-2 md:mb-3 uppercase tracking-wide">
                {t.paceToTime.paceLabel}
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
                {t.paceToTime.cadenceLabel}
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
              {t.paceToTime.button}
            </button>
            {calculatedTimes && (
              <div className="mt-4 md:mt-8 space-y-3 md:space-y-6">
                <h3 className="text-base md:text-2xl font-black text-white uppercase tracking-tight">
                  {t.paceToTime.raceTimes}
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["100m"]}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["100m"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["200m"]}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["200m"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["400m"]}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["400m"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["1.4k"]}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["1.4k(HV)"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["3k"]}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["3k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["5k"]}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["5k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["10k"]}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">
                      {calculatedTimes["10k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances.halfShort}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {calculatedTimes["half"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-2 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances.fullShort}</div>
                    <div className="text-base md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {calculatedTimes["full"]}
                    </div>
                  </div>
                </div>
                {strideLength && (
                  <div className="mt-4 md:mt-8">
                    <h3 className="text-base md:text-2xl font-black text-white uppercase tracking-tight mb-2 md:mb-4">
                      {t.paceToTime.stride}
                    </h3>
                    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                      <div className="text-center">
                        <div className="text-3xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 md:mb-2">
                          {strideLength} cm
                        </div>
                        <div className="text-xs md:text-sm text-purple-300 font-semibold">
                          {cadence} {t.paceToTime.stepsMin}
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
              {t.timeToPace.title}
            </h2>
            <p className="text-slate-400 mb-4 md:mb-8 text-xs md:text-sm">{t.timeToPace.subtitle}</p>
            
            <div className="mb-4 md:mb-6">
              <label className="block text-xs md:text-sm font-bold text-purple-400 mb-2 md:mb-3 uppercase tracking-wide">
                {t.timeToPace.distanceLabel}
              </label>
              <select
                value={targetDistance}
                onChange={(e) => setTargetDistance(e.target.value as any)}
                className="w-full px-3 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-base md:text-lg font-bold cursor-pointer transition-all duration-200"
              >
                <option value="100m">{t.distances["100m"]}</option>
                <option value="200m">{t.distances["200m"]}</option>
                <option value="400m">{t.distances["400m"]}</option>
                <option value="1.4k(HV)">{t.distances["1.4k"]}</option>
                <option value="3k">{t.distances["3k"]}</option>
                <option value="5k">{t.distances["5k"]}</option>
                <option value="10k">{t.distances["10k"]}</option>
                <option value="half">{t.distances.half}</option>
                <option value="full">{t.distances.full}</option>
              </select>
            </div>
            
            <div className="mb-4 md:mb-8">
              <label className="block text-xs md:text-sm font-bold text-purple-400 mb-2 md:mb-3 uppercase tracking-wide">
                {t.timeToPace.targetTimeLabel}
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
              {t.timeToPace.button}
            </button>
            
            {calculatedPace && (
              <div className="mt-4 md:mt-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur p-6 md:p-8 rounded-xl md:rounded-2xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 text-center">
                <div className="text-xs md:text-sm font-bold text-purple-300 uppercase tracking-wider mb-2 md:mb-3">
                  {t.timeToPace.requiredPace}
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
              {t.vdot.title}
            </h2>
            <p className="text-slate-400 mb-4 md:mb-8 text-xs md:text-sm">
              {t.vdot.subtitle}
            </p>
            
            <div className="mb-4 md:mb-6">
              <label className="block text-xs md:text-sm font-bold text-orange-400 mb-2 md:mb-3 uppercase tracking-wide">
                {t.vdot.raceDistanceLabel}
              </label>
              <select
                value={vdotDistance}
                onChange={(e) => setVdotDistance(e.target.value as any)}
                className="w-full px-3 md:px-5 py-2 md:py-4 bg-slate-800/50 border-2 border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white text-base md:text-lg font-bold cursor-pointer transition-all duration-200"
              >
                <option value="5k">{t.distances["5k"]}</option>
                <option value="10k">{t.distances["10k"]}</option>
                <option value="half">{t.distances.half}</option>
                <option value="full">{t.distances.full}</option>
              </select>
            </div>
            
            <div className="mb-4 md:mb-8">
              <label className="block text-xs md:text-sm font-bold text-orange-400 mb-2 md:mb-3 uppercase tracking-wide">
                {t.vdot.finishTimeLabel}
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
              {t.vdot.button}
            </button>
            
            {vdotProjections && (
              <div className="mt-4 md:mt-8 space-y-3 md:space-y-6">
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-green-500/50 shadow-lg shadow-green-500/20 text-center">
                  <div className="text-xs md:text-sm font-bold text-green-300 uppercase tracking-wider mb-1 md:mb-2">{t.vdot.vdotScore}</div>
                  <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {vdotProjections.vdot}
                  </div>
                </div>
                
                <h3 className="text-base md:text-2xl font-black text-white uppercase tracking-tight">
                  {t.vdot.projectedTimes}
                </h3>
                
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-3 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["5k"]}</div>
                    <div className="text-xl md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {vdotProjections["5k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-3 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances["10k"]}</div>
                    <div className="text-xl md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {vdotProjections["10k"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-3 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances.halfShort}</div>
                    <div className="text-xl md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {vdotProjections["half"]}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur p-3 md:p-5 rounded-lg md:rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                    <div className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5 md:mb-1">{t.distances.fullShort}</div>
                    <div className="text-xl md:text-3xl font-black text-white group-hover:text-orange-400 transition-colors">
                      {vdotProjections["full"]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Credit */}
        <footer className="mt-8 md:mt-12 pb-4">
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {/* Instagram */}
            <a 
              href="https://instagram.com/powerkonghk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-pink-400 transition-all duration-200 group"
              title="Instagram"
            >
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-200" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-xs md:text-sm font-semibold hidden md:inline">@powerkonghk</span>
            </a>

            {/* Strava */}
            <a 
              href="https://www.strava.com/athletes/40195352" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-all duration-200 group"
              title="Strava"
            >
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-200" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
              <span className="text-xs md:text-sm font-semibold hidden md:inline">Strava</span>
            </a>

            {/* YouTube */}
            <a 
              href="https://www.youtube.com/powerkonghk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-all duration-200 group"
              title="YouTube"
            >
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-200" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-xs md:text-sm font-semibold hidden md:inline">YouTube</span>
            </a>
          </div>
        </footer>


      </div>
    </div>
  );
}
