'use client';

import React, { useMemo, useState } from 'react';
import AIGreenAdvisor from '@/components/AIGreenAdvisor';
import BreakEvenLineChart from '@/components/BreakEvenLineChart';
import EmissionBreakdownBarChart from '@/components/EmissionBreakdownBarChart';
import MetricSummaryCards from '@/components/MetricSummaryCards';
import SimulationControls from '@/components/SimulationControls';
import VehicleSelectorCard from '@/components/VehicleSelectorCard';
import { PRESET_VEHICLES, REGIONAL_GRID_INTENSITIES } from '@/constants/gridData';
import { calculateLifecycleEmissions } from '@/lib/lcaCalculator';
import { SimulationParams, VehicleSpec } from '@/types/vehicle';
import { Activity, BarChart3, Code2, Globe, Leaf, Sparkles } from 'lucide-react';

export default function Home() {
  // Vehicle Specs State (Defaults: Tesla Model 3 vs Honda Civic Petrol)
  const [vehicleA, setVehicleA] = useState<VehicleSpec>(PRESET_VEHICLES.TESLA_MODEL_3);
  const [vehicleB, setVehicleB] = useState<VehicleSpec>(PRESET_VEHICLES.HONDA_CIVIC_PETROL);

  // Simulation Controls State
  const [annualKm, setAnnualKm] = useState<number>(15000);
  const [lifespanYears, setLifespanYears] = useState<number>(10);
  const [gridIntensity, setGridIntensity] = useState<number>(
    REGIONAL_GRID_INTENSITIES[1].intensityGramsPerKWh // US Avg (370 g/kWh)
  );

  // Active Chart View Tab State ('line' | 'bar' | 'both')
  const [activeTab, setActiveTab] = useState<'both' | 'line' | 'bar'>('both');

  // Simulation Params Bundle
  const simParams: SimulationParams = useMemo(
    () => ({
      vehicleA,
      vehicleB,
      annualKm,
      lifespanYears,
      gridIntensityGramsPerKWh: gridIntensity,
    }),
    [vehicleA, vehicleB, annualKm, lifespanYears, gridIntensity]
  );

  // Real-time Reactive LCA Calculation Engine Memo
  const lcaResult = useMemo(() => {
    return calculateLifecycleEmissions(simParams);
  }, [simParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Background Gradient Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-20 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">EcoShift AI</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  AI 4 Earth
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI-Powered Cradle-to-Grave Vehicle Lifecycle Carbon Assessment (LCA)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/rehmansaini462-eng/EcoShift-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-semibold transition"
            >
              <Code2 className="w-4 h-4" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </header>

        {/* Section 1: Dual Vehicle Selectors */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VehicleSelectorCard
            label="Vehicle A (Primary Focus)"
            vehicle={vehicleA}
            onChange={setVehicleA}
            accentColor="emerald"
          />
          <VehicleSelectorCard
            label="Vehicle B (Comparison Benchmark)"
            vehicle={vehicleB}
            onChange={setVehicleB}
            accentColor="cyan"
          />
        </section>

        {/* Section 2: Simulation Controls Bar */}
        <section>
          <SimulationControls
            annualKm={annualKm}
            lifespanYears={lifespanYears}
            gridIntensity={gridIntensity}
            onAnnualKmChange={setAnnualKm}
            onLifespanYearsChange={setLifespanYears}
            onGridIntensityChange={setGridIntensity}
          />
        </section>

        {/* Section 3: Natural Language Insight Summary Banner */}
        <section className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md flex items-start gap-4">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-400/30 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              AI Lifecycle Synthesis Insight
            </span>
            <p className="text-base font-semibold text-slate-100 leading-relaxed">
              {lcaResult.summaryInsight}
            </p>
          </div>
        </section>

        {/* Section 4: Live Metric Summary Cards */}
        <section>
          <MetricSummaryCards
            lcaResult={lcaResult}
            vehicleA={vehicleA}
            vehicleB={vehicleB}
            gridIntensity={gridIntensity}
          />
        </section>

        {/* Section 5: Recharts Visualizations */}
        <section className="space-y-4">
          {/* Visualization Controls / Tab Switcher */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Lifecycle Carbon Visualizations</span>
            </h2>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'both' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Charts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('line')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'line' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Line Trajectory</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bar')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'bar' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Stacked Breakdown</span>
              </button>
            </div>
          </div>

          {/* Charts Layout */}
          <div
            className={`grid gap-6 ${
              activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {(activeTab === 'both' || activeTab === 'line') && (
              <BreakEvenLineChart
                lcaResult={lcaResult}
                vehicleA={vehicleA}
                vehicleB={vehicleB}
              />
            )}
            {(activeTab === 'both' || activeTab === 'bar') && (
              <EmissionBreakdownBarChart
                lcaResult={lcaResult}
                vehicleA={vehicleA}
                vehicleB={vehicleB}
              />
            )}
          </div>
        </section>

        {/* Section 6: AI Green Advisor Synthesis Module */}
        <section>
          <AIGreenAdvisor simulationResult={lcaResult} params={simParams} />
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500 space-y-1">
          <p>EcoShift AI — Open Source Climate Tech Solution built for AI 4 Earth Hackathon</p>
          <p className="text-[11px] text-slate-600">
            Lifecycle Assessment methodologies based on ISO 14040/14044 LCA standards and GREET model benchmarks.
          </p>
        </footer>
      </div>
    </div>
  );
}
