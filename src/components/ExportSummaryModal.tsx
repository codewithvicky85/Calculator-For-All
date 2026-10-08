/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalculationHistoryItem } from '../types';
import { X, Copy, Check, Printer, FileDown } from 'lucide-react';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownReport = () => {
    let md = `# CalculatorForAll Engineering Calculation Report\n`;
    md += `Generated: ${new Date().toLocaleString()}\n\n`;
    md += `## Calculation Ledger & Derivations\n\n`;

    if (history.length === 0) {
      md += `*No calculations recorded in this session.*\n`;
    } else {
      md += `| # | Time | Discipline | Expression / Problem | Evaluated Result |\n`;
      md += `|---|---|---|---|---|\n`;
      history.forEach((h, idx) => {
        md += `| ${idx + 1} | ${h.timestamp} | ${h.discipline || 'General'} | \`${h.expression}\` | **${h.result}** |\n`;
      });
    }

    md += `\n---\n*CalculatorForAll Engineering & Scientific Calculator Suite — Mechanical, Chemical, Civil & Applied Physics Tools*`;
    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Export Calculation Sheet
            </h3>
            <p className="text-xs text-slate-400">
              Academic summary of current session calculations, formulas, and derivations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
            <div className="border-b border-slate-800 pb-2 flex justify-between text-slate-500">
              <span>CALCULATORFORALL CALCULATION REPORT</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                Ledger is currently empty. Execute calculations in the Scientific, Mechanical, Chemical, or Civil tabs to generate entries.
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={h.id} className="p-2.5 bg-slate-900 rounded border border-slate-850 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>[{i + 1}] {h.discipline} · {h.timestamp}</span>
                    </div>
                    <div className="text-slate-200">{h.expression}</div>
                    <div className="text-cyan-400 font-bold">{h.result}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {history.length} calculation{history.length !== 1 ? 's' : ''} in report
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copy Markdown</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
