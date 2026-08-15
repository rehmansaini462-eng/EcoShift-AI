'use client';

import React from 'react';
import { LCAResult, VehicleSpec } from '@/types/vehicle';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Target } from 'lucide-react';

interface BreakEvenLineChartProps {
  lcaResult: LCAResult;
  vehicleA: VehicleSpec;
  vehicleB: VehicleSpec;
}

export default function BreakEvenLineChart({
  lcaResult,
  vehicleA,
  vehicleB,
}: BreakEvenLineChartProps) {
  const { dataPoints, breakevenYear, breakevenKm } = lcaResult;

  // Format data for Recharts (convert kg to Tonnes for cleaner axis readability)
  const chartData = dataPoints.map((point) => ({
    year: `Yr ${point.year}`,
    yearNum: point.year,
    mileage: `${(point.mileageKm / 1000).toFixed(0)}k km`,
    mileageKm: point.mileageKm,
    vehicleA_Tonnes: Number((point.vehicleA_TotalCO2Kg / 1000).toFixed(2)),
    vehicleB_Tonnes: Number((point.vehicleB_TotalCO2Kg / 1000).toFixed(2)),
  }));

  // Custom Tooltip Renderer
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl space-y-1.5 text-xs">
          <p className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between gap-4">
            <span>{label}</span>
            <span className="text-slate-400 font-normal">{data.mileage}</span>
          </p>
          <div className="flex items-center justify-between gap-4 text-emerald-400 font-semibold">
            <span>{vehicleA.name}:</span>
            <span>{data.vehicleA_Tonnes} tonnes CO2e</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-cyan-400 font-semibold">
            <span>{vehicleB.name}:</span>
            <span>{data.vehicleB_Tonnes} tonnes CO2e</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Lifecycle Cumulative Carbon Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Cradle-to-grave cumulative CO2e emissions (Tonnes) comparison over driving mileage.
            </p>
          </div>
        </div>

        {breakevenYear !== null && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-300 text-xs font-semibold">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>
              Parity: Year {breakevenYear} ({breakevenKm?.toLocaleString()} km)
            </span>
          </div>
        )}
      </div>

      {/* Recharts Line Chart Container */}
      <div className="w-full h-[360px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              unit=" t"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => (
                <span className="text-slate-300 font-medium">
                  {value === 'vehicleA_Tonnes' ? vehicleA.name : vehicleB.name}
                </span>
              )}
            />

            {/* Reference Line for Break-even Point */}
            {breakevenYear !== null && breakevenYear > 0 && (
              <ReferenceLine
                x={`Yr ${Math.round(breakevenYear)}`}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: `Carbon Parity ~Yr ${breakevenYear}`,
                  fill: '#34d399',
                  fontSize: 11,
                  position: 'top',
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="vehicleA_Tonnes"
              name="vehicleA_Tonnes"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 7, stroke: '#34d399', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="vehicleB_Tonnes"
              name="vehicleB_Tonnes"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ fill: '#38bdf8', r: 4 }}
              activeDot={{ r: 7, stroke: '#7dd3fc', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
