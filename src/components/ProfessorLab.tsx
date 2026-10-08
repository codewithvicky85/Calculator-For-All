/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LECTURE_PROBLEMS } from '../data/lectureProblems';
import { LectureProblem } from '../types';
import { BookOpen, GraduationCap, Copy, Check, Printer, FileText, ChevronRight } from 'lucide-react';

interface ProfessorLabProps {
  onExportWorksheet?: (content: string) => void;
}

export const ProfessorLab: React.FC<ProfessorLabProps> = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<'all' | 'mechanical' | 'chemical' | 'civil'>('all');
  const [activeProblemId, setActiveProblemId] = useState<string>(LECTURE_PROBLEMS[0].id);
  const [showSolutionKey, setShowSolutionKey] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active problem
  const activeProblem = LECTURE_PROBLEMS.find((p) => p.id === activeProblemId) || LECTURE_PROBLEMS[0];

  const filteredProblems = LECTURE_PROBLEMS.filter(
    (p) => selectedDiscipline === 'all' || p.discipline === selectedDiscipline
  );

  const copyProblemText = () => {
    let text = `==========================================================\n`;
    text += `TITLE: ${activeProblem.title}\n`;
    text += `TOPIC: ${activeProblem.topic}\n`;
    text += `DIFFICULTY: ${activeProblem.difficulty}\n`;
    text += `==========================================================\n\n`;
    text += `PROBLEM STATEMENT:\n${activeProblem.statement}\n\n`;
    text += `GIVEN DATA:\n`;
    Object.entries(activeProblem.givenData).forEach(([k, v]) => {
      text += ` - ${k}: ${v}\n`;
    });
    if (showSolutionKey) {
      text += `\nINSTRUCTOR STEP-BY-STEP SOLUTION KEY:\n`;
      activeProblem.steps.forEach((s) => {
        text += `\n[Step ${s.stepNumber}: ${s.title}]\n`;
        text += `Formula: ${s.formula}\n`;
        text += `Substitution: ${s.substitution}\n`;
        text += `Result: ${s.resultWithUnits}\n`;
        text += `Notes: ${s.explanation}\n`;
      });
      text += `\nFINAL ANSWER: ${activeProblem.finalAnswer}\n`;
      text += `PEDAGOGICAL LECTURE NOTES: ${activeProblem.pedagogicalNotes}\n`;
    }
    navigator.clipboard.writeText(text);
    setCopiedKey('problem-copied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the Lecture Lab for students and professors */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-slate-100">
              Professor & Student Lecture Lab
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Pedagogical step-by-step analytical derivations, dimensional verification, and assignment problem generation across mechanical, chemical, and civil engineering curricula.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle between Student Homework View and Instructor Solution Key */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setShowSolutionKey(false)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                !showSolutionKey
                  ? 'bg-slate-800 text-purple-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Question View
            </button>
            <button
              onClick={() => setShowSolutionKey(true)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                showSolutionKey
                  ? 'bg-purple-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Instructor Solution Key
            </button>
          </div>

          <button
            onClick={copyProblemText}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            {copiedKey === 'problem-copied' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Text</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-purple-400 rounded-lg hover:bg-purple-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Problem Selector (Left) & Active Derivation Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Directory */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              CURATED PROBLEMS
            </span>
            <div className="flex gap-1 text-[11px]">
              {(['all', 'mechanical', 'chemical', 'civil'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDiscipline(d)}
                  className={`px-2 py-0.5 rounded capitalize transition-colors ${
                    selectedDiscipline === d
                      ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d === 'all' ? 'All' : d.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredProblems.map((prob) => {
              const isSelected = prob.id === activeProblem.id;
              return (
                <button
                  key={prob.id}
                  onClick={() => setActiveProblemId(prob.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all space-y-1.5 group ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 capitalize">
                      {prob.discipline}
                    </span>
                    <span className="text-[10px] text-purple-400/90 font-mono">
                      {prob.difficulty}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {prob.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Problem Statement & Step-by-Step Derivation */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          {/* Problem Header */}
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="capitalize text-purple-400 font-semibold font-mono">
                {activeProblem.discipline} Engineering
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeProblem.topic}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-400">{activeProblem.difficulty}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">
              {activeProblem.title}
            </h1>
          </div>

          {/* Statement */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              PROBLEM STATEMENT
            </span>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed">
              {activeProblem.statement}
            </div>
          </div>

          {/* Given Data Parameters */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              GIVEN PARAMETERS & BOUNDARY CONDITIONS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
              {Object.entries(activeProblem.givenData).map(([k, v]) => (
                <div key={k} className="p-2.5 bg-slate-950 rounded-lg border border-slate-850">
                  <span className="text-slate-500 block text-[11px]">{k}</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* If Student View: scratchpad and answer input prompt */}
          {!showSolutionKey && (
            <div className="p-6 bg-slate-950/80 rounded-xl border border-dashed border-purple-500/40 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-purple-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-200">
                Student Assignment Mode
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Students can solve this problem by hand or test their algebraic steps in the Scientific and Discipline Calculator tabs before toggling the Instructor Solution Key.
              </p>
              <button
                onClick={() => setShowSolutionKey(true)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-purple-400 hover:bg-purple-300 rounded-lg transition-colors"
              >
                Reveal Instructor Solution & Derivations
              </button>
            </div>
          )}

          {/* If Instructor Solution Key: Full Step-by-Step Derivations */}
          {showSolutionKey && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  STEP-BY-STEP ANALYTICAL DERIVATION
                </span>
                <span className="text-xs text-slate-500">
                  {activeProblem.steps.length} Analytical Stages
                </span>
              </div>

              <div className="space-y-3">
                {activeProblem.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold flex items-center justify-center border border-purple-500/30">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-200">
                          {step.title}
                        </h4>
                      </div>
                    </div>

                    {/* Formula & Substitution Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                        <span className="text-slate-500 block text-[10px]">GOVERNING FORMULA:</span>
                        <span className="text-purple-300 font-bold mt-0.5 block">{step.formula}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                        <span className="text-slate-500 block text-[10px]">NUMERICAL SUBSTITUTION:</span>
                        <span className="text-slate-300 mt-0.5 block break-all">{step.substitution}</span>
                      </div>
                    </div>

                    {/* Stage Result */}
                    <div className="flex items-center justify-between p-2.5 bg-purple-950/20 rounded-lg border border-purple-500/20">
                      <span className="text-xs font-mono text-slate-400">STAGE RESULT:</span>
                      <span className="text-sm font-mono font-bold text-purple-300 tabular-nums">
                        {step.resultWithUnits}
                      </span>
                    </div>

                    {/* Explanation */}
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                      {step.explanation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Boxed Final Answer */}
              <div className="p-4 bg-purple-950/40 border border-purple-500/60 rounded-xl space-y-1">
                <span className="text-[11px] font-mono text-purple-300 font-semibold uppercase tracking-wider">
                  FINAL VERIFIED RESULT
                </span>
                <div className="text-base sm:text-lg font-mono font-bold text-white tabular-nums">
                  {activeProblem.finalAnswer}
                </div>
              </div>

              {/* Pedagogical Commentary for Professors */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block font-semibold">
                  PROFESSOR'S PEDAGOGICAL NOTES
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeProblem.pedagogicalNotes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
