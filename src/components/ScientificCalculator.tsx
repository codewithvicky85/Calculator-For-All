/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { evaluateScientificExpression } from '../utils/mathEvaluator';
import { CalculationHistoryItem } from '../types';
import { Delete, History, Copy, Check, RotateCcw } from 'lucide-react';

interface ScientificCalculatorProps {
  onAddHistory: (item: CalculationHistoryItem) => void;
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  onAddHistory,
  history,
  onClearHistory,
}) => {
  const [expression, setExpression] = useState('');
  const [liveResult, setLiveResult] = useState<string>('0');
  const [hasError, setHasError] = useState(false);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePad, setActivePad] = useState<'standard' | 'hyperbolic'>('standard');
  const inputRef = useRef<HTMLInputElement>(null);

  // Live evaluation on expression change
  useEffect(() => {
    if (!expression.trim()) {
      setLiveResult('0');
      setHasError(false);
      return;
    }
    const evalRes = evaluateScientificExpression(expression, angleMode);
    if (evalRes.success && evalRes.formatted !== undefined) {
      setLiveResult(evalRes.formatted);
      setHasError(false);
    } else {
      // Don't show hard error during live typing unless enter pressed
      setHasError(false);
    }
  }, [expression, angleMode]);

  const handleCalculate = () => {
    if (!expression.trim()) return;
    const evalRes = evaluateScientificExpression(expression, angleMode);
    if (evalRes.success && evalRes.formatted !== undefined) {
      setLiveResult(evalRes.formatted);
      setHasError(false);
      onAddHistory({
        id: 'calc-' + Date.now(),
        expression,
        result: evalRes.formatted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        discipline: 'Scientific',
      });
    } else {
      setLiveResult(evalRes.error || 'Syntax Error');
      setHasError(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCalculate();
    }
  };

  const appendSymbol = (sym: string) => {
    setExpression((prev) => prev + sym);
    inputRef.current?.focus();
  };

  const clearAll = () => {
    setExpression('');
    setLiveResult('0');
    setHasError(false);
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  // Memory operations
  const handleMemory = (op: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    const currentNum = parseFloat(liveResult) || 0;
    if (op === 'MC') setMemoryValue(0);
    if (op === 'MR') appendSymbol(memoryValue.toString());
    if (op === 'M+') setMemoryValue((prev) => prev + currentNum);
    if (op === 'M-') setMemoryValue((prev) => prev - currentNum);
    if (op === 'MS') setMemoryValue(currentNum);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left/Main: Calculator Console */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        {/* Top Control Ribbon: Angle Mode & Pad Switch */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              Angle Mode:
            </span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setAngleMode('DEG')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  angleMode === 'DEG'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DEG
              </button>
              <button
                onClick={() => setAngleMode('RAD')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  angleMode === 'RAD'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RAD
              </button>
            </div>
            {memoryValue !== 0 && (
              <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                MEM: {memoryValue}
              </span>
            )}
          </div>

          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActivePad('standard')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activePad === 'standard'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard Functions
            </button>
            <button
              onClick={() => setActivePad('hyperbolic')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activePad === 'hyperbolic'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hyperbolic & Advanced
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="my-4 bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-inner">
          <input
            ref={inputRef}
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter mathematical or scientific expression..."
            className="w-full bg-transparent text-right font-mono text-lg text-slate-300 placeholder-slate-600 focus:outline-none tracking-wide"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900">
            <span className="text-xs font-mono text-slate-400">
              =
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight tabular-nums ${
                  hasError ? 'text-rose-400' : 'text-cyan-400'
                }`}
              >
                {liveResult}
              </span>
              <button
                onClick={() => copyToClipboard(liveResult, 'main-result')}
                className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
                title="Copy result"
              >
                {copiedId === 'main-result' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Memory Bar */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {(['MC', 'MR', 'M+', 'M-', 'MS'] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleMemory(m)}
              className="py-1.5 text-xs font-mono font-medium bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-colors"
            >
              {m}
            </button>
          ))}
        </div>

        {/* Keypad Grid */}
        {activePad === 'standard' ? (
          <div className="grid grid-cols-6 gap-2 text-sm font-mono">
            {/* Row 1 */}
            <button onClick={() => appendSymbol('sin(')} className="calc-btn-fn">sin</button>
            <button onClick={() => appendSymbol('cos(')} className="calc-btn-fn">cos</button>
            <button onClick={() => appendSymbol('tan(')} className="calc-btn-fn">tan</button>
            <button onClick={clearAll} className="calc-btn-action text-rose-400 hover:bg-rose-950/40">AC</button>
            <button onClick={backspace} className="calc-btn-action">
              <Delete className="w-4 h-4 mx-auto" />
            </button>
            <button onClick={() => appendSymbol('/')} className="calc-btn-op">÷</button>

            {/* Row 2 */}
            <button onClick={() => appendSymbol('ln(')} className="calc-btn-fn">ln</button>
            <button onClick={() => appendSymbol('log(')} className="calc-btn-fn">log₁₀</button>
            <button onClick={() => appendSymbol('^')} className="calc-btn-fn">xʸ</button>
            <button onClick={() => appendSymbol('7')} className="calc-btn-num">7</button>
            <button onClick={() => appendSymbol('8')} className="calc-btn-num">8</button>
            <button onClick={() => appendSymbol('9')} className="calc-btn-num">9</button>

            {/* Row 3 */}
            <button onClick={() => appendSymbol('sqrt(')} className="calc-btn-fn">√x</button>
            <button onClick={() => appendSymbol('^2')} className="calc-btn-fn">x²</button>
            <button onClick={() => appendSymbol('pi')} className="calc-btn-fn">π</button>
            <button onClick={() => appendSymbol('4')} className="calc-btn-num">4</button>
            <button onClick={() => appendSymbol('5')} className="calc-btn-num">5</button>
            <button onClick={() => appendSymbol('6')} className="calc-btn-num">6</button>

            {/* Row 4 */}
            <button onClick={() => appendSymbol('e')} className="calc-btn-fn">e</button>
            <button onClick={() => appendSymbol('!')} className="calc-btn-fn">n!</button>
            <button onClick={() => appendSymbol('*')} className="calc-btn-op">×</button>
            <button onClick={() => appendSymbol('1')} className="calc-btn-num">1</button>
            <button onClick={() => appendSymbol('2')} className="calc-btn-num">2</button>
            <button onClick={() => appendSymbol('3')} className="calc-btn-num">3</button>

            {/* Row 5 */}
            <button onClick={() => appendSymbol('(')} className="calc-btn-fn">(</button>
            <button onClick={() => appendSymbol(')')} className="calc-btn-fn">)</button>
            <button onClick={() => appendSymbol('-')} className="calc-btn-op">−</button>
            <button onClick={() => appendSymbol('0')} className="calc-btn-num">0</button>
            <button onClick={() => appendSymbol('.')} className="calc-btn-num">.</button>
            <button onClick={() => appendSymbol('+')} className="calc-btn-op">+</button>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2 text-sm font-mono">
            {/* Hyperbolic Row 1 */}
            <button onClick={() => appendSymbol('sinh(')} className="calc-btn-fn">sinh</button>
            <button onClick={() => appendSymbol('cosh(')} className="calc-btn-fn">cosh</button>
            <button onClick={() => appendSymbol('tanh(')} className="calc-btn-fn">tanh</button>
            <button onClick={clearAll} className="calc-btn-action text-rose-400">AC</button>
            <button onClick={backspace} className="calc-btn-action">
              <Delete className="w-4 h-4 mx-auto" />
            </button>
            <button onClick={() => appendSymbol('/')} className="calc-btn-op">÷</button>

            {/* Hyperbolic Row 2 */}
            <button onClick={() => appendSymbol('asin(')} className="calc-btn-fn">sin⁻¹</button>
            <button onClick={() => appendSymbol('acos(')} className="calc-btn-fn">cos⁻¹</button>
            <button onClick={() => appendSymbol('atan(')} className="calc-btn-fn">tan⁻¹</button>
            <button onClick={() => appendSymbol('7')} className="calc-btn-num">7</button>
            <button onClick={() => appendSymbol('8')} className="calc-btn-num">8</button>
            <button onClick={() => appendSymbol('9')} className="calc-btn-num">9</button>

            {/* Hyperbolic Row 3 */}
            <button onClick={() => appendSymbol('cbrt(')} className="calc-btn-fn">∛x</button>
            <button onClick={() => appendSymbol('exp(')} className="calc-btn-fn">eˣ</button>
            <button onClick={() => appendSymbol('abs(')} className="calc-btn-fn">|x|</button>
            <button onClick={() => appendSymbol('4')} className="calc-btn-num">4</button>
            <button onClick={() => appendSymbol('5')} className="calc-btn-num">5</button>
            <button onClick={() => appendSymbol('6')} className="calc-btn-num">6</button>

            {/* Hyperbolic Row 4 */}
            <button onClick={() => appendSymbol('1/(')} className="calc-btn-fn">1/x</button>
            <button onClick={() => appendSymbol('*(10^')} className="calc-btn-fn">×10ⁿ</button>
            <button onClick={() => appendSymbol('*')} className="calc-btn-op">×</button>
            <button onClick={() => appendSymbol('1')} className="calc-btn-num">1</button>
            <button onClick={() => appendSymbol('2')} className="calc-btn-num">2</button>
            <button onClick={() => appendSymbol('3')} className="calc-btn-num">3</button>

            {/* Hyperbolic Row 5 */}
            <button onClick={() => appendSymbol('(')} className="calc-btn-fn">(</button>
            <button onClick={() => appendSymbol(')')} className="calc-btn-fn">)</button>
            <button onClick={() => appendSymbol('-')} className="calc-btn-op">−</button>
            <button onClick={() => appendSymbol('0')} className="calc-btn-num">0</button>
            <button onClick={() => appendSymbol('.')} className="calc-btn-num">.</button>
            <button onClick={() => appendSymbol('+')} className="calc-btn-op">+</button>
          </div>
        )}

        {/* Big Calculate Button */}
        <button
          onClick={handleCalculate}
          className="w-full mt-3 py-3 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-md text-base"
        >
          Evaluate & Record Answer [Enter]
        </button>
      </div>

      {/* Right: History & Calculation Ledger */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">
              Calculation Ledger
            </span>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Ledger Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-850 mt-2 space-y-2 pr-1">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <span className="text-xs">No saved calculations yet.</span>
              <span className="text-[11px] text-slate-600 mt-1">
                Evaluated results and multi-discipline derivations will appear here.
              </span>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">{item.timestamp}</span>
                  {item.discipline && (
                    <span className="text-cyan-400/80 font-mono">
                      {item.discipline}
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs text-slate-300 break-all">
                  {item.expression}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-sm font-bold text-cyan-400 tabular-nums">
                    = {item.result}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => appendSymbol(item.result)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Insert value into current expression"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.result, item.id)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy result"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
