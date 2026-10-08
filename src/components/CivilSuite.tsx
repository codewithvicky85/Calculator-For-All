/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalculationHistoryItem } from '../types';
import { Building2, Waves, Mountain, Compass } from 'lucide-react';

interface CivilSuiteProps {
  onAddHistory: (item: CalculationHistoryItem) => void;
  initialSubTool?: string;
}

export const CivilSuite: React.FC<CivilSuiteProps> = ({
  onAddHistory,
  initialSubTool = 'concrete',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTool);

  // ----------------------------------------------------
  // 1. REINFORCED CONCRETE BEAM STATE
  // ----------------------------------------------------
  const [beamB, setBeamB] = useState<number>(300); // mm
  const [beamD, setBeamD] = useState<number>(500); // mm (effective depth)
  const [beamH, setBeamH] = useState<number>(560); // mm (total height)
  const [rebarAs, setRebarAs] = useState<number>(2000); // mm²
  const [concreteFc, setConcreteFc] = useState<number>(28); // MPa
  const [steelFy, setSteelFy] = useState<number>(420); // MPa

  // Concrete calculations (ACI 318 / EC2)
  const beta1 = concreteFc <= 28 ? 0.85 : Math.max(0.65, 0.85 - 0.05 * ((concreteFc - 28) / 7));
  const a_depth = (rebarAs * steelFy) / (0.85 * concreteFc * beamB); // mm
  const c_depth = a_depth / beta1; // mm
  const Mn_knm = (rebarAs * steelFy * (beamD - a_depth / 2)) / 1e6; // kN·m

  const epsilon_t = c_depth > 0 ? 0.003 * ((beamD - c_depth) / c_depth) : 0;
  let phi = 0.90;
  if (epsilon_t < 0.002) {
    phi = 0.65; // compression controlled
  } else if (epsilon_t < 0.005) {
    phi = 0.65 + (epsilon_t - 0.002) * (250 / 3);
  }
  const phiMn_knm = phi * Mn_knm;

  const rho = rebarAs / (beamB * beamD);
  const rho_min = (0.25 * Math.sqrt(concreteFc)) / steelFy;

  // ----------------------------------------------------
  // 2. OPEN CHANNEL FLOW (MANNING) STATE
  // ----------------------------------------------------
  const [channelShape, setChannelShape] = useState<'rect' | 'trapezoid' | 'triangle'>('trapezoid');
  const [channelB, setChannelB] = useState<number>(3.0); // m
  const [channelY, setChannelY] = useState<number>(1.2); // m
  const [channelZ, setChannelZ] = useState<number>(1.5); // side slope z:1
  const [channelSlope, setChannelSlope] = useState<number>(0.0016); // m/m
  const [channelN, setChannelN] = useState<number>(0.013); // finished concrete

  let areaA = 0;
  let perimP = 0;
  let topWidthT = 0;

  if (channelShape === 'rect') {
    areaA = channelB * channelY;
    perimP = channelB + 2 * channelY;
    topWidthT = channelB;
  } else if (channelShape === 'trapezoid') {
    areaA = (channelB + channelZ * channelY) * channelY;
    perimP = channelB + 2 * channelY * Math.sqrt(1 + Math.pow(channelZ, 2));
    topWidthT = channelB + 2 * channelZ * channelY;
  } else {
    // Triangular
    areaA = channelZ * Math.pow(channelY, 2);
    perimP = 2 * channelY * Math.sqrt(1 + Math.pow(channelZ, 2));
    topWidthT = 2 * channelZ * channelY;
  }

  const Rh = perimP > 0 ? areaA / perimP : 0;
  const flowV = (1 / channelN) * Math.pow(Rh, 2 / 3) * Math.pow(channelSlope, 0.5);
  const flowQ = areaA * flowV;
  const hydDepth = topWidthT > 0 ? areaA / topWidthT : 0;
  const froude = hydDepth > 0 ? flowV / Math.sqrt(9.80665 * hydDepth) : 0;

  // ----------------------------------------------------
  // 3. SOIL MECHANICS & BEARING CAPACITY
  // ----------------------------------------------------
  const [soilCohesion, setSoilCohesion] = useState<number>(15); // kPa
  const [soilGamma, setSoilGamma] = useState<number>(18.5); // kN/m³
  const [soilPhiDeg, setSoilPhiDeg] = useState<number>(28); // degrees
  const [footingB, setFootingB] = useState<number>(2.0); // m
  const [footingDf, setFootingDf] = useState<number>(1.5); // m
  const [safetyFactor, setSafetyFactor] = useState<number>(3.0);

  // Terzaghi bearing factors
  const phiRad = (soilPhiDeg * Math.PI) / 180;
  const a_tan = Math.tan((45 + soilPhiDeg / 2) * (Math.PI / 180));
  const N_q = Math.pow(a_tan, 2) * Math.exp(Math.PI * Math.tan(phiRad));
  const N_c = soilPhiDeg > 0 ? (N_q - 1) / Math.tan(phiRad) : 5.7;
  const N_gamma = 2 * (N_q + 1) * Math.tan(phiRad);

  const surchargeQ = soilGamma * footingDf;
  const q_ult = soilCohesion * N_c + surchargeQ * N_q + 0.5 * soilGamma * footingB * N_gamma;
  const q_all = q_ult / Math.max(1, safetyFactor);

  // ----------------------------------------------------
  // 4. HIGHWAY CURVE SURVEYING
  // ----------------------------------------------------
  const [curveDeltaDeg, setCurveDeltaDeg] = useState<number>(36); // degrees
  const [curveRadiusR, setCurveRadiusR] = useState<number>(300); // m

  const deltaRad = (curveDeltaDeg * Math.PI) / 180;
  const tangentT = curveRadiusR * Math.tan(deltaRad / 2);
  const lengthL = (Math.PI * curveRadiusR * curveDeltaDeg) / 180;
  const chordC = 2 * curveRadiusR * Math.sin(deltaRad / 2);
  const externalE = curveRadiusR * (1 / Math.cos(deltaRad / 2) - 1);
  const middleM = curveRadiusR * (1 - Math.cos(deltaRad / 2));

  return (
    <div className="space-y-6">
      {/* Sub-tool Selection Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { id: 'concrete', label: 'Reinforced Concrete Beam', icon: Building2 },
          { id: 'manning', label: "Manning's Open Channel Flow", icon: Waves },
          { id: 'soil', label: 'Soil Bearing Capacity (Terzaghi)', icon: Mountain },
          { id: 'survey', label: 'Highway Horizontal Curve', icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm'
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
      {/* SUB-TOOL 1: REINFORCED CONCRETE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'concrete' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Beam Section Geometry & Material Strengths
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">WIDTH (b) [mm]</label>
                <input
                  type="number"
                  value={beamB}
                  onChange={(e) => setBeamB(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">EFF. DEPTH (d)</label>
                <input
                  type="number"
                  value={beamD}
                  onChange={(e) => setBeamD(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">HEIGHT (h)</label>
                <input
                  type="number"
                  value={beamH}
                  onChange={(e) => setBeamH(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1 font-mono">
                TENSILE REBAR AREA (A_s) [mm²]
              </label>
              <input
                type="number"
                value={rebarAs}
                onChange={(e) => setRebarAs(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
              />
              <div className="flex gap-2 mt-1.5 text-[10px]">
                <button
                  onClick={() => setRebarAs(3 * 387)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  3 #22 (1161 mm²)
                </button>
                <button
                  onClick={() => setRebarAs(4 * 500)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  4 #25 (2000 mm²)
                </button>
                <button
                  onClick={() => setRebarAs(4 * 700)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  4 #30 (2800 mm²)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">CONCRETE f'c [MPa]</label>
                <input
                  type="number"
                  value={concreteFc}
                  onChange={(e) => setConcreteFc(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">STEEL YIELD f_y [MPa]</label>
                <input
                  type="number"
                  value={steelFy}
                  onChange={(e) => setSteelFy(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'concrete-' + Date.now(),
                  expression: `RC Beam (${beamB}×${beamD}mm, As=${rebarAs}mm², f'c=${concreteFc}MPa)`,
                  result: `Mn=${Mn_knm.toFixed(1)} kN·m, φMn=${phiMn_knm.toFixed(1)} kN·m, a=${a_depth.toFixed(1)}mm, ρ=${(rho * 100).toFixed(2)}%`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Civil',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">NOMINAL MOMENT (M_n)</div>
                <div className="text-xl font-mono font-bold text-sky-400 tabular-nums">
                  {Mn_knm.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kN·m</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">DESIGN STRENGTH (φM_n)</div>
                <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                  {phiMn_knm.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kN·m</span>
                </div>
                <div className="text-[10px] text-slate-500">φ = {phi.toFixed(2)}</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">COMPRESSION BLOCK (a)</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {a_depth.toFixed(1)} <span className="text-xs text-slate-500 font-normal">mm</span>
                </div>
                <div className="text-[10px] text-slate-500">c = {c_depth.toFixed(1)} mm</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">STEEL RATIO (ρ)</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {(rho * 100).toFixed(2)} %
                </div>
                <div className="text-[10px] text-slate-500">
                  {rho >= rho_min ? '✓ Above ρ_min' : '⚠ Below ρ_min'}
                </div>
              </div>
            </div>

            {/* Beam Cross-Section SVG Diagram */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Reinforced Concrete Cross-Section & Stress Profile</span>
                <span className="font-mono text-slate-500">
                  ε_t = {epsilon_t.toFixed(4)} ({epsilon_t >= 0.005 ? 'Tension-Controlled Ductile' : 'Transition'})
                </span>
              </div>

              <svg viewBox="0 0 540 220" className="w-full bg-slate-950 rounded-lg p-2 border border-slate-850">
                {/* Concrete Rectangular Cross Section */}
                <rect x="70" y="20" width="130" height="180" fill="#1e293b" stroke="#64748b" strokeWidth="2" />

                {/* Whitney Stress Block (Compression Zone at top) */}
                <rect x="70" y="20" width="130" height={Math.min(90, Math.max(10, (a_depth / beamH) * 180))} fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="1" />

                {/* Neutral Axis Dashed Line */}
                <line
                  x1="60"
                  y1={20 + (c_depth / beamH) * 180}
                  x2="210"
                  y2={20 + (c_depth / beamH) * 180}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text x="215" y={25 + (c_depth / beamH) * 180} fill="#f59e0b" fontSize="10" fontFamily="monospace">
                  N.A. c = {c_depth.toFixed(0)} mm
                </text>

                {/* Rebar Circles at Bottom */}
                <circle cx="100" cy="180" r="7" fill="#38bdf8" />
                <circle cx="135" cy="180" r="7" fill="#38bdf8" />
                <circle cx="170" cy="180" r="7" fill="#38bdf8" />
                <text x="80" y="210" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  A_s = {rebarAs} mm²
                </text>

                {/* Stress Distribution on Right */}
                <g transform="translate(340, 20)">
                  <line x1="0" y1="0" x2="0" y2="180" stroke="#475569" strokeWidth="1" />
                  {/* Compression block C */}
                  <rect x="0" y="0" width="70" height={Math.min(90, (a_depth / beamH) * 180)} fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" />
                  <text x="75" y="25" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                    0.85 f'c
                  </text>
                  <text x="15" y="45" fill="#bae6fd" fontSize="10" fontFamily="monospace">
                    C = 0.85 f'c b a
                  </text>

                  {/* Tension arrow T */}
                  <line x1="0" y1="160" x2="80" y2="160" stroke="#f43f5e" strokeWidth="2.5" />
                  <polygon points="80,160 70,156 70,164" fill="#f43f5e" />
                  <text x="85" y="164" fill="#f43f5e" fontSize="10" fontFamily="monospace">
                    T = A_s f_y
                  </text>

                  {/* Lever arm indicator d - a/2 */}
                  <line x1="-30" y1={((a_depth / 2) / beamH) * 180} x2="-30" y2="160" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="-95" y="100" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    d - a/2 = {(beamD - a_depth / 2).toFixed(0)} mm
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 2: MANNING OPEN CHANNEL */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'manning' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Channel Cross-Section & Hydraulic Parameters
            </h3>

            {/* Shape Selector */}
            <div className="flex gap-2 text-xs">
              {[
                { id: 'rect', label: 'Rectangular' },
                { id: 'trapezoid', label: 'Trapezoidal' },
                { id: 'triangle', label: 'Triangular' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setChannelShape(s.id as any)}
                  className={`flex-1 py-1.5 font-medium rounded-lg border transition-colors ${
                    channelShape === s.id
                      ? 'bg-sky-400/10 border-sky-400 text-sky-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {channelShape !== 'triangle' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">BOTTOM WIDTH (b) [m]</label>
                  <input
                    type="number"
                    step="0.5"
                    value={channelB}
                    onChange={(e) => setChannelB(parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-400 mb-1 font-mono">FLOW DEPTH (y) [m]</label>
                <input
                  type="number"
                  step="0.1"
                  value={channelY}
                  onChange={(e) => setChannelY(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            {channelShape !== 'rect' && (
              <div className="text-xs">
                <label className="block text-slate-400 mb-1 font-mono">
                  SIDE SLOPE (z:1, Horizontal : 1 Vertical)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={channelZ}
                  onChange={(e) => setChannelZ(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">BED SLOPE S₀ [m/m]</label>
                <input
                  type="number"
                  step="0.0005"
                  value={channelSlope}
                  onChange={(e) => setChannelSlope(parseFloat(e.target.value) || 0.0001)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  = {(channelSlope * 100).toFixed(3)} %
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">MANNING ROUGHNESS (n)</label>
                <input
                  type="number"
                  step="0.001"
                  value={channelN}
                  onChange={(e) => setChannelN(parseFloat(e.target.value) || 0.01)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <div className="flex gap-1 mt-1 text-[10px]">
                  <button
                    onClick={() => setChannelN(0.013)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                  >
                    Concrete (0.013)
                  </button>
                  <button
                    onClick={() => setChannelN(0.025)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                  >
                    Earth (0.025)
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'manning-' + Date.now(),
                  expression: `Manning Flow (${channelShape}, b=${channelB}m, y=${channelY}m, S=${channelSlope})`,
                  result: `Q=${flowQ.toFixed(2)} m³/s, V=${flowV.toFixed(2)} m/s, Fr=${froude.toFixed(3)} (${froude < 1 ? 'Subcritical' : 'Supercritical'})`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Civil',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">DISCHARGE (Q)</div>
                <div className="text-xl font-mono font-bold text-sky-400 tabular-nums">
                  {flowQ.toFixed(2)}{' '}
                  <span className="text-xs text-slate-500 font-normal">m³/s</span>
                </div>
                <div className="text-[10px] text-slate-500">{(flowQ * 1000).toFixed(0)} L/s</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">FLOW VELOCITY (V)</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {flowV.toFixed(2)}{' '}
                  <span className="text-xs text-slate-500 font-normal">m/s</span>
                </div>
                <div className="text-[10px] text-slate-500">Manning Formula</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">HYDRAULIC RADIUS (R_h)</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {Rh.toFixed(3)}{' '}
                  <span className="text-xs text-slate-500 font-normal">m</span>
                </div>
                <div className="text-[10px] text-slate-500">A / P = {areaA.toFixed(2)} / {perimP.toFixed(2)}</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">FROUDE NUMBER (Fr)</div>
                <div className={`text-xl font-mono font-bold tabular-nums ${
                  froude < 1 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {froude.toFixed(3)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {froude < 1 ? 'Subcritical (Tranquil)' : 'Supercritical (Rapid)'}
                </div>
              </div>
            </div>

            {/* Cross Section Channel Graphic */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300">
                Canal Flow Cross-Section Profile
              </span>

              <svg viewBox="0 0 540 180" className="w-full bg-slate-950 rounded-lg p-2 border border-slate-850">
                {/* Channel banks */}
                <polygon
                  points="50,40 180,140 360,140 490,40 490,160 50,160"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="2"
                />

                {/* Water Body */}
                <polygon
                  points="90,70 180,140 360,140 450,70"
                  fill="rgba(56, 189, 248, 0.35)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />

                {/* Water Surface Wave Marks */}
                <line x1="90" y1="70" x2="450" y2="70" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" />
                <text x="230" y="65" fill="#7dd3fc" fontSize="11" fontFamily="monospace">
                  Top Width T = {topWidthT.toFixed(2)} m
                </text>

                {/* Depth mark */}
                <line x1="270" y1="70" x2="270" y2="140" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="275" y="105" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                  y = {channelY} m
                </text>

                {/* Bottom width */}
                <line x1="180" y1="150" x2="360" y2="150" stroke="#94a3b8" strokeWidth="1" />
                <text x="245" y="165" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  b = {channelB} m
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 3: SOIL BEARING CAPACITY */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'soil' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Soil & Footing Geometry (Terzaghi Theory)
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">COHESION (c) [kPa]</label>
                <input
                  type="number"
                  value={soilCohesion}
                  onChange={(e) => setSoilCohesion(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">UNIT WEIGHT γ [kN/m³]</label>
                <input
                  type="number"
                  step="0.5"
                  value={soilGamma}
                  onChange={(e) => setSoilGamma(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">FRICTION ANGLE φ [°]</label>
                <input
                  type="number"
                  value={soilPhiDeg}
                  onChange={(e) => setSoilPhiDeg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">SAFETY FACTOR (FS)</label>
                <input
                  type="number"
                  step="0.5"
                  value={safetyFactor}
                  onChange={(e) => setSafetyFactor(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">FOOTING WIDTH (B) [m]</label>
                <input
                  type="number"
                  step="0.5"
                  value={footingB}
                  onChange={(e) => setFootingB(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">EMBEDMENT DEPTH (D_f) [m]</label>
                <input
                  type="number"
                  step="0.5"
                  value={footingDf}
                  onChange={(e) => setFootingDf(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'soil-' + Date.now(),
                  expression: `Soil Bearing (c=${soilCohesion}kPa, φ=${soilPhiDeg}°, B=${footingB}m, Df=${footingDf}m)`,
                  result: `q_ult=${q_ult.toFixed(1)} kPa, q_all=${q_all.toFixed(1)} kPa (FS=${safetyFactor})`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Civil',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Bearing Capacity Factors & Capacities
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono p-3 bg-slate-950 rounded-lg border border-slate-850">
              <div>
                <span className="text-slate-500">N_c:</span>
                <div className="text-sm font-bold text-slate-200">{N_c.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-slate-500">N_q:</span>
                <div className="text-sm font-bold text-slate-200">{N_q.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-slate-500">N_γ:</span>
                <div className="text-sm font-bold text-slate-200">{N_gamma.toFixed(2)}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
              <span className="text-xs text-slate-400 font-mono">ALLOWABLE BEARING CAPACITY (q_all)</span>
              <div className="text-3xl font-mono font-bold text-sky-400 tabular-nums">
                {q_all.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kPa (kN/m²)</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                q_ult = {q_ult.toFixed(1)} kPa with Factor of Safety = {safetyFactor}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 4: HIGHWAY CURVES */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'survey' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Horizontal Circular Curve Geometry
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">INTERSECTION ANGLE (Δ) [°]</label>
                <input
                  type="number"
                  value={curveDeltaDeg}
                  onChange={(e) => setCurveDeltaDeg(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">RADIUS (R) [m]</label>
                <input
                  type="number"
                  value={curveRadiusR}
                  onChange={(e) => setCurveRadiusR(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'survey-' + Date.now(),
                  expression: `Horizontal Curve (Δ=${curveDeltaDeg}°, R=${curveRadiusR}m)`,
                  result: `Tangent T=${tangentT.toFixed(2)}m, Length L=${lengthL.toFixed(2)}m, Chord C=${chordC.toFixed(2)}m`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Civil',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Surveying Staking Dimensions
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-[11px] text-slate-500 font-mono">TANGENT DISTANCE (T)</span>
                <div className="text-xl font-mono font-bold text-sky-400 mt-1">
                  {tangentT.toFixed(2)} m
                </div>
                <span className="text-[10px] text-slate-500">T = R · tan(Δ/2)</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-[11px] text-slate-500 font-mono">CURVE LENGTH (L)</span>
                <div className="text-xl font-mono font-bold text-slate-100 mt-1">
                  {lengthL.toFixed(2)} m
                </div>
                <span className="text-[10px] text-slate-500">L = π · R · Δ / 180</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-[11px] text-slate-500 font-mono">LONG CHORD (C)</span>
                <div className="text-xl font-mono font-bold text-slate-100 mt-1">
                  {chordC.toFixed(2)} m
                </div>
                <span className="text-[10px] text-slate-500">C = 2 · R · sin(Δ/2)</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-[11px] text-slate-500 font-mono">EXTERNAL DIST (E)</span>
                <div className="text-xl font-mono font-bold text-slate-100 mt-1">
                  {externalE.toFixed(2)} m
                </div>
                <span className="text-[10px] text-slate-500">E = R(sec(Δ/2) - 1)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
