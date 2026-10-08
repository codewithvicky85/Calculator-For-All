/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UNIT_CATEGORIES } from '../data/units';
import { ENGINEERING_CONSTANTS } from '../data/constants';
import { PhysicalConstant } from '../types';
import { ArrowUpDown, Atom, Copy, Check, Search } from 'lucide-react';

interface UnitConverterAndConstantsProps {
  onInsertConstant?: (value: string) => void;
}

export const UnitConverterAndConstants: React.FC<UnitConverterAndConstantsProps> = ({
  onInsertConstant,
}) => {
  // Tab state: Unit Converter vs Constants Table
  const [activeTab, setActiveTab] = useState<'converter' | 'constants'>('converter');

  // Converter state
  const [selectedCatId, setSelectedCatId] = useState<string>('pressure_stress');
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnitIndex, setFromUnitIndex] = useState<number>(1); // kPa default
  const [toUnitIndex, setToUnitIndex] = useState<number>(5); // psi default
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Constants search & category filter
  const [constantQuery, setConstantQuery] = useState<string>('');
  const [constantCategory, setConstantCategory] = useState<string>('All');

  const activeCategory = UNIT_CATEGORIES.find((c) => c.id === selectedCatId) || UNIT_CATEGORIES[0];
  const fromUnit = activeCategory.units[fromUnitIndex] || activeCategory.units[0];
  const toUnit = activeCategory.units[toUnitIndex] || activeCategory.units[0];

  // Convert
  const baseValue = fromUnit.toBase(inputValue);
  const convertedValue = toUnit.fromBase(baseValue);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredConstants = ENGINEERING_CONSTANTS.filter((c) => {
    const matchesCat = constantCategory === 'All' || c.category === constantCategory;
    const q = constantQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q) ||
      c.unit.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const constantCategories = ['All', 'Thermodynamics', 'Mechanics & Fluids', 'Material Properties', 'Universal', 'Electromagnetism'];

  return (
    <div className="space-y-6">
      {/* Top Segmented Controls */}
      <div className="flex items-center justify-between p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'converter'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Dimensional Unit Converter</span>
          </button>
          <button
            onClick={() => setActiveTab('constants')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'constants'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Engineering Physical Constants</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DIMENSIONAL UNIT CONVERTER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'converter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Dimensional Domain Selector
            </h3>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {UNIT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCatId(cat.id);
                    setFromUnitIndex(0);
                    setToUnitIndex(Math.min(1, cat.units.length - 1));
                  }}
                  className={`p-2 rounded-lg border text-left transition-colors font-medium ${
                    selectedCatId === cat.id
                      ? 'bg-rose-400/10 border-rose-400 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Inputs & Units */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="text-xs">
                <label className="block text-slate-400 mb-1 font-mono">VALUE TO CONVERT</label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">FROM UNIT</label>
                  <select
                    value={fromUnitIndex}
                    onChange={(e) => setFromUnitIndex(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs focus:outline-none"
                  >
                    {activeCategory.units.map((u, idx) => (
                      <option key={u.symbol} value={idx}>
                        {u.symbol} ({u.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">TO UNIT</label>
                  <select
                    value={toUnitIndex}
                    onChange={(e) => setToUnitIndex(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs focus:outline-none"
                  >
                    {activeCategory.units.map((u, idx) => (
                      <option key={u.symbol} value={idx}>
                        {u.symbol} ({u.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Converted Hero Display */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                CONVERTED VALUE
              </span>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-mono font-bold text-rose-400 tabular-nums">
                  {Math.abs(convertedValue) < 1e-4 || Math.abs(convertedValue) >= 1e6
                    ? convertedValue.toExponential(6)
                    : convertedValue.toFixed(4)}{' '}
                  <span className="text-xs text-slate-400 font-normal">{toUnit.symbol}</span>
                </div>
                <button
                  onClick={() => copyText(convertedValue.toString(), 'main-convert')}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  {copiedKey === 'main-convert' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Full Dimensional Equivalence Matrix */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200">
                Full Equivalence Table across all {activeCategory.name} Units
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Base: {activeCategory.baseUnit}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 px-3">Unit</th>
                    <th className="py-2 px-3">Full Name</th>
                    <th className="py-2 px-3 text-right">Equivalent Quantity</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {activeCategory.units.map((unit) => {
                    const equiv = unit.fromBase(baseValue);
                    const formatted =
                      Math.abs(equiv) < 1e-4 || Math.abs(equiv) >= 1e6
                        ? equiv.toExponential(5)
                        : equiv.toFixed(4);
                    const isSelectedTarget = unit.symbol === toUnit.symbol;

                    return (
                      <tr
                        key={unit.symbol}
                        className={`hover:bg-slate-950/40 transition-colors ${
                          isSelectedTarget ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-200">
                          {unit.symbol}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{unit.name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-300 tabular-nums">
                          {formatted}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => copyText(formatted, 'tbl-' + unit.symbol)}
                            className="p-1 text-slate-500 hover:text-white transition-colors"
                            title="Copy converted value"
                          >
                            {copiedKey === 'tbl-' + unit.symbol ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 inline" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 inline" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PHYSICAL CONSTANTS TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'constants' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search constant name, symbol, or description..."
                value={constantQuery}
                onChange={(e) => setConstantQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1 text-xs">
              {constantCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setConstantCategory(c)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    constantCategory === c
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Constants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredConstants.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold font-mono text-cyan-400">
                      {c.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {c.category}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {c.name}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-100 tabular-nums block">
                      {c.value.toExponential(6)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {c.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyText(c.value.toString(), 'const-' + c.id)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy numeric value"
                    >
                      {copiedKey === 'const-' + c.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {onInsertConstant && (
                      <button
                        onClick={() => onInsertConstant(c.value.toString())}
                        className="text-[10px] px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors"
                        title="Send value to calculator"
                      >
                        Use in Calc
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
