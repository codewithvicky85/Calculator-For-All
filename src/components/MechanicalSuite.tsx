/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalculationHistoryItem } from '../types';
import { Gauge, Activity, Waves, Flame, Cog, Check, Copy } from 'lucide-react';

interface MechanicalSuiteProps {
  onAddHistory: (item: CalculationHistoryItem) => void;
  initialSubTool?: string;
}

export const MechanicalSuite: React.FC<MechanicalSuiteProps> = ({
  onAddHistory,
  initialSubTool = 'beam',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTool);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyVal = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // ----------------------------------------------------
  // 1. BEAM DEFLECTION STATE
  // ----------------------------------------------------
  const [beamSupport, setBeamSupport] = useState<'simply_supported' | 'cantilever'>('simply_supported');
  const [beamLoadType, setBeamLoadType] = useState<'point' | 'udl'>('point');
  const [beamSpan, setBeamSpan] = useState<number>(4.0); // m
  const [beamLoad, setBeamLoad] = useState<number>(45.0); // kN or kN/m
  const [beamSectionType, setBeamSectionType] = useState<'rect' | 'circle' | 'custom'>('rect');
  const [beamWidth, setBeamWidth] = useState<number>(120); // mm
  const [beamHeight, setBeamHeight] = useState<number>(250); // mm
  const [beamDiameter, setBeamDiameter] = useState<number>(150); // mm
  const [beamCustomI, setBeamCustomI] = useState<number>(1.5625e-4); // m^4
  const [beamCustomC, setBeamCustomC] = useState<number>(0.125); // m
  const [beamE, setBeamE] = useState<number>(200); // GPa

  // Beam calculations
  let I_val = 0;
  let c_val = 0;
  if (beamSectionType === 'rect') {
    const b_m = beamWidth / 1000;
    const h_m = beamHeight / 1000;
    I_val = (b_m * Math.pow(h_m, 3)) / 12;
    c_val = h_m / 2;
  } else if (beamSectionType === 'circle') {
    const d_m = beamDiameter / 1000;
    I_val = (Math.PI * Math.pow(d_m, 4)) / 64;
    c_val = d_m / 2;
  } else {
    I_val = beamCustomI;
    c_val = beamCustomC;
  }

  const E_pa = beamE * 1e9;
  const P_newtons = beamLoad * 1e3; // N or N/m
  const L = Math.max(0.01, beamSpan);

  let M_max = 0; // N·m
  let V_max = 0; // N
  let delta_max = 0; // m

  if (beamSupport === 'simply_supported') {
    if (beamLoadType === 'point') {
      M_max = (P_newtons * L) / 4;
      V_max = P_newtons / 2;
      delta_max = (P_newtons * Math.pow(L, 3)) / (48 * E_pa * I_val);
    } else {
      M_max = (P_newtons * Math.pow(L, 2)) / 8;
      V_max = (P_newtons * L) / 2;
      delta_max = (5 * P_newtons * Math.pow(L, 4)) / (384 * E_pa * I_val);
    }
  } else {
    // Cantilever
    if (beamLoadType === 'point') {
      M_max = P_newtons * L;
      V_max = P_newtons;
      delta_max = (P_newtons * Math.pow(L, 3)) / (3 * E_pa * I_val);
    } else {
      M_max = (P_newtons * Math.pow(L, 2)) / 2;
      V_max = P_newtons * L;
      delta_max = (P_newtons * Math.pow(L, 4)) / (8 * E_pa * I_val);
    }
  }

  const sigma_max_pa = I_val > 0 ? (M_max * c_val) / I_val : 0;
  const sigma_max_mpa = sigma_max_pa / 1e6;
  const delta_max_mm = delta_max * 1000;
  const M_max_knm = M_max / 1000;
  const V_max_kn = V_max / 1000;

  // ----------------------------------------------------
  // 2. MOHR'S CIRCLE STATE
  // ----------------------------------------------------
  const [sigmaX, setSigmaX] = useState<number>(90); // MPa
  const [sigmaY, setSigmaY] = useState<number>(30); // MPa
  const [tauXY, setTauXY] = useState<number>(40); // MPa

  const sigma_avg = (sigmaX + sigmaY) / 2;
  const mohr_R = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));
  const sigma1 = sigma_avg + mohr_R;
  const sigma2 = sigma_avg - mohr_R;
  const tau_max = mohr_R;
  const theta_p_deg = (0.5 * Math.atan2(2 * tauXY, sigmaX - sigmaY) * 180) / Math.PI;

  // ----------------------------------------------------
  // 3. PIPE FLOW & REYNOLDS
  // ----------------------------------------------------
  const [pipeDiameter, setPipeDiameter] = useState<number>(100); // mm
  const [pipeLength, setPipeLength] = useState<number>(50); // m
  const [pipeVelocity, setPipeVelocity] = useState<number>(2.5); // m/s
  const [fluidDensity, setFluidDensity] = useState<number>(998.2); // kg/m3 (water)
  const [fluidViscosity, setFluidViscosity] = useState<number>(0.001002); // Pa.s
  const [pipeRoughness, setPipeRoughness] = useState<number>(0.045); // mm (commercial steel)

  const D_m = pipeDiameter / 1000;
  const eps_m = pipeRoughness / 1000;
  const Re = (fluidDensity * pipeVelocity * D_m) / fluidViscosity;
  const g_const = 9.80665;

  let f_darcy = 0;
  let flowRegime = 'Laminar';
  if (Re < 2300) {
    flowRegime = 'Laminar (Re < 2,300)';
    f_darcy = 64 / Math.max(1, Re);
  } else if (Re <= 4000) {
    flowRegime = 'Transitional (2,300 ≤ Re ≤ 4,000)';
    // Interpolation estimate
    f_darcy = 0.035;
  } else {
    flowRegime = 'Turbulent (Re > 4,000)';
    // Haaland approximation for Darcy friction factor
    const term = Math.pow((eps_m / D_m) / 3.7, 1.11) + 6.9 / Re;
    const inv_sqrt_f = -1.8 * Math.log10(term);
    f_darcy = Math.pow(1 / inv_sqrt_f, 2);
  }

  const headLoss_m = f_darcy * (pipeLength / D_m) * (Math.pow(pipeVelocity, 2) / (2 * g_const));
  const deltaP_kpa = (fluidDensity * g_const * headLoss_m) / 1000;
  const flowRate_Lps = (Math.PI * Math.pow(D_m / 2, 2) * pipeVelocity) * 1000;

  // ----------------------------------------------------
  // 4. THERMODYNAMICS: CARNOT & OTTO
  // ----------------------------------------------------
  const [carnotThot, setCarnotThot] = useState<number>(550); // °C
  const [carnotTcold, setCarnotTcold] = useState<number>(30); // °C
  const [ottoCR, setOttoCR] = useState<number>(9.5); // compression ratio r
  const [ottoGamma, setOttoGamma] = useState<number>(1.4); // ratio of specific heats

  const Th_K = carnotThot + 273.15;
  const Tc_K = carnotTcold + 273.15;
  const carnotEff = Th_K > Tc_K ? (1 - Tc_K / Th_K) * 100 : 0;
  const ottoEff = (1 - 1 / Math.pow(ottoCR, ottoGamma - 1)) * 100;

  // ----------------------------------------------------
  // 5. GEAR TRAIN
  // ----------------------------------------------------
  const [gearN1, setGearN1] = useState<number>(20); // teeth
  const [gearN2, setGearN2] = useState<number>(60); // teeth
  const [gearRPM1, setGearRPM1] = useState<number>(1800); // RPM
  const [gearPowerKW, setGearPowerKW] = useState<number>(15); // kW

  const gearRatio = gearN2 / Math.max(1, gearN1);
  const gearRPM2 = gearRPM1 / Math.max(0.001, gearRatio);
  const torque1_Nm = (9550 * gearPowerKW) / Math.max(1, gearRPM1);
  const torque2_Nm = torque1_Nm * gearRatio;

  return (
    <div className="space-y-6">
      {/* Sub-tool Selection Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { id: 'beam', label: 'Beam Deflection & Stress', icon: Gauge },
          { id: 'mohr', label: "Mohr's Circle & Stresses", icon: Activity },
          { id: 'flow', label: 'Pipe Flow & Darcy-Weisbach', icon: Waves },
          { id: 'thermo', label: 'Carnot & Otto Cycles', icon: Flame },
          { id: 'gear', label: 'Gear Train & Torques', icon: Cog },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 1: BEAM DEFLECTION */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'beam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Beam Geometry & Loading Configuration
            </h3>

            {/* Support Type & Load Type */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">SUPPORT TYPE</label>
                <select
                  value={beamSupport}
                  onChange={(e) => setBeamSupport(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="simply_supported">Simply Supported</option>
                  <option value="cantilever">Cantilever (Fixed-Free)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">LOAD PATTERN</label>
                <select
                  value={beamLoadType}
                  onChange={(e) => setBeamLoadType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="point">
                    {beamSupport === 'simply_supported' ? 'Center Point Load (P)' : 'End Point Load (P)'}
                  </option>
                  <option value="udl">Uniform Distributed Load (w)</option>
                </select>
              </div>
            </div>

            {/* Inputs: Span & Load */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  SPAN LENGTH (L) [m]
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={beamSpan}
                  onChange={(e) => setBeamSpan(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  {beamLoadType === 'point' ? 'LOAD (P) [kN]' : 'DISTRIBUTED (w) [kN/m]'}
                </label>
                <input
                  type="number"
                  step="1"
                  value={beamLoad}
                  onChange={(e) => setBeamLoad(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Cross Section Helper */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                CROSS-SECTION PROFILE
              </label>
              <div className="flex gap-2 mb-3">
                {[
                  { id: 'rect', label: 'Rectangular' },
                  { id: 'circle', label: 'Circular' },
                  { id: 'custom', label: 'Direct I' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBeamSectionType(s.id as any)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      beamSectionType === s.id
                        ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {beamSectionType === 'rect' ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">WIDTH (b) [mm]</label>
                    <input
                      type="number"
                      value={beamWidth}
                      onChange={(e) => setBeamWidth(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">HEIGHT (h) [mm]</label>
                    <input
                      type="number"
                      value={beamHeight}
                      onChange={(e) => setBeamHeight(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              ) : beamSectionType === 'circle' ? (
                <div className="text-xs">
                  <label className="block text-slate-400 mb-1 font-mono">DIAMETER (d) [mm]</label>
                  <input
                    type="number"
                    value={beamDiameter}
                    onChange={(e) => setBeamDiameter(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">MOMENT I [m⁴]</label>
                    <input
                      type="number"
                      step="1e-6"
                      value={beamCustomI}
                      onChange={(e) => setBeamCustomI(parseFloat(e.target.value) || 1e-6)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">DIST TO EXTREME c [m]</label>
                    <input
                      type="number"
                      step="0.01"
                      value={beamCustomC}
                      onChange={(e) => setBeamCustomC(parseFloat(e.target.value) || 0.01)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modulus E & Presets */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400 font-mono">MODULUS OF ELASTICITY (E) [GPa]</label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    onClick={() => setBeamE(200)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Steel (200)
                  </button>
                  <button
                    onClick={() => setBeamE(68.9)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Al (68.9)
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={beamE}
                onChange={(e) => setBeamE(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs"
              />
            </div>

            {/* Record to ledger action */}
            <button
              onClick={() => {
                onAddHistory({
                  id: 'beam-' + Date.now(),
                  expression: `Beam Deflection (${beamSupport}, L=${beamSpan}m, Load=${beamLoad}kN)`,
                  result: `δ_max=${delta_max_mm.toFixed(3)} mm, M_max=${M_max_knm.toFixed(2)} kN·m, σ_max=${sigma_max_mpa.toFixed(2)} MPa`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Mechanical',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              Log Result to Calculation Ledger
            </button>
          </div>

          {/* Results & Interactive Diagram Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Metric Displays */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  MAX DEFLECTION
                </div>
                <div className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                  {delta_max_mm.toFixed(3)}{' '}
                  <span className="text-xs text-slate-500 font-normal">mm</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  L / {Math.round((beamSpan * 1000) / Math.max(0.001, delta_max_mm))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  MAX BENDING STRESS
                </div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {sigma_max_mpa.toFixed(2)}{' '}
                  <span className="text-xs text-slate-500 font-normal">MPa</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  σ = (M · c) / I
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  MAX MOMENT
                </div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {M_max_knm.toFixed(2)}{' '}
                  <span className="text-xs text-slate-500 font-normal">kN·m</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {M_max.toFixed(0)} N·m
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  MAX SHEAR FORCE
                </div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {V_max_kn.toFixed(2)}{' '}
                  <span className="text-xs text-slate-500 font-normal">kN</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {V_max.toFixed(0)} N
                </div>
              </div>
            </div>

            {/* Interactive SVG Beam Loading Diagram */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>Beam Structural Model & Internal Reaction Diagram</span>
                <span className="text-slate-500 font-mono">
                  I = {(I_val * 1e8).toFixed(1)} × 10⁻⁸ m⁴
                </span>
              </div>

              <svg viewBox="0 0 600 210" className="w-full bg-slate-950 rounded-lg p-2 border border-slate-850">
                {/* Baseline beam rectangle */}
                <rect x="70" y="55" width="460" height="18" fill="#334155" stroke="#475569" strokeWidth="1.5" rx="2" />

                {/* Supports */}
                {beamSupport === 'simply_supported' ? (
                  <>
                    {/* Pin support left */}
                    <polygon points="70,73 60,93 80,93" fill="#f59e0b" opacity="0.9" />
                    <line x1="55" y1="94" x2="85" y2="94" stroke="#94a3b8" strokeWidth="2" />
                    {/* Roller support right */}
                    <polygon points="530,73 520,93 540,93" fill="#f59e0b" opacity="0.9" />
                    <circle cx="525" cy="98" r="3" fill="#94a3b8" />
                    <circle cx="535" cy="98" r="3" fill="#94a3b8" />
                    <line x1="515" y1="103" x2="545" y2="103" stroke="#94a3b8" strokeWidth="2" />
                  </>
                ) : (
                  <>
                    {/* Cantilever fixed wall on left */}
                    <rect x="58" y="30" width="12" height="70" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                    <line x1="58" y1="35" x2="50" y2="45" stroke="#64748b" strokeWidth="2" />
                    <line x1="58" y1="50" x2="50" y2="60" stroke="#64748b" strokeWidth="2" />
                    <line x1="58" y1="65" x2="50" y2="75" stroke="#64748b" strokeWidth="2" />
                    <line x1="58" y1="80" x2="50" y2="90" stroke="#64748b" strokeWidth="2" />
                  </>
                )}

                {/* Load representations */}
                {beamLoadType === 'point' ? (
                  beamSupport === 'simply_supported' ? (
                    /* Center point load arrow */
                    <g transform="translate(300, 20)">
                      <line x1="0" y1="0" x2="0" y2="33" stroke="#f43f5e" strokeWidth="3" markerEnd="url(#arrow)" />
                      <polygon points="0,35 -6,22 6,22" fill="#f43f5e" />
                      <text x="8" y="18" fill="#fda4af" fontSize="12" fontFamily="monospace">
                        P = {beamLoad} kN
                      </text>
                    </g>
                  ) : (
                    /* End point load arrow on cantilever right */
                    <g transform="translate(530, 20)">
                      <line x1="0" y1="0" x2="0" y2="33" stroke="#f43f5e" strokeWidth="3" />
                      <polygon points="0,35 -6,22 6,22" fill="#f43f5e" />
                      <text x="-95" y="18" fill="#fda4af" fontSize="12" fontFamily="monospace">
                        P = {beamLoad} kN
                      </text>
                    </g>
                  )
                ) : (
                  /* UDL multiple small arrows across span */
                  <g>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                      const xPos = 80 + idx * 60;
                      return (
                        <g key={idx} transform={`translate(${xPos}, 30)`}>
                          <line x1="0" y1="0" x2="0" y2="23" stroke="#f43f5e" strokeWidth="1.5" />
                          <polygon points="0,25 -4,16 4,16" fill="#f43f5e" />
                        </g>
                      );
                    })}
                    <line x1="75" y1="30" x2="525" y2="30" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" />
                    <text x="250" y="24" fill="#fda4af" fontSize="11" fontFamily="monospace">
                      w = {beamLoad} kN/m
                    </text>
                  </g>
                )}

                {/* Qualitative Deflection Curve */}
                <path
                  d={
                    beamSupport === 'simply_supported'
                      ? 'M 70 64 Q 300 84 530 64'
                      : 'M 70 64 Q 300 68 530 92'
                  }
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <text x="310" y="105" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                  δ_max = {delta_max_mm.toFixed(2)} mm
                </text>

                {/* Span dimension ruler */}
                <line x1="70" y1="130" x2="530" y2="130" stroke="#64748b" strokeWidth="1" />
                <line x1="70" y1="125" x2="70" y2="135" stroke="#64748b" strokeWidth="1" />
                <line x1="530" y1="125" x2="530" y2="135" stroke="#64748b" strokeWidth="1" />
                <text x="270" y="145" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  L = {beamSpan} m
                </text>

                {/* Shear & Moment summary tags */}
                <rect x="70" y="165" width="220" height="32" rx="4" fill="#0f172a" stroke="#1e293b" />
                <text x="80" y="185" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  Max Moment: <tspan fill="#f59e0b" fontWeight="bold">{M_max_knm.toFixed(2)} kN·m</tspan>
                </text>

                <rect x="310" y="165" width="220" height="32" rx="4" fill="#0f172a" stroke="#1e293b" />
                <text x="320" y="185" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  Max Shear: <tspan fill="#38bdf8" fontWeight="bold">{V_max_kn.toFixed(2)} kN</tspan>
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 2: MOHR'S CIRCLE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'mohr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              2D Plane Stress State Components
            </h3>
            <p className="text-xs text-slate-400">
              Enter the normal stresses along X and Y axes and the in-plane shear stress acting on the differential element.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  NORMAL STRESS σ_x [MPa] (Tension + / Compression -)
                </label>
                <input
                  type="number"
                  value={sigmaX}
                  onChange={(e) => setSigmaX(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  NORMAL STRESS σ_y [MPa]
                </label>
                <input
                  type="number"
                  value={sigmaY}
                  onChange={(e) => setSigmaY(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  SHEAR STRESS τ_xy [MPa]
                </label>
                <input
                  type="number"
                  value={tauXY}
                  onChange={(e) => setTauXY(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">SAMPLE LOADINGS:</span>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <button
                  onClick={() => { setSigmaX(90); setSigmaY(30); setTauXY(40); }}
                  className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-300 hover:text-white"
                >
                  Pressure Vessel (90, 30, 40)
                </button>
                <button
                  onClick={() => { setSigmaX(0); setSigmaY(0); setTauXY(60); }}
                  className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-300 hover:text-white"
                >
                  Pure Shear (0, 0, 60)
                </button>
                <button
                  onClick={() => { setSigmaX(120); setSigmaY(-50); setTauXY(35); }}
                  className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-300 hover:text-white"
                >
                  Biaxial Bending (120, -50, 35)
                </button>
                <button
                  onClick={() => { setSigmaX(80); setSigmaY(80); setTauXY(0); }}
                  className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-300 hover:text-white"
                >
                  Hydrostatic (80, 80, 0)
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'mohr-' + Date.now(),
                  expression: `Mohr's Circle (σx=${sigmaX}, σy=${sigmaY}, τxy=${tauXY})`,
                  result: `σ₁=${sigma1.toFixed(1)} MPa, σ₂=${sigma2.toFixed(1)} MPa, τ_max=${tau_max.toFixed(1)} MPa, θ_p=${theta_p_deg.toFixed(2)}°`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Mechanical',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          {/* Mohr Circle Visualizer & Results */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">MAJOR PRINCIPAL σ₁</div>
                <div className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                  {sigma1.toFixed(1)} <span className="text-xs text-slate-500 font-normal">MPa</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">MINOR PRINCIPAL σ₂</div>
                <div className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                  {sigma2.toFixed(1)} <span className="text-xs text-slate-500 font-normal">MPa</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">MAX IN-PLANE SHEAR τ_max</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {tau_max.toFixed(1)} <span className="text-xs text-slate-500 font-normal">MPa</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">PRINCIPAL ANGLE θ_p</div>
                <div className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                  {theta_p_deg.toFixed(1)}°
                </div>
              </div>
            </div>

            {/* Interactive SVG Mohr's Circle Canvas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Mohr's Circle Graphic Representation</span>
                <span className="font-mono text-slate-500">Center: ({sigma_avg.toFixed(1)}, 0) | R: {mohr_R.toFixed(1)}</span>
              </div>

              {/* Dynamic SVG drawing calibrated around sigma_avg and radius */}
              {(() => {
                const maxRange = Math.max(Math.abs(sigma1), Math.abs(sigma2), tau_max, 10) * 1.35;
                const svgW = 540;
                const svgH = 320;
                const cx = svgW / 2;
                const cy = svgH / 2;
                const scale = (svgW * 0.42) / Math.max(1, maxRange);

                // Coordinates for points
                const circleCenterPixelX = cx + (sigma_avg * scale);
                const circleRadiusPixels = Math.max(2, mohr_R * scale);

                const ptX_x = cx + (sigmaX * scale);
                const ptX_y = cy - (-tauXY * scale); // in Mohr convention, tau is downward or upward

                const ptY_x = cx + (sigmaY * scale);
                const ptY_y = cy - (tauXY * scale);

                return (
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full bg-slate-950 rounded-lg border border-slate-850">
                    {/* Background Grid */}
                    <line x1="20" y1={cy} x2={svgW - 20} y2={cy} stroke="#334155" strokeWidth="1.5" />
                    <line x1={cx} y1="20" x2={cx} y2={svgH - 20} stroke="#334155" strokeWidth="1.5" />

                    {/* Axis Labels */}
                    <text x={svgW - 40} y={cy - 8} fill="#94a3b8" fontSize="11" fontFamily="monospace">σ (Normal)</text>
                    <text x={cx + 8} y="32" fill="#94a3b8" fontSize="11" fontFamily="monospace">τ (Shear)</text>

                    {/* Mohr Circle */}
                    <circle
                      cx={circleCenterPixelX}
                      cy={cy}
                      r={circleRadiusPixels}
                      fill="rgba(245, 158, 11, 0.08)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />

                    {/* Diameter line connecting state (sigma_x, -tau_xy) and (sigma_y, tau_xy) */}
                    <line x1={ptX_x} y1={ptX_y} x2={ptY_x} y2={ptY_y} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Center Point */}
                    <circle cx={circleCenterPixelX} cy={cy} r="4" fill="#f59e0b" />
                    <text x={circleCenterPixelX - 14} y={cy + 18} fill="#f59e0b" fontSize="10" fontFamily="monospace">
                      C ({sigma_avg.toFixed(0)})
                    </text>

                    {/* Principal Stress 1 Point */}
                    <circle cx={cx + (sigma1 * scale)} cy={cy} r="5" fill="#10b981" />
                    <text x={cx + (sigma1 * scale) - 15} y={cy - 10} fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      σ₁={sigma1.toFixed(0)}
                    </text>

                    {/* Principal Stress 2 Point */}
                    <circle cx={cx + (sigma2 * scale)} cy={cy} r="5" fill="#10b981" />
                    <text x={cx + (sigma2 * scale) - 20} y={cy - 10} fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      σ₂={sigma2.toFixed(0)}
                    </text>

                    {/* State X Point */}
                    <circle cx={ptX_x} cy={ptX_y} r="4" fill="#38bdf8" />
                    <text x={ptX_x + 6} y={ptX_y - 4} fill="#7dd3fc" fontSize="10" fontFamily="monospace">
                      X({sigmaX}, {-tauXY})
                    </text>

                    {/* State Y Point */}
                    <circle cx={ptY_x} cy={ptY_y} r="4" fill="#38bdf8" />
                    <text x={ptY_x + 6} y={ptY_y - 4} fill="#7dd3fc" fontSize="10" fontFamily="monospace">
                      Y({sigmaY}, {tauXY})
                    </text>
                  </svg>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 3: PIPE FLOW */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'flow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Pipe & Fluid Parameters (Darcy-Weisbach)
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">DIAMETER (D) [mm]</label>
                <input
                  type="number"
                  value={pipeDiameter}
                  onChange={(e) => setPipeDiameter(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">LENGTH (L) [m]</label>
                <input
                  type="number"
                  value={pipeLength}
                  onChange={(e) => setPipeLength(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1 font-mono">FLOW VELOCITY (v) [m/s]</label>
              <input
                type="number"
                step="0.1"
                value={pipeVelocity}
                onChange={(e) => setPipeVelocity(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>

            {/* Fluid Presets */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>FLUID PRESET:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setFluidDensity(998.2); setFluidViscosity(0.001002); }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Water (20°C)
                  </button>
                  <button
                    onClick={() => { setFluidDensity(1.204); setFluidViscosity(1.81e-5); }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Air (20°C)
                  </button>
                  <button
                    onClick={() => { setFluidDensity(880); setFluidViscosity(0.29); }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    SAE 30 Oil
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1 font-mono">DENSITY ρ [kg/m³]</label>
                  <input
                    type="number"
                    value={fluidDensity}
                    onChange={(e) => setFluidDensity(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-mono">VISCOSITY μ [Pa·s]</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={fluidViscosity}
                    onChange={(e) => setFluidViscosity(parseFloat(e.target.value) || 1e-5)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Roughness */}
            <div className="pt-2 border-t border-slate-800 text-xs">
              <label className="block text-slate-400 mb-1 font-mono">PIPE ROUGHNESS ε [mm]</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={pipeRoughness}
                  onChange={(e) => setPipeRoughness(parseFloat(e.target.value) || 0.001)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <button
                  onClick={() => setPipeRoughness(0.045)}
                  className="whitespace-nowrap px-2 py-1.5 bg-slate-800 text-slate-300 rounded text-[11px]"
                >
                  Steel (0.045)
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'flow-' + Date.now(),
                  expression: `Pipe Flow (D=${pipeDiameter}mm, v=${pipeVelocity}m/s, L=${pipeLength}m)`,
                  result: `Re=${Math.round(Re)}, f=${f_darcy.toFixed(4)}, Head Loss=${headLoss_m.toFixed(2)}m, ΔP=${deltaP_kpa.toFixed(1)} kPa`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Mechanical',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">REYNOLDS NUMBER (Re)</div>
                <div className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                  {Math.round(Re).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{flowRegime}</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">FRICTION FACTOR (f)</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {f_darcy.toFixed(4)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Haaland Formula</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">HEAD LOSS (h_f)</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {headLoss_m.toFixed(2)} <span className="text-xs text-slate-500 font-normal">m</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">h_f = f(L/D)(v²/2g)</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">PRESSURE DROP (ΔP)</div>
                <div className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                  {deltaP_kpa.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kPa</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{(deltaP_kpa / 100).toFixed(3)} bar</div>
              </div>
            </div>

            {/* Velocity & Discharge Summary */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-semibold text-slate-300">Hydraulic Pipe Flow Summary</span>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-850">
                  <div className="text-slate-500">Volumetric Discharge (Q):</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    {flowRate_Lps.toFixed(2)} L/s ({(flowRate_Lps / 1000).toFixed(4)} m³/s)
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-850">
                  <div className="text-slate-500">Relative Roughness (ε / D):</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    {(eps_m / D_m).toExponential(3)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 4: THERMODYNAMICS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'thermo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carnot Cycle Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                Carnot Heat Engine Thermal Efficiency
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                η = 1 - T_C / T_H
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">HOT RESERVOIR T_H [°C]</label>
                <input
                  type="number"
                  value={carnotThot}
                  onChange={(e) => setCarnotThot(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                  = {Th_K.toFixed(1)} K
                </span>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">COLD RESERVOIR T_C [°C]</label>
                <input
                  type="number"
                  value={carnotTcold}
                  onChange={(e) => setCarnotTcold(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                  = {Tc_K.toFixed(1)} K
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
              <div className="text-xs text-slate-400 font-mono">MAXIMUM THEORETICAL EFFICIENCY</div>
              <div className="text-3xl font-mono font-bold text-amber-400 tabular-nums">
                {carnotEff.toFixed(2)} %
              </div>
              <p className="text-[11px] text-slate-500">
                No real heat engine operating between {Th_K.toFixed(0)} K and {Tc_K.toFixed(0)} K can exceed this thermodynamic ceiling.
              </p>
            </div>
          </div>

          {/* Otto Cycle Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                Otto Cycle (Gasoline Engine) Efficiency
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                η = 1 - 1 / r^(γ-1)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">COMPRESSION RATIO (r)</label>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="25"
                  value={ottoCR}
                  onChange={(e) => setOttoCR(parseFloat(e.target.value) || 2)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">HEAT CAPACITY RATIO (γ)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ottoGamma}
                  onChange={(e) => setOttoGamma(parseFloat(e.target.value) || 1.4)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">γ = 1.4 for air</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
              <div className="text-xs text-slate-400 font-mono">AIR-STANDARD OTTO EFFICIENCY</div>
              <div className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">
                {ottoEff.toFixed(2)} %
              </div>
              <p className="text-[11px] text-slate-500">
                At r = {ottoCR}, thermal efficiency gains diminish above r = 12 while knocking / auto-ignition risk rises sharply.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 5: GEAR TRAIN */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'gear' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Gear Train & Power Transmission Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">PINION TEETH (N₁)</label>
                <input
                  type="number"
                  min="5"
                  value={gearN1}
                  onChange={(e) => setGearN1(parseInt(e.target.value) || 5)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">DRIVEN GEAR TEETH (N₂)</label>
                <input
                  type="number"
                  min="5"
                  value={gearN2}
                  onChange={(e) => setGearN2(parseInt(e.target.value) || 5)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">INPUT SPEED (ω₁) [RPM]</label>
                <input
                  type="number"
                  value={gearRPM1}
                  onChange={(e) => setGearRPM1(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">TRANSMITTED POWER [kW]</label>
                <input
                  type="number"
                  value={gearPowerKW}
                  onChange={(e) => setGearPowerKW(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'gear-' + Date.now(),
                  expression: `Gear Train (N₁=${gearN1}, N₂=${gearN2}, P=${gearPowerKW}kW)`,
                  result: `Ratio=${gearRatio.toFixed(2)}, Output RPM=${gearRPM2.toFixed(1)}, Torque Out=${torque2_Nm.toFixed(1)} N·m`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Mechanical',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Output Speed & Torque Multiplying Factors
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-500 font-mono">GEAR RATIO (N₂/N₁)</span>
                <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                  {gearRatio.toFixed(2)} : 1
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-500 font-mono">OUTPUT SPEED (ω₂)</span>
                <div className="text-2xl font-mono font-bold text-slate-100 mt-1">
                  {gearRPM2.toFixed(1)} <span className="text-xs text-slate-400 font-normal">RPM</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-500 font-mono">INPUT TORQUE (T₁)</span>
                <div className="text-2xl font-mono font-bold text-slate-100 mt-1">
                  {torque1_Nm.toFixed(1)} <span className="text-xs text-slate-400 font-normal">N·m</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-500 font-mono">OUTPUT TORQUE (T₂)</span>
                <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
                  {torque2_Nm.toFixed(1)} <span className="text-xs text-slate-400 font-normal">N·m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
