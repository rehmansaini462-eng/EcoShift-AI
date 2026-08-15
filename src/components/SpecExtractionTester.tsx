'use client';

import React, { useState } from 'react';
import { PRESET_VEHICLES, REGIONAL_GRID_INTENSITIES } from '@/constants/gridData';
import { fetchVehicleSpec } from '@/lib/geminiClient';
import { calculateLifecycleEmissions } from '@/lib/lcaCalculator';
import { LCAResult, VehicleSpec } from '@/types/vehicle';
import {
  AlertCircle,
  Battery,
  Bot,
  Car,
  CheckCircle2,
  Cpu,
  Gauge,
  Leaf,
  Loader2,
  Scale,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function SpecExtractionTester() {
  const [query, setQuery] = useState<string>('Tesla Model Y Long Range');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedSpec, setExtractedSpec] = useState<VehicleSpec | null>(null);
  const [lcaPreview, setLcaPreview] = useState<LCAResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setLcaPreview(null);

    try {
      const spec = await fetchVehicleSpec(query);
      setExtractedSpec(spec);

      // Instant preview against Honda Civic benchmark
      const civic = PRESET_VEHICLES.HONDA_CIVIC_PETROL;
      const result = calculateLifecycleEmissions({
        vehicleA: spec,
        vehicleB: civic,
        annualKm: 15000,
        lifespanYears: 10,
        gridIntensityGramsPerKWh: REGIONAL_GRID_INTENSITIES[1].intensityGramsPerKWh, // US Avg (370 g/kWh)
      });
      setLcaPreview(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to extract vehicle specs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'BEV':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'HYBRID':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ICE_PETROL':
      case 'ICE_DIESEL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-cyan-900/40 border border-emerald-500/20 p-8 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              EcoShift AI • Day 2 Engine
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Vehicle Specification Extractor
            </h2>
          </div>
        </div>
        <p className="text-sm text-slate-300 max-w-2xl">
          Enter any vehicle make, model, or trim. Gemini 2.5 AI will automatically extract powertrain physics, battery capacity, curb weight, and manufacturing carbon footprint for Lifecycle Assessment.
        </p>
      </div>

      {/* Input Search Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <label htmlFor="vehicleInput" className="block text-sm font-medium text-slate-300">
            Vehicle Query / Model Name
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="vehicleInput"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Hyundai Ioniq 5, BMW M3, Tata Nexon EV, Rivian R1T..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  <span>Analyze Vehicle</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-medium">Try Presets:</span>
            {['Hyundai Ioniq 5 AWD', 'Ford F-150 Lightning', 'Porsche Taycan GTS', 'Toyota Prius PHEV'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuery(preset)}
                className="text-xs bg-slate-800/60 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/50 transition cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Extracted Results Card */}
      {extractedSpec && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Extracted Specification
              </span>
              <h3 className="text-2xl font-bold text-white mt-0.5">{extractedSpec.name}</h3>
            </div>
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${getBadgeStyle(
                extractedSpec.type
              )}`}
            >
              {extractedSpec.type}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Battery Capacity */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>Battery Capacity</span>
              </div>
              <p className="text-xl font-bold text-white">
                {extractedSpec.batteryKWh > 0 ? `${extractedSpec.batteryKWh} kWh` : 'N/A (ICE)'}
              </p>
            </div>

            {/* Curb Weight */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Scale className="w-4 h-4 text-blue-400" />
                <span>Curb Weight</span>
              </div>
              <p className="text-xl font-bold text-white">
                {extractedSpec.curbWeightKg.toLocaleString()} kg
              </p>
            </div>

            {/* Energy Efficiency */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>Efficiency</span>
              </div>
              <p className="text-xl font-bold text-white">
                {extractedSpec.efficiencyKmPerUnit}{' '}
                <span className="text-xs font-normal text-slate-400">
                  {extractedSpec.type === 'BEV' ? 'km/kWh' : 'km/L'}
                </span>
              </p>
            </div>

            {/* Baseline Manufacturing CO2 */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span>Base Mfg CO2</span>
              </div>
              <p className="text-xl font-bold text-white">
                {extractedSpec.baselineManufacturingCO2Kg.toLocaleString()} kg
              </p>
            </div>
          </div>

          {/* Instant LCA Comparison Preview Card */}
          {lcaPreview && (
            <div className="bg-gradient-to-r from-emerald-950/30 via-slate-950 to-teal-950/30 border border-emerald-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>Instant LCA Preview (vs Honda Civic Petrol Benchmark @ 15,000 km/yr)</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {lcaPreview.summaryInsight}
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs pt-2 text-slate-300">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">{extractedSpec.name} Total (10 Yrs):</span>
                  <span className="text-base font-bold text-emerald-400">
                    {(lcaPreview.vehicleA_Breakdown.total / 1000).toFixed(1)} tonnes CO2e
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Honda Civic Petrol Total (10 Yrs):</span>
                  <span className="text-base font-bold text-rose-400">
                    {(lcaPreview.vehicleB_Breakdown.total / 1000).toFixed(1)} tonnes CO2e
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
