'use client';

import React from 'react';
import { LCAResult, VehicleSpec } from '@/types/vehicle';
import { Award, Leaf, Target, TrendingDown, Zap } from 'lucide-react';

interface MetricSummaryCardsProps {
  lcaResult: LCAResult;
  vehicleA: VehicleSpec;
  vehicleB: VehicleSpec;
  gridIntensity: number;
}

export default function MetricSummaryCards({
  lcaResult,
  vehicleA,
  vehicleB,
  gridIntensity,
}: MetricSummaryCardsProps) {
  const { breakevenYear, breakevenKm, vehicleA_Breakdown, vehicleB_Breakdown } = lcaResult;

  // Determine which vehicle is cleaner overall
  const isACleaner = vehicleA_Breakdown.total <= vehicleB_Breakdown.total;
  const cleanerName = isACleaner ? vehicleA.name : vehicleB.name;
  const carbonSavedKg = Math.abs(vehicleA_Breakdown.total - vehicleB_Breakdown.total);
  const carbonSavedTonnes = (carbonSavedKg / 1000).toFixed(1);

  // Tree equivalency: Average mature tree absorbs ~21.7 kg CO2 / year
  const treeYears = Math.round(carbonSavedKg / 21.7);

  // Grid Sensitivity Rating
  const getGridSensitivity = (intensity: number) => {
    if (intensity <= 100) return { rating: 'Ultra-Clean', color: 'text-emerald-400', desc: '100% Green Grid Advantage' };
    if (intensity <= 300) return { rating: 'Low Carbon', color: 'text-cyan-400', desc: 'Optimal EV Operational Cleanliness' };
    if (intensity <= 500) return { rating: 'Moderate', color: 'text-amber-400', desc: 'Transitioning Grid Impact' };
    return { rating: 'High Coal Burden', color: 'text-rose-400', desc: 'High Grid Emissions Reduce EV Offset' };
  };

  const gridRating = getGridSensitivity(gridIntensity);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Break-Even Milestone */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Break-Even Milestone
          </span>
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-white tracking-tight">
          {breakevenYear !== null ? (
            <>
              {breakevenYear} <span className="text-sm font-normal text-slate-400">yrs</span>
            </>
          ) : isACleaner && vehicleA_Breakdown.manufacturing <= vehicleB_Breakdown.manufacturing ? (
            'Immediate Advantage'
          ) : (
            'No Parity'
          )}
        </p>
        <p className="text-xs text-slate-400">
          {breakevenKm !== null
            ? `At ~${breakevenKm.toLocaleString()} driving km`
            : isACleaner
            ? `${cleanerName} starts cleaner from Day 1`
            : 'Operational delta insufficient to offset manufacturing'}
        </p>
      </div>

      {/* Card 2: Lifetime Carbon Delta */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Lifetime Net Carbon Delta
          </span>
          <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-cyan-400 tracking-tight">
          {carbonSavedTonnes} <span className="text-sm font-normal text-slate-400">Tonnes CO2e</span>
        </p>
        <p className="text-xs text-slate-400 truncate">
          Saved by choosing <span className="text-white font-semibold">{cleanerName}</span>
        </p>
      </div>

      {/* Card 3: Equivalent Trees Needed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tree-Years Equivalent
          </span>
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Leaf className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-400 tracking-tight">
          {treeYears.toLocaleString()} <span className="text-sm font-normal text-slate-400">trees</span>
        </p>
        <p className="text-xs text-slate-400">Equivalent mature trees absorbing CO2 for 1 year</p>
      </div>

      {/* Card 4: Grid Sensitivity Index */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Grid Intensity Impact
          </span>
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <p className={`text-2xl font-bold tracking-tight ${gridRating.color}`}>
          {gridRating.rating}
        </p>
        <p className="text-xs text-slate-400 truncate">{gridRating.desc}</p>
      </div>
    </div>
  );
}
