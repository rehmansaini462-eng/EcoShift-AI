'use client';

import React, { useState } from 'react';
import { AIAdvisorResponse } from '@/app/api/ai-advisor/route';
import { LCAResult, SimulationParams } from '@/types/vehicle';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Cpu,
  Factory,
  Globe2,
  Lightbulb,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AIGreenAdvisorProps {
  simulationResult: LCAResult;
  params: SimulationParams;
}

export default function AIGreenAdvisor({
  simulationResult,
  params,
}: AIGreenAdvisorProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [advisor, setAdvisor] = useState<AIAdvisorResponse | null>(null);

  const handleGenerateVerdict = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ simulationResult, params }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI verdict.');
      }

      setAdvisor(data.advisor);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error communicating with Gemini AI Advisor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border border-emerald-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">AI Green Climate Advisor</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Gemini 2.5 Synthesis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              One-click deep climate analysis evaluating grid coal sensitivity, battery manufacturing debts, and buyer recommendations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateVerdict}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Analyzing LCA Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{advisor ? 'Regenerate AI Verdict' : 'Generate AI Climate Verdict'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Unactivated Empty State */}
      {!advisor && !loading && (
        <div className="text-center py-8 px-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-3">
          <Brain className="w-10 h-10 text-emerald-400/50 mx-auto animate-bounce" />
          <h4 className="text-sm font-semibold text-slate-300">Ready for AI Climate Synthesis</h4>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Click <strong className="text-emerald-400">"Generate AI Climate Verdict"</strong> above to run an executive LLM analysis on your active vehicle comparison and grid parameters.
          </p>
        </div>
      )}

      {/* Active AI Verdict Display */}
      {advisor && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Verdict Banner */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 rounded-xl p-5 space-y-2 shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Executive Climate Verdict
            </span>
            <p className="text-base font-extrabold text-white leading-snug">
              {advisor.verdictTitle}
            </p>
          </div>

          {/* 3 Structured Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grid Sensitivity */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>Grid Sensitivity</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {advisor.gridSensitivityAnalysis}
              </p>
            </div>

            {/* Manufacturing Embodied Carbon */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Factory className="w-4 h-4" />
                <span>Manufacturing Carbon</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {advisor.manufacturingFootprintNote}
              </p>
            </div>

            {/* Actionable Buyer Recommendation */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>Recommendation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {advisor.actionableRecommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
