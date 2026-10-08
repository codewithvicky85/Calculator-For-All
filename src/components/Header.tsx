/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DisciplineType } from '../types';
import { Search, FileSpreadsheet, RotateCcw, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeDiscipline: DisciplineType;
  onSelectDiscipline: (discipline: DisciplineType) => void;
  onOpenSearch: () => void;
  onExportReport: () => void;
  onResetActive: () => void;
  onOpenPublishGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeDiscipline,
  onSelectDiscipline,
  onOpenSearch,
  onExportReport,
  onResetActive,
  onOpenPublishGuide,
}) => {
  const navItems: { id: DisciplineType; label: string }[] = [
    { id: 'scientific', label: 'Scientific' },
    { id: 'mechanical', label: 'Mechanical' },
    { id: 'chemical', label: 'Chemical' },
    { id: 'civil', label: 'Civil' },
    { id: 'units', label: 'Units & Constants' },
    { id: 'lecture', label: 'Lecture Lab' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectDiscipline('scientific');
            }}
            className="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
          >
            CalculatorForAll
          </a>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeDiscipline === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectDiscipline(item.id)}
                className={`whitespace-nowrap transition-colors py-1 relative ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSearch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-white transition-colors"
            title="Search Formulas & Solvers (Ctrl/Cmd + K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search Formula</span>
            <kbd className="hidden lg:inline text-[10px] text-slate-500 bg-slate-800 px-1 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onOpenPublishGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-950/60 hover:text-emerald-300 transition-colors"
            title="Google Play Store Publishing Guide"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publish to Play Store</span>
          </button>

          <button
            onClick={onResetActive}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
            title="Reset current module parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-950"
            title="Generate academic calculation summary"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Sheet</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-850 px-4 py-2 gap-4 scrollbar-none text-xs">
        {navItems.map((item) => {
          const isActive = activeDiscipline === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectDiscipline(item.id)}
              className={`whitespace-nowrap px-2 py-1 rounded transition-colors ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

