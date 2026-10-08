/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight, Calculator, Gauge, Flame, Building2, BookOpen, ArrowUpDown } from 'lucide-react';
import { DisciplineType } from '../types';

export interface SearchFormulaEntry {
  id: string;
  name: string;
  discipline: DisciplineType;
  disciplineLabel: string;
  subToolId: string;
  formula: string;
  tags: string[];
}

export const FORMULA_CATALOG: SearchFormulaEntry[] = [
  {
    id: 'mech-beam',
    name: 'Beam Deflection & Bending Stress',
    discipline: 'mechanical',
    disciplineLabel: 'Mechanical',
    subToolId: 'beam',
    formula: 'δ_max = (P·L³)/(48·E·I) | σ = (M·y)/I',
    tags: ['beam', 'deflection', 'moment', 'shear', 'stress', 'cantilever', 'bending', 'sfd', 'bmd']
  },
  {
    id: 'mech-mohr',
    name: "Mohr's Circle & 2D Stress Transformation",
    discipline: 'mechanical',
    disciplineLabel: 'Mechanical',
    subToolId: 'mohr',
    formula: 'σ₁,₂ = σ_avg ± √[((σ_x-σ_y)/2)² + τ_xy²]',
    tags: ['mohr', 'principal stress', 'shear', 'plane stress', 'strain', 'yield', 'angle']
  },
  {
    id: 'mech-flow',
    name: 'Pipe Flow & Darcy-Weisbach Friction',
    discipline: 'mechanical',
    disciplineLabel: 'Mechanical',
    subToolId: 'flow',
    formula: 'Re = (ρ·v·D)/μ | h_f = f·(L/D)·(v²/(2g))',
    tags: ['reynolds', 'darcy', 'friction', 'pipe', 'turbulent', 'laminar', 'head loss', 'fluids']
  },
  {
    id: 'mech-thermo',
    name: 'Thermodynamic Cycle Efficiency (Carnot & Otto)',
    discipline: 'mechanical',
    disciplineLabel: 'Mechanical',
    subToolId: 'thermo',
    formula: 'η_carnot = 1 - T_C/T_H | η_otto = 1 - 1/r^(γ-1)',
    tags: ['thermo', 'carnot', 'otto', 'efficiency', 'engine', 'compression ratio', 'heat']
  },
  {
    id: 'mech-gear',
    name: 'Gear Train & Power Transmission',
    discipline: 'mechanical',
    disciplineLabel: 'Mechanical',
    subToolId: 'gear',
    formula: 'ω₂ = ω₁·(N₁/N₂) | T₂ = T₁·(N₂/N₁)',
    tags: ['gear', 'torque', 'rpm', 'transmission', 'speed', 'power', 'ratio']
  },
  {
    id: 'chem-vdw',
    name: 'Van der Waals Real Gas & Compressibility',
    discipline: 'chemical',
    disciplineLabel: 'Chemical',
    subToolId: 'gas',
    formula: '[P + a(n/V)²]·(V - nb) = nRT | Z = PV/(nRT)',
    tags: ['gas', 'van der waals', 'real gas', 'compressibility', 'ideal gas', 'pressure', 'isotherm']
  },
  {
    id: 'chem-lmtd',
    name: 'Heat Exchanger LMTD & Area Sizing',
    discipline: 'chemical',
    disciplineLabel: 'Chemical',
    subToolId: 'lmtd',
    formula: 'ΔT_lm = (ΔT₁ - ΔT₂)/ln(ΔT₁/ΔT₂) | A = Q/(U·ΔT_lm)',
    tags: ['heat exchanger', 'lmtd', 'heat transfer', 'counterflow', 'cocurrent', 'duty', 'area']
  },
  {
    id: 'chem-kinetics',
    name: 'Reaction Kinetics & Arrhenius Equation',
    discipline: 'chemical',
    disciplineLabel: 'Chemical',
    subToolId: 'kinetics',
    formula: 'k = A·exp(-E_a / (R·T)) | t_½ = ln(2)/k',
    tags: ['kinetics', 'arrhenius', 'rate constant', 'half life', 'activation energy', 'reaction']
  },
  {
    id: 'chem-reactors',
    name: 'Reactor Sizing: CSTR vs PFR',
    discipline: 'chemical',
    disciplineLabel: 'Chemical',
    subToolId: 'reactor',
    formula: 'V_CSTR = (F_A0·X)/(-r_A) | V_PFR = F_A0 ∫ dX/(-r_A)',
    tags: ['cstr', 'pfr', 'reactor', 'conversion', 'volume', 'backmixing', 'plug flow']
  },
  {
    id: 'chem-distill',
    name: 'McCabe-Thiele Distillation Estimator',
    discipline: 'chemical',
    disciplineLabel: 'Chemical',
    subToolId: 'distill',
    formula: 'R_min = [x_D - y_q]/(y_q - x_q) | N_min (Fenske)',
    tags: ['distillation', 'mccabe thiele', 'reflux', 'stages', 'trays', 'separation', 'volatility']
  },
  {
    id: 'civil-concrete',
    name: 'Reinforced Concrete Beam Flexure (ACI / EC2)',
    discipline: 'civil',
    disciplineLabel: 'Civil',
    subToolId: 'concrete',
    formula: 'a = (A_s·f_y)/(0.85·f\'c·b) | M_n = A_s·f_y·(d - a/2)',
    tags: ['concrete', 'beam', 'rebar', 'moment capacity', 'aci', 'eurocode', 'flexure', 'structural']
  },
  {
    id: 'civil-manning',
    name: "Manning's Open Channel Flow & Froude",
    discipline: 'civil',
    disciplineLabel: 'Civil',
    subToolId: 'manning',
    formula: 'Q = (1/n)·A·R_h^(2/3)·S^(1/2) | Fr = V/√(g·D_h)',
    tags: ['manning', 'open channel', 'hydraulics', 'discharge', 'froude', 'subcritical', 'canal']
  },
  {
    id: 'civil-bearing',
    name: 'Soil Bearing Capacity & Effective Stress',
    discipline: 'civil',
    disciplineLabel: 'Civil',
    subToolId: 'soil',
    formula: 'q_ult = c·N_c + q·N_q + 0.5·γ·B·N_γ | σ\' = σ - u',
    tags: ['soil', 'bearing capacity', 'terzaghi', 'geotechnical', 'foundation', 'effective stress']
  },
  {
    id: 'civil-survey',
    name: 'Highway Horizontal Curve Surveying',
    discipline: 'civil',
    disciplineLabel: 'Civil',
    subToolId: 'survey',
    formula: 'T = R·tan(Δ/2) | L = π·R·Δ / 180 | C = 2·R·sin(Δ/2)',
    tags: ['curve', 'highway', 'surveying', 'tangent', 'radius', 'chord', 'road']
  },
  {
    id: 'sci-calc',
    name: 'General Scientific & Trigonometric Calculator',
    discipline: 'scientific',
    disciplineLabel: 'Scientific',
    subToolId: 'calc',
    formula: 'sin, cos, tan, ln, log, x^y, √, n!, Deg/Rad, Memory',
    tags: ['scientific', 'calculator', 'trigonometry', 'hyperbolic', 'powers', 'logarithm']
  },
  {
    id: 'unit-conv',
    name: 'Engineering Unit Converter & Physical Constants',
    discipline: 'units',
    disciplineLabel: 'Units & Constants',
    subToolId: 'units',
    formula: 'Pressure, Stress, Flow, Viscosity, Energy, Power, R, g, σ, h',
    tags: ['units', 'conversion', 'constants', 'pressure', 'viscosity', 'si', 'imperial']
  },
  {
    id: 'prof-lab',
    name: 'Lecture Lab & Problem Walkthroughs',
    discipline: 'lecture',
    disciplineLabel: 'Lecture Lab',
    subToolId: 'lecture',
    formula: 'Step-by-step analytical derivations, exam sheet generator',
    tags: ['lecture', 'exam', 'professor', 'solution', 'homework', 'derivation', 'pedagogy']
  }
];

interface FormulaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (discipline: DisciplineType, subToolId: string) => void;
}

export const FormulaSearchModal: React.FC<FormulaSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = FORMULA_CATALOG.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.formula.toLowerCase().includes(q) ||
      item.disciplineLabel.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const getDisciplineIcon = (disc: DisciplineType) => {
    switch (disc) {
      case 'mechanical':
        return <Gauge className="w-4 h-4 text-amber-400" />;
      case 'chemical':
        return <Flame className="w-4 h-4 text-emerald-400" />;
      case 'civil':
        return <Building2 className="w-4 h-4 text-sky-400" />;
      case 'lecture':
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'units':
        return <ArrowUpDown className="w-4 h-4 text-rose-400" />;
      default:
        return <Calculator className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search formulas, solvers, or parameters (e.g. beam, reynolds, lmtd, manning)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 text-slate-400 hover:text-white border border-slate-700 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-850">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching engineering solvers found for "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.discipline, item.subToolId);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    {getDisciplineIcon(item.discipline)}
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      · {item.disciplineLabel}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-cyan-300/80 bg-slate-950/60 px-2 py-1 rounded inline-block">
                    {item.formula}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Click any entry to launch that engineering solver immediately</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
