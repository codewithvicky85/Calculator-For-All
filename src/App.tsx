/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DisciplineType, CalculationHistoryItem } from './types';
import { Header } from './components/Header';
import { ScientificCalculator } from './components/ScientificCalculator';
import { MechanicalSuite } from './components/MechanicalSuite';
import { ChemicalSuite } from './components/ChemicalSuite';
import { CivilSuite } from './components/CivilSuite';
import { ProfessorLab } from './components/ProfessorLab';
import { UnitConverterAndConstants } from './components/UnitConverterAndConstants';
import { FormulaSearchModal } from './components/FormulaSearchModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { PublishGuideModal } from './components/PublishGuideModal';
import {
  Calculator,
  Gauge,
  Flame,
  Building2,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineType>('scientific');
  const [activeSubTool, setActiveSubTool] = useState<string>('beam');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPublishGuideOpen, setIsPublishGuideOpen] = useState(false);

  // Initial calculation ledger entries so students and professors see realistic data immediately
  const [history, setHistory] = useState<CalculationHistoryItem[]>([
    {
      id: 'init-1',
      expression: 'Beam Deflection (Simply Supported, L=4.0m, P=45kN)',
      result: 'δ_max = 1.92 mm, M_max = 45.0 kN·m, σ_max = 36.0 MPa',
      timestamp: '10:14:02 AM',
      discipline: 'Mechanical',
    },
    {
      id: 'init-2',
      expression: 'Counter-Current LMTD (Th=160→90°C, Tc=25→65°C, Q=450kW)',
      result: 'LMTD = 79.05 °C, Required Area A = 16.26 m²',
      timestamp: '10:14:28 AM',
      discipline: 'Chemical',
    },
    {
      id: 'init-3',
      expression: 'Manning Trapezoidal Channel (b=3.0m, y=1.2m, z=1.5, S=0.0016)',
      result: 'Discharge Q = 15.10 m³/s, Velocity V = 2.62 m/s, Fr = 0.896',
      timestamp: '10:15:05 AM',
      discipline: 'Civil',
    },
  ]);

  const handleAddHistory = (item: CalculationHistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleSelectFromSearch = (discipline: DisciplineType, subToolId: string) => {
    setActiveDiscipline(discipline);
    setActiveSubTool(subToolId);
  };

  const handleResetActive = () => {
    // Re-render or reset active sub-tool
    setActiveSubTool((prev) => prev + '');
  };

  // Helper metadata about current view
  const getDisciplineHeader = () => {
    switch (activeDiscipline) {
      case 'mechanical':
        return {
          title: 'Mechanical Engineering Analysis Suite',
          description:
            'Structural beam deflection & stress, 2D plane stress Mohr’s circle transformation, Darcy-Weisbach pipe flow hydraulics, and thermodynamic engine cycles.',
          icon: Gauge,
          color: 'text-amber-400',
        };
      case 'chemical':
        return {
          title: 'Chemical & Process Engineering Suite',
          description:
            'Van der Waals real gas compressibility, heat exchanger LMTD & area sizing, Arrhenius reaction kinetics, continuous reactor volume sizing (CSTR vs PFR), and McCabe-Thiele distillation stages.',
          icon: Flame,
          color: 'text-emerald-400',
        };
      case 'civil':
        return {
          title: 'Civil & Structural Engineering Suite',
          description:
            'ACI 318 reinforced concrete beam nominal flexural strength, Manning’s open channel hydraulics, Terzaghi shallow foundation soil bearing capacity, and horizontal curve surveying.',
          icon: Building2,
          color: 'text-sky-400',
        };
      case 'units':
        return {
          title: 'Dimensional Engineering Unit Converter & Physical Constants',
          description:
            'Multi-system conversion across pressure, stress, dynamic viscosity, flow, power, heat rate, energy, and authoritative engineering physical constants catalog.',
          icon: ArrowUpDown,
          color: 'text-rose-400',
        };
      case 'lecture':
        return {
          title: 'Professor & Student Academic Lecture Lab',
          description:
            'Step-by-step analytical derivations with formula proofs, dimensional consistency checking, pedagogical lecture notes, and printable exam assignment sheets.',
          icon: GraduationCap,
          color: 'text-purple-400',
        };
      default:
        return {
          title: 'Precision Scientific & Trigonometric Calculator',
          description:
            'High-precision arithmetic, trigonometric & hyperbolic functions, logarithmic bases, powers, physical constants, memory registers, and computation ledger.',
          icon: Calculator,
          color: 'text-cyan-400',
        };
    }
  };

  const currentMeta = getDisciplineHeader();
  const HeaderIcon = currentMeta.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3-Zone Standard Top Navigation */}
      <Header
        activeDiscipline={activeDiscipline}
        onSelectDiscipline={setActiveDiscipline}
        onOpenSearch={() => setIsSearchOpen(true)}
        onExportReport={() => setIsExportOpen(true)}
        onResetActive={handleResetActive}
        onOpenPublishGuide={() => setIsPublishGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Section Title & Description Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-850">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HeaderIcon className={`w-5 h-5 ${currentMeta.color}`} />
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {currentMeta.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {currentMeta.description}
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            {activeDiscipline !== 'scientific' && (
              <button
                onClick={() => setActiveDiscipline('scientific')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scientific Keypad</span>
              </button>
            )}
            {activeDiscipline !== 'lecture' && (
              <button
                onClick={() => setActiveDiscipline('lecture')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>Lecture Derivations</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Discipline Views */}
        {activeDiscipline === 'scientific' && (
          <ScientificCalculator
            onAddHistory={handleAddHistory}
            history={history}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeDiscipline === 'mechanical' && (
          <MechanicalSuite
            onAddHistory={handleAddHistory}
            initialSubTool={activeSubTool}
          />
        )}

        {activeDiscipline === 'chemical' && (
          <ChemicalSuite
            onAddHistory={handleAddHistory}
            initialSubTool={activeSubTool}
          />
        )}

        {activeDiscipline === 'civil' && (
          <CivilSuite
            onAddHistory={handleAddHistory}
            initialSubTool={activeSubTool}
          />
        )}

        {activeDiscipline === 'units' && (
          <UnitConverterAndConstants
            onInsertConstant={(val) => {
              setActiveDiscipline('scientific');
            }}
          />
        )}

        {activeDiscipline === 'lecture' && <ProfessorLab />}
      </main>

      {/* Global Modals */}
      <FormulaSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSelectFromSearch}
      />

      <ExportSummaryModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        history={history}
      />

      <PublishGuideModal
        isOpen={isPublishGuideOpen}
        onClose={() => setIsPublishGuideOpen(false)}
      />

      {/* Subtle Academic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">CalculatorForAll</span>
            <span aria-hidden="true">·</span>
            <span>Computational Engineering for Students & Faculty</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <span>SI Metric & US Customary Standard</span>
            <span aria-hidden="true">·</span>
            <span>Mechanical · Chemical · Civil · Mathematics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
