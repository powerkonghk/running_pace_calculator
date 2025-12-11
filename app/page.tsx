"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pace-to-time" | "time-to-pace" | "vdot">("pace-to-time");
  
  // Pace to Time states
  const [paceMinutes, setPaceMinutes] = useState("");
  const [paceSeconds, setPaceSeconds] = useState("");
  const [calculatedTimes, setCalculatedTimes] = useState<{
    "400m": string;
    "5k": string;
    "10k": string;
    "half": string;
    "full": string;
  } | null>(null);

  // Time to Pace states
  const [targetDistance, setTargetDistance] = useState<"5k" | "10k" | "half" | "full">("5k");
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
      "400m": formatTime((pacePerKmSeconds / 1000) * 400),
      "5k": formatTime(pacePerKmSeconds * 5),
      "10k": formatTime(pacePerKmSeconds * 10),
      "half": formatTime(pacePerKmSeconds * 21.0975),
      "full": formatTime(pacePerKmSeconds * 42.195),
    };
    setCalculatedTimes(times);
  };

  const handleTimeToPace = () => {
    const hours = parseInt(targetHours) || 0;
    const mins = parseInt(targetMinutes) || 0;
    const secs = parseInt(targetSeconds) || 0;
    const totalSeconds = hours * 3600 + mins * 60 + secs;
    
    if (totalSeconds <= 0) return;

    const distances: Record<string, number> = {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          🏃 Running Pace Calculator
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow">
          <button
            onClick={() => setActiveTab("pace-to-time")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "pace-to-time"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Pace → Time
          </button>
          <button
            onClick={() => setActiveTab("time-to-pace")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "time-to-pace"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Time → Pace
          </button>
          <button
            onClick={() => setActiveTab("vdot")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "vdot"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            VDOT Projection
          </button>
        </div>

        {/* Pace to Time Calculator */}
        {activeTab === "pace-to-time" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Calculate Race Times from Pace
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your pace per km:
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Minutes"
                  value={paceMinutes}
                  onChange={(e) => setPaceMinutes(e.target.value)}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <span className="text-gray-600">:</span>
                <input
                  type="number"
                  placeholder="Seconds"
                  value={paceSeconds}
                  onChange={(e) => setPaceSeconds(e.target.value)}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="59"
                />
                <span className="text-gray-600">/km</span>
              </div>
            </div>
            <button
              onClick={handlePaceToTime}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Calculate Times
            </button>
            {calculatedTimes && (
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Estimated Race Times:
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">400m</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {calculatedTimes["400m"]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">5K</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {calculatedTimes["5k"]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">10K</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {calculatedTimes["10k"]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Half Marathon</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {calculatedTimes["half"]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg col-span-2">
                    <div className="text-sm text-gray-600">Full Marathon</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {calculatedTimes["full"]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Time to Pace Calculator */}
        {activeTab === "time-to-pace" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Calculate Target Pace from Finish Time
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select distance:
              </label>
              <select
                value={targetDistance}
                onChange={(e) => setTargetDistance(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="5k">5K</option>
                <option value="10k">10K</option>
                <option value="half">Half Marathon</option>
                <option value="full">Full Marathon</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target finish time:
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Hours"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <span className="text-gray-600">:</span>
                <input
                  type="number"
                  placeholder="Minutes"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="59"
                />
                <span className="text-gray-600">:</span>
                <input
                  type="number"
                  placeholder="Seconds"
                  value={targetSeconds}
                  onChange={(e) => setTargetSeconds(e.target.value)}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="59"
                />
              </div>
            </div>
            <button
              onClick={handleTimeToPace}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Calculate Pace
            </button>
            {calculatedPace && (
              <div className="mt-6 bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Required Pace:
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  {calculatedPace}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VDOT Calculator */}
        {activeTab === "vdot" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              VDOT Race Time Projection
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter a recent race result to project performance at other distances.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Race distance:
              </label>
              <select
                value={vdotDistance}
                onChange={(e) => setVdotDistance(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="5k">5K</option>
                <option value="10k">10K</option>
                <option value="half">Half Marathon</option>
                <option value="full">Full Marathon</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finish time:
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Hours"
                  value={vdotHours}
                  onChange={(e) => setVdotHours(e.target.value)}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <span className="text-gray-600">:</span>
                <input
                  type="number"
                  placeholder="Minutes"
                  value={vdotMinutes}
                  onChange={(e) => setVdotMinutes(e.target.value)}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="59"
                />
                <span className="text-gray-600">:</span>
                <input
                  type="number"
                  placeholder="Seconds"
                  value={vdotSeconds}
                  onChange={(e) => setVdotSeconds(e.target.value)}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="59"
                />
              </div>
            </div>
            <button
              onClick={handleVDOT}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Calculate VDOT
            </button>
            {vdotProjections && (
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Your VDOT Score</div>
                  <div className="text-3xl font-bold text-green-600">
                    {vdotProjections.vdot}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Projected Race Times:
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">5K</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {vdotProjections["5k"]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">10K</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {vdotProjections["10k"]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Half Marathon</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {vdotProjections["half"]}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Full Marathon</div>
                    <div className="text-2xl font-bold text-blue-600">
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
