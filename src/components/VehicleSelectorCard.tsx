'use client';

import React, { useState } from 'react';
import { PRESET_VEHICLES } from '@/constants/gridData';
import { fetchVehicleSpec } from '@/lib/geminiClient';
import { VehicleSpec, VehicleType } from '@/types/vehicle';
import {
  Battery,
  Bot,
  Car,
  ChevronDown,
  Cpu,
  Edit3,
  Gauge,
  Loader2,
  Scale,
  Sparkles,
} from 'lucide-react';

interface VehicleSelectorCardProps {
  label: string;
  vehicle: VehicleSpec;
  onChange: (updatedSpec: VehicleSpec) => void;
  accentColor?: 'emerald' | 'cyan';
}

export default function VehicleSelectorCard({
  label,
  vehicle,
  onChange,
  accentColor = 'emerald',
}: VehicleSelectorCardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isEmerald = accentColor === 'emerald';
  const borderFocusClass = isEmerald ? 'focus:border-emerald-500' : 'focus:border-cyan-500';
  const badgeClass =
    vehicle.type === 'BEV'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : vehicle.type === 'HYBRID'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const extracted = await fetchVehicleSpec(searchQuery);
      onChange(extracted);
      setSearchQuery('');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to fetch specs with AI.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = PRESET_VEHICLES[presetKey];
    if (preset) {
      onChange({ ...preset });
    }
  };

  const handleFieldChange = (field: keyof VehicleSpec, value: any) => {
    onChange({
      ...vehicle,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6">
      {/* Header & Title */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isEmerald ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-cyan-400 shadow-lg shadow-cyan-500/50'
              }`}
            />
            <h3 className="text-lg font-bold text-white tracking-tight">{label}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
            {vehicle.type}
          </span>
        </div>

        {/* AI Spec Search Bar */}
        <form onSubmit={handleAISearch} className="space-y-2">
          <div className="relative flex items-center">
            <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fetch specs with AI (e.g. Nexon EV, Prius)..."
              className={`w-full pl-10 pr-28 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none ${borderFocusClass} transition`}
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-950 transition cursor-pointer ${
                isEmerald
                  ? 'bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50'
                  : 'bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50'
              }`}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Fetch AI</span>
            </button>
          </div>
          {error && <p className="text-xs text-rose-400 pt-1">{error}</p>}
        </form>

        {/* Preset Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Presets:</span>
          <div className="relative flex-1">
            <select
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 pr-8 text-xs text-slate-200 focus:outline-none focus:border-slate-700 cursor-pointer"
            >
              <option value="">Select a preset vehicle...</option>
              <option value="TESLA_MODEL_3">Tesla Model 3 (BEV)</option>
              <option value="TOYOTA_CAMRY_HYBRID">Toyota Camry Hybrid</option>
              <option value="HONDA_CIVIC_PETROL">Honda Civic (Petrol)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Vehicle Overview Header */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Spec</span>
          <p className="text-base font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">
            {vehicle.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 transition cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Done' : 'Edit'}</span>
        </button>
      </div>

      {/* Metrics Grid / Manual Override */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Powertrain Type */}
        <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
            <Bot className="w-3.5 h-3.5 text-indigo-400" /> Type
          </span>
          {isEditing ? (
            <select
              value={vehicle.type}
              onChange={(e) => handleFieldChange('type', e.target.value as VehicleType)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="BEV">BEV (Electric)</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ICE_PETROL">ICE Petrol</option>
              <option value="ICE_DIESEL">ICE Diesel</option>
            </select>
          ) : (
            <p className="font-semibold text-slate-200">{vehicle.type}</p>
          )}
        </div>

        {/* Battery Capacity */}
        <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
            <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery (kWh)
          </span>
          {isEditing ? (
            <input
              type="number"
              value={vehicle.batteryKWh}
              onChange={(e) => handleFieldChange('batteryKWh', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            />
          ) : (
            <p className="font-semibold text-slate-200">
              {vehicle.batteryKWh > 0 ? `${vehicle.batteryKWh} kWh` : '0 kWh (ICE)'}
            </p>
          )}
        </div>

        {/* Efficiency */}
        <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
            <Gauge className="w-3.5 h-3.5 text-amber-400" /> Efficiency
          </span>
          {isEditing ? (
            <input
              type="number"
              step="0.1"
              value={vehicle.efficiencyKmPerUnit}
              onChange={(e) =>
                handleFieldChange('efficiencyKmPerUnit', parseFloat(e.target.value) || 1)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            />
          ) : (
            <p className="font-semibold text-slate-200">
              {vehicle.efficiencyKmPerUnit}{' '}
              <span className="text-[10px] text-slate-400">
                {vehicle.type === 'BEV' ? 'km/kWh' : 'km/L'}
              </span>
            </p>
          )}
        </div>

        {/* Weight */}
        <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
            <Scale className="w-3.5 h-3.5 text-blue-400" /> Weight (kg)
          </span>
          {isEditing ? (
            <input
              type="number"
              value={vehicle.curbWeightKg}
              onChange={(e) => handleFieldChange('curbWeightKg', parseInt(e.target.value) || 1000)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            />
          ) : (
            <p className="font-semibold text-slate-200">{vehicle.curbWeightKg.toLocaleString()} kg</p>
          )}
        </div>

        {/* Base Mfg CO2 */}
        <div className="col-span-2 bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
            <Cpu className="w-3.5 h-3.5 text-teal-400" /> Chassis Mfg Carbon (kg CO2e)
          </span>
          {isEditing ? (
            <input
              type="number"
              value={vehicle.baselineManufacturingCO2Kg}
              onChange={(e) =>
                handleFieldChange('baselineManufacturingCO2Kg', parseInt(e.target.value) || 5000)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            />
          ) : (
            <p className="font-semibold text-slate-200">
              {vehicle.baselineManufacturingCO2Kg.toLocaleString()} kg CO2e
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
