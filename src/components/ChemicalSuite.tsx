/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalculationHistoryItem } from '../types';
import { Flame, Thermometer, FlaskConical, GitCommit, Split } from 'lucide-react';

interface ChemicalSuiteProps {
  onAddHistory: (item: CalculationHistoryItem) => void;
  initialSubTool?: string;
}

interface GasPreset {
  name: string;
  formula: string;
  a: number; // Pa·m⁶/mol²
  b: number; // m³/mol
}

const GAS_PRESETS: GasPreset[] = [
  { name: 'Carbon Dioxide', formula: 'CO₂', a: 0.3658, b: 4.286e-5 },
  { name: 'Nitrogen', formula: 'N₂', a: 0.1370, b: 3.87e-5 },
  { name: 'Methane', formula: 'CH₄', a: 0.2303, b: 4.31e-5 },
  { name: 'Oxygen', formula: 'O₂', a: 0.1382, b: 3.19e-5 },
  { name: 'Water Vapor', formula: 'H₂O', a: 0.5537, b: 3.05e-5 },
  { name: 'Ammonia', formula: 'NH₃', a: 0.4225, b: 3.71e-5 },
  { name: 'Helium', formula: 'He', a: 0.00346, b: 2.38e-5 },
  { name: 'Argon', formula: 'Ar', a: 0.1355, b: 3.20e-5 },
];

export const ChemicalSuite: React.FC<ChemicalSuiteProps> = ({
  onAddHistory,
  initialSubTool = 'gas',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTool);

  // ----------------------------------------------------
  // 1. VAN DER WAALS STATE
  // ----------------------------------------------------
  const [selectedGas, setSelectedGas] = useState<string>('CO₂');
  const [gasMoles, setGasMoles] = useState<number>(500); // mol
  const [gasVolume, setGasVolume] = useState<number>(0.50); // m³
  const [gasTempK, setGasTempK] = useState<number>(350); // K
  const [customA, setCustomA] = useState<number>(0.3658);
  const [customB, setCustomB] = useState<number>(4.286e-5);

  const activeGasPreset = GAS_PRESETS.find((g) => g.formula === selectedGas);
  const a_val = activeGasPreset ? activeGasPreset.a : customA;
  const b_val = activeGasPreset ? activeGasPreset.b : customB;
  const R_const = 8.314462618;

  const P_ideal_pa = (gasMoles * R_const * gasTempK) / Math.max(0.001, gasVolume);
  const V_eff = gasVolume - gasMoles * b_val;
  const P_vdw_pa =
    V_eff > 0
      ? (gasMoles * R_const * gasTempK) / V_eff - a_val * Math.pow(gasMoles / gasVolume, 2)
      : NaN;

  const P_ideal_mpa = P_ideal_pa / 1e6;
  const P_vdw_mpa = isNaN(P_vdw_pa) ? 0 : P_vdw_pa / 1e6;
  const Z_compressibility = P_ideal_pa > 0 && !isNaN(P_vdw_pa) ? P_vdw_pa / P_ideal_pa : 1;
  const pctDeviation =
    P_ideal_pa > 0 && !isNaN(P_vdw_pa)
      ? ((P_vdw_pa - P_ideal_pa) / P_ideal_pa) * 100
      : 0;

  // ----------------------------------------------------
  // 2. LMTD HEAT EXCHANGER STATE
  // ----------------------------------------------------
  const [hxFlowType, setHxFlowType] = useState<'counter' | 'cocurrent'>('counter');
  const [ThIn, setThIn] = useState<number>(160); // °C
  const [ThOut, setThOut] = useState<number>(90); // °C
  const [TcIn, setTcIn] = useState<number>(25); // °C
  const [TcOut, setTcOut] = useState<number>(65); // °C
  const [heatDutyKW, setHeatDutyKW] = useState<number>(450); // kW
  const [overallU, setOverallU] = useState<number>(350); // W/(m²·K)

  let deltaT1 = 0;
  let deltaT2 = 0;
  if (hxFlowType === 'counter') {
    deltaT1 = ThIn - TcOut;
    deltaT2 = ThOut - TcIn;
  } else {
    deltaT1 = ThIn - TcIn;
    deltaT2 = ThOut - TcOut;
  }

  let lmtd = 0;
  if (deltaT1 > 0 && deltaT2 > 0) {
    if (Math.abs(deltaT1 - deltaT2) < 0.001) {
      lmtd = deltaT1;
    } else {
      lmtd = (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);
    }
  }

  const hxArea_m2 = lmtd > 0 && overallU > 0 ? (heatDutyKW * 1000) / (overallU * lmtd) : 0;

  // ----------------------------------------------------
  // 3. REACTION KINETICS STATE
  // ----------------------------------------------------
  const [arrheniusA, setArrheniusA] = useState<number>(1.5e11); // s^-1
  const [activationEa, setActivationEa] = useState<number>(75); // kJ/mol
  const [reactionTempC, setReactionTempC] = useState<number>(120); // °C
  const [reactionOrder, setReactionOrder] = useState<1 | 2>(1);
  const [initConc, setInitConc] = useState<number>(2.0); // mol/L

  const T_react_K = reactionTempC + 273.15;
  const Ea_J = activationEa * 1000;
  const k_rate = arrheniusA * Math.exp(-Ea_J / (R_const * T_react_K));

  let halfLifeSec = 0;
  if (reactionOrder === 1) {
    halfLifeSec = Math.log(2) / Math.max(1e-12, k_rate);
  } else {
    halfLifeSec = 1 / (Math.max(1e-12, k_rate) * initConc);
  }

  // ----------------------------------------------------
  // 4. CSTR VS PFR REACTOR SIZING
  // ----------------------------------------------------
  const [feedRateFA0, setFeedRateFA0] = useState<number>(10); // mol/s
  const [feedConcCA0, setFeedConcCA0] = useState<number>(2.0); // mol/L
  const [targetConversion, setTargetConversion] = useState<number>(0.80); // 80%

  const X = Math.min(0.999, Math.max(0.01, targetConversion));
  // Assuming 1st order with current k_rate (converted to s^-1)
  const k_eff = Math.max(1e-6, k_rate > 0 ? k_rate : 0.05);

  // V_CSTR = (FA0 * X) / (k * CA0 * (1 - X)) in Liters
  const v_cstr_L = (feedRateFA0 * X) / (k_eff * feedConcCA0 * (1 - X));
  // V_PFR = (FA0 / (k * CA0)) * ln(1 / (1 - X)) in Liters
  const v_pfr_L = (feedRateFA0 / (k_eff * feedConcCA0)) * Math.log(1 / (1 - X));
  const v_ratio = v_pfr_L > 0 ? v_cstr_L / v_pfr_L : 1;

  // ----------------------------------------------------
  // 5. DISTILLATION MCCABE-THIELE
  // ----------------------------------------------------
  const [alphaRel, setAlphaRel] = useState<number>(2.4); // relative volatility
  const [distillXD, setDistillXD] = useState<number>(0.95);
  const [distillXB, setDistillXB] = useState<number>(0.05);
  const [distillZF, setDistillZF] = useState<number>(0.50);
  const [distillQ, setDistillQ] = useState<number>(1.0); // saturated liquid

  // Fenske equation minimum stages N_min
  const n_min_stages =
    Math.log((distillXD / (1 - distillXD)) * ((1 - distillXB) / distillXB)) /
    Math.max(0.001, Math.log(alphaRel));

  // Minimum reflux ratio approx
  const x_pinch = distillZF;
  const y_pinch = (alphaRel * x_pinch) / (1 + (alphaRel - 1) * x_pinch);
  const r_min_reflux = (distillXD - y_pinch) / Math.max(0.001, y_pinch - x_pinch);

  return (
    <div className="space-y-6">
      {/* Sub-tool Selection Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { id: 'gas', label: 'Van der Waals Real Gas & Z', icon: Flame },
          { id: 'lmtd', label: 'Heat Exchanger LMTD & Area', icon: Thermometer },
          { id: 'kinetics', label: 'Arrhenius Reaction Kinetics', icon: FlaskConical },
          { id: 'reactor', label: 'Reactor Sizing: CSTR vs PFR', icon: GitCommit },
          { id: 'distill', label: 'McCabe-Thiele Distillation', icon: Split },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
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
      {/* SUB-TOOL 1: REAL GAS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'gas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Van der Waals Gas Parameters
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                SELECT SUBSTANCE
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {GAS_PRESETS.map((g) => (
                  <button
                    key={g.formula}
                    onClick={() => setSelectedGas(g.formula)}
                    className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                      selectedGas === g.formula
                        ? 'bg-emerald-400/15 border-emerald-400 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.formula}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">MOLES (n) [mol]</label>
                <input
                  type="number"
                  value={gasMoles}
                  onChange={(e) => setGasMoles(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">VOLUME (V) [m³]</label>
                <input
                  type="number"
                  step="0.05"
                  value={gasVolume}
                  onChange={(e) => setGasVolume(parseFloat(e.target.value) || 0.01)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1 font-mono">TEMPERATURE (T) [K]</label>
              <input
                type="number"
                value={gasTempK}
                onChange={(e) => setGasTempK(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                = {(gasTempK - 273.15).toFixed(1)} °C
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
              <div className="text-slate-400">Van der Waals Coefficients:</div>
              <div className="text-slate-300">
                a = {a_val.toFixed(4)} Pa·m⁶/mol²
              </div>
              <div className="text-slate-300">
                b = {b_val.toExponential(4)} m³/mol
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'vdw-' + Date.now(),
                  expression: `Real Gas EOS (${selectedGas}, n=${gasMoles}mol, V=${gasVolume}m³, T=${gasTempK}K)`,
                  result: `P_ideal=${P_ideal_mpa.toFixed(3)} MPa, P_vdw=${P_vdw_mpa.toFixed(3)} MPa, Z=${Z_compressibility.toFixed(4)}`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Chemical',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">IDEAL PRESSURE</div>
                <div className="text-xl font-mono font-bold text-slate-200 tabular-nums">
                  {P_ideal_mpa.toFixed(3)}{' '}
                  <span className="text-xs text-slate-500 font-normal">MPa</span>
                </div>
                <div className="text-[10px] text-slate-500">{(P_ideal_mpa * 10).toFixed(2)} bar</div>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">REAL PRESSURE (VDW)</div>
                <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                  {P_vdw_mpa.toFixed(3)}{' '}
                  <span className="text-xs text-slate-500 font-normal">MPa</span>
                </div>
                <div className="text-[10px] text-slate-500">{(P_vdw_mpa * 10).toFixed(2)} bar</div>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">COMPRESSIBILITY (Z)</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {Z_compressibility.toFixed(4)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {Z_compressibility < 1 ? 'Attractive dominated' : 'Repulsive dominated'}
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">% DEVIATION</div>
                <div className={`text-xl font-mono font-bold tabular-nums ${
                  Math.abs(pctDeviation) > 5 ? 'text-amber-400' : 'text-slate-200'
                }`}>
                  {pctDeviation.toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500">vs Ideal Model</div>
              </div>
            </div>

            {/* Visualizer: P-V Isotherm curve */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>P-V Isotherm Comparison (T = {gasTempK} K)</span>
                <span className="font-mono text-slate-500">Solid: Real Gas (VdW) | Dashed: Ideal Gas</span>
              </div>

              <svg viewBox="0 0 540 220" className="w-full bg-slate-950 rounded-lg p-2 border border-slate-850">
                {/* Axes */}
                <line x1="50" y1="190" x2="520" y2="190" stroke="#334155" strokeWidth="1.5" />
                <line x1="50" y1="20" x2="50" y2="190" stroke="#334155" strokeWidth="1.5" />
                <text x="480" y="205" fill="#94a3b8" fontSize="10" fontFamily="monospace">Volume (V)</text>
                <text x="15" y="30" fill="#94a3b8" fontSize="10" fontFamily="monospace">Pressure (P)</text>

                {/* Qualitative Ideal Gas Curve (Hyperbola P = nRT/V) */}
                <path
                  d="M 65 30 Q 140 120 500 175"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Qualitative Real Gas Curve */}
                <path
                  d="M 80 25 Q 160 145 500 180"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Operating Point */}
                <circle cx="230" cy="148" r="5" fill="#10b981" />
                <text x="240" y="145" fill="#34d399" fontSize="11" fontFamily="monospace">
                  Operating Point: ({P_vdw_mpa.toFixed(2)} MPa, {gasVolume} m³)
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 2: HEAT EXCHANGER LMTD */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'lmtd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Stream Temperatures & Heat Exchanger Specs
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-mono">FLOW CONFIGURATION</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setHxFlowType('counter')}
                  className={`py-2 rounded-lg border font-medium transition-colors ${
                    hxFlowType === 'counter'
                      ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Counter-Current Flow
                </button>
                <button
                  onClick={() => setHxFlowType('cocurrent')}
                  className={`py-2 rounded-lg border font-medium transition-colors ${
                    hxFlowType === 'cocurrent'
                      ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Co-Current (Parallel)
                </button>
              </div>
            </div>

            {/* Hot Stream */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <span className="text-xs text-rose-400 font-mono">HOT PROCESS STREAM (°C)</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1 font-mono">INLET T_h,in</label>
                  <input
                    type="number"
                    value={ThIn}
                    onChange={(e) => setThIn(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-mono">OUTLET T_h,out</label>
                  <input
                    type="number"
                    value={ThOut}
                    onChange={(e) => setThOut(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Cold Stream */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <span className="text-xs text-sky-400 font-mono">COLD UTILITY STREAM (°C)</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1 font-mono">INLET T_c,in</label>
                  <input
                    type="number"
                    value={TcIn}
                    onChange={(e) => setTcIn(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-mono">OUTLET T_c,out</label>
                  <input
                    type="number"
                    value={TcOut}
                    onChange={(e) => setTcOut(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Duty & U */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">HEAT DUTY (Q) [kW]</label>
                <input
                  type="number"
                  value={heatDutyKW}
                  onChange={(e) => setHeatDutyKW(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">OVERALL U [W/(m²·K)]</label>
                <input
                  type="number"
                  value={overallU}
                  onChange={(e) => setOverallU(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'hx-' + Date.now(),
                  expression: `Heat Exchanger LMTD (${hxFlowType}, Q=${heatDutyKW}kW, U=${overallU}W/m²K)`,
                  result: `LMTD=${lmtd.toFixed(2)} °C, ΔT₁=${deltaT1.toFixed(1)}°C, ΔT₂=${deltaT2.toFixed(1)}°C, Required Area=${hxArea_m2.toFixed(2)} m²`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Chemical',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">LMTD (ΔT_lm)</div>
                <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                  {lmtd.toFixed(2)} <span className="text-xs text-slate-500 font-normal">°C</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">REQUIRED AREA (A)</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {hxArea_m2.toFixed(2)} <span className="text-xs text-slate-500 font-normal">m²</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">APPROACH ΔT₁</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {deltaT1.toFixed(1)} <span className="text-xs text-slate-500 font-normal">°C</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-slate-400">APPROACH ΔT₂</div>
                <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
                  {deltaT2.toFixed(1)} <span className="text-xs text-slate-500 font-normal">°C</span>
                </div>
              </div>
            </div>

            {/* SVG Stream Temperature Profile */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300">
                Temperature Gradient Profile along Exchanger Length
              </span>

              <svg viewBox="0 0 540 200" className="w-full bg-slate-950 rounded-lg p-2 border border-slate-850">
                {/* Hot stream curve */}
                <path
                  d="M 60 50 Q 270 90 480 120"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3"
                />
                <circle cx="60" cy="50" r="4" fill="#f43f5e" />
                <text x="65" y="42" fill="#fda4af" fontSize="10" fontFamily="monospace">
                  T_h,in = {ThIn}°C
                </text>
                <circle cx="480" cy="120" r="4" fill="#f43f5e" />
                <text x="410" y="140" fill="#fda4af" fontSize="10" fontFamily="monospace">
                  T_h,out = {ThOut}°C
                </text>

                {/* Cold stream curve */}
                {hxFlowType === 'counter' ? (
                  <>
                    <path
                      d="M 60 100 Q 270 140 480 160"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    <circle cx="60" cy="100" r="4" fill="#38bdf8" />
                    <text x="65" y="92" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
                      T_c,out = {TcOut}°C ←
                    </text>
                    <circle cx="480" cy="160" r="4" fill="#38bdf8" />
                    <text x="410" y="180" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
                      T_c,in = {TcIn}°C
                    </text>
                  </>
                ) : (
                  <>
                    <path
                      d="M 60 160 Q 270 140 480 135"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    <circle cx="60" cy="160" r="4" fill="#38bdf8" />
                    <text x="65" y="175" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
                      T_c,in = {TcIn}°C →
                    </text>
                    <circle cx="480" cy="135" r="4" fill="#38bdf8" />
                    <text x="410" y="155" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
                      T_c,out = {TcOut}°C
                    </text>
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 3: ARRHENIUS KINETICS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'kinetics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Arrhenius Kinetic Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">PRE-EXP FACTOR (A) [s⁻¹]</label>
                <input
                  type="number"
                  value={arrheniusA}
                  onChange={(e) => setArrheniusA(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">ACTIVATION ENERGY (E_a) [kJ/mol]</label>
                <input
                  type="number"
                  value={activationEa}
                  onChange={(e) => setActivationEa(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">TEMPERATURE [°C]</label>
                <input
                  type="number"
                  value={reactionTempC}
                  onChange={(e) => setReactionTempC(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono block mt-1">= {T_react_K.toFixed(1)} K</span>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">INITIAL CONC C_A0 [mol/L]</label>
                <input
                  type="number"
                  step="0.5"
                  value={initConc}
                  onChange={(e) => setInitConc(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                onAddHistory({
                  id: 'kinetics-' + Date.now(),
                  expression: `Kinetics (Ea=${activationEa}kJ/mol, T=${reactionTempC}°C)`,
                  result: `k=${k_rate.toExponential(4)} s⁻¹, t_½=${halfLifeSec.toFixed(2)} s`,
                  timestamp: new Date().toLocaleTimeString(),
                  discipline: 'Chemical',
                });
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Log to Ledger
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Reaction Rate Constant & Half-Life
            </h3>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
              <div className="text-xs text-slate-400 font-mono">RATE CONSTANT (k)</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                {k_rate.toExponential(4)} <span className="text-xs text-slate-500 font-normal">s⁻¹</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                k = A · exp(-E_a / RT)
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
              <div className="text-xs text-slate-400 font-mono">REACTION HALF-LIFE (t_½)</div>
              <div className="text-2xl font-mono font-bold text-slate-100 tabular-nums">
                {halfLifeSec < 60
                  ? `${halfLifeSec.toFixed(2)} s`
                  : halfLifeSec < 3600
                  ? `${(halfLifeSec / 60).toFixed(2)} min`
                  : `${(halfLifeSec / 3600).toFixed(2)} hr`}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {reactionOrder === 1 ? '1st Order: t_½ = ln(2) / k' : '2nd Order: t_½ = 1 / (k · C_A0)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 4: CSTR VS PFR */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'reactor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Continuous Reactor Design Inputs
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">FEED RATE (F_A0) [mol/s]</label>
                <input
                  type="number"
                  value={feedRateFA0}
                  onChange={(e) => setFeedRateFA0(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">FEED CONC (C_A0) [mol/L]</label>
                <input
                  type="number"
                  value={feedConcCA0}
                  onChange={(e) => setFeedConcCA0(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1 font-mono">
                FRACTIONAL CONVERSION (X): {(X * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.10"
                max="0.99"
                step="0.01"
                value={X}
                onChange={(e) => setTargetConversion(parseFloat(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Required Reactor Volumes
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-slate-500 font-mono">CSTR VOLUME:</span>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                  {v_cstr_L > 1000 ? `${(v_cstr_L / 1000).toFixed(2)} m³` : `${v_cstr_L.toFixed(1)} L`}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-slate-500 font-mono">PFR VOLUME:</span>
                <div className="text-xl font-mono font-bold text-sky-400 mt-1">
                  {v_pfr_L > 1000 ? `${(v_pfr_L / 1000).toFixed(2)} m³` : `${v_pfr_L.toFixed(1)} L`}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
              <span className="text-xs text-slate-400 font-mono">VOLUME RATIO (V_CSTR / V_PFR):</span>
              <div className="text-2xl font-mono font-bold text-slate-100 mt-1">
                {v_ratio.toFixed(2)} ×
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Due to complete backmixing reducing reactant concentration, the CSTR must be {v_ratio.toFixed(1)} times larger than a Plug Flow Reactor for {(X * 100).toFixed(0)}% conversion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TOOL 5: DISTILLATION */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'distill' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              McCabe-Thiele Column Specifications
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">RELATIVE VOLATILITY (α)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.05"
                  value={alphaRel}
                  onChange={(e) => setAlphaRel(parseFloat(e.target.value) || 1.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">FEED PURITY (z_F)</label>
                <input
                  type="number"
                  step="0.05"
                  value={distillZF}
                  onChange={(e) => setDistillZF(parseFloat(e.target.value) || 0.5)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">DISTILLATE (x_D)</label>
                <input
                  type="number"
                  step="0.01"
                  value={distillXD}
                  onChange={(e) => setDistillXD(parseFloat(e.target.value) || 0.95)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">BOTTOMS (x_B)</label>
                <input
                  type="number"
                  step="0.01"
                  value={distillXB}
                  onChange={(e) => setDistillXB(parseFloat(e.target.value) || 0.05)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Distillation Separation Estimates
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-[11px] text-slate-500 font-mono">MIN STAGES (N_min)</span>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                  {n_min_stages.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500">Fenske Eq. (Total Reflux)</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-[11px] text-slate-500 font-mono">MIN REFLUX (R_min)</span>
                <div className="text-2xl font-mono font-bold text-slate-100 mt-1">
                  {Math.max(0, r_min_reflux).toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500">Underwood / Pinch approx</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
