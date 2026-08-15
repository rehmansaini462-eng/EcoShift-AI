'use client';

import React from 'react';
import { REGIONAL_GRID_INTENSITIES } from '@/constants/gridData';
import { Calendar, Gauge, Globe2, Sliders, Zap } from 'lucide-react';

interface SimulationControlsProps {
  annualKm: number;
  lifespanYears: number;
  gridIntensity: number;
  onAnnualKmChange: (value: number) => void;
  onLifespanYearsChange: (value: number) => void;
  onGridIntensityChange: (value: number) => void;
}

export default function SimulationControls({
  annualKm,
  lifespanYears,
  gridIntensity,
  onAnnualKmChange,
  onLifespanYearsChange,
  onGridIntensityChange,
}: SimulationControlsProps) {
  // Dynamic color helper for grid intensity
  const getGridColorClass = (intensity: number) => {
    if (intensity <= 100) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (intensity <= 300) return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    if (intensity <= 500) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getGridLabel = (intensity: number) => {
    if (intensity <= 100) return 'Hydro/Wind Clean Grid';
    if (intensity <= 300) return 'Low-Carbon Transition Grid';
    if (intensity <= 500) return 'Mixed Fossil & Renewable';
    return 'High-Carbon Coal/Thermal Grid';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Lifecycle Simulation Parameters</h3>
          <p className="text-xs text-slate-400">
            Adjust annual driving distance, ownership lifespan, and local electricity grid carbon intensity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Slider 1: Annual Mileage */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span>Annual Driving</span>
            </label>
            <span className="text-sm font-bold text-emerald-400">
              {annualKm.toLocaleString()} <span className="text-xs text-slate-400">km/yr</span>
            </span>
          </div>
          <input
            type="range"
            min={5000}
            max={60000}
            step={1000}
            value={annualKm}
            onChange={(e) => onAnnualKmChange(parseInt(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>5,000 km</span>
            <span>30,000 km</span>
            <span>60,000 km</span>
          </div>
        </div>

        {/* Slider 2: Vehicle Lifespan */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Evaluation Lifespan</span>
            </label>
            <span className="text-sm font-bold text-cyan-400">
              {lifespanYears} <span className="text-xs text-slate-400">years</span>
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={20}
            step={1}
            value={lifespanYears}
            onChange={(e) => onLifespanYearsChange(parseInt(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>3 Years</span>
            <span>10 Years</span>
            <span>20 Years</span>
          </div>
        </div>

        {/* Slider 3: Grid Carbon Intensity */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Electricity Grid Intensity</span>
            </label>
            <span className={`text-sm font-bold px-2 py-0.5 rounded border ${getGridColorClass(gridIntensity)}`}>
              {gridIntensity} <span className="text-[10px]">g/kWh</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={gridIntensity}
            onChange={(e) => onGridIntensityChange(parseInt(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 (Clean)</span>
            <span className="truncate max-w-[130px]">{getGridLabel(gridIntensity)}</span>
            <span>1000 (Coal)</span>
          </div>
        </div>
      </div>

      {/* Regional Quick Presets Bar */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Globe2 className="w-4 h-4 text-slate-400" />
          <span>Regional Grid Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {REGIONAL_GRID_INTENSITIES.map((region) => {
            const isActive = gridIntensity === region.intensityGramsPerKWh;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onGridIntensityChange(region.intensityGramsPerKWh)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {region.name} ({region.intensityGramsPerKWh} g)
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
