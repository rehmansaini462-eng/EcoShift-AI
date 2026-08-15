'use client';

import React from 'react';
import { LCAResult, VehicleSpec } from '@/types/vehicle';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface EmissionBreakdownBarChartProps {
  lcaResult: LCAResult;
  vehicleA: VehicleSpec;
  vehicleB: VehicleSpec;
}

export default function EmissionBreakdownBarChart({
  lcaResult,
  vehicleA,
  vehicleB,
}: EmissionBreakdownBarChartProps) {
  const { vehicleA_Breakdown, vehicleB_Breakdown } = lcaResult;

  const barData = [
    {
      name: vehicleA.name,
      manufacturing: Number((vehicleA_Breakdown.manufacturing / 1000).toFixed(2)),
      operational: Number((vehicleA_Breakdown.operational / 1000).toFixed(2)),
      total: Number((vehicleA_Breakdown.total / 1000).toFixed(2)),
    },
    {
      name: vehicleB.name,
      manufacturing: Number((vehicleB_Breakdown.manufacturing / 1000).toFixed(2)),
      operational: Number((vehicleB_Breakdown.operational / 1000).toFixed(2)),
      total: Number((vehicleB_Breakdown.total / 1000).toFixed(2)),
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const mfg = payload.find((p: any) => p.dataKey === 'manufacturing')?.value || 0;
      const ops = payload.find((p: any) => p.dataKey === 'operational')?.value || 0;
      const total = (mfg + ops).toFixed(2);

      return (
        <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl space-y-1.5 text-xs">
          <p className="font-bold text-white border-b border-slate-800 pb-1">{label}</p>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span>Manufacturing:</span>
            <span className="font-semibold">{mfg} tonnes</span>
          </div>
          <div className="flex justify-between gap-4 text-cyan-400">
            <span>Operational Driving:</span>
            <span className="font-semibold">{ops} tonnes</span>
          </div>
          <div className="flex justify-between gap-4 text-white font-bold border-t border-slate-800 pt-1">
            <span>Total Lifecycle:</span>
            <span>{total} tonnes</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Manufacturing vs Operational CO2 Stacked Breakdown
          </h3>
          <p className="text-xs text-slate-400">
            Compare initial embodied carbon (chassis + battery) against lifetime tailpipe/grid operational carbon.
          </p>
        </div>
      </div>

      {/* Recharts Stacked Bar Chart */}
      <div className="w-full h-[360px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
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
                  {value === 'manufacturing' ? 'Embodied Manufacturing CO2' : 'Operational Driving CO2'}
                </span>
              )}
            />
            <Bar dataKey="manufacturing" name="manufacturing" stackId="a" fill="#059669" radius={[0, 0, 4, 4]} />
            <Bar dataKey="operational" name="operational" stackId="a" fill="#0284c7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
