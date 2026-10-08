/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DisciplineType = 'scientific' | 'mechanical' | 'chemical' | 'civil' | 'units' | 'lecture';

export interface PhysicalConstant {
  id: string;
  name: string;
  symbol: string;
  value: number;
  unit: string;
  category: 'Universal' | 'Thermodynamics' | 'Mechanics & Fluids' | 'Electromagnetism' | 'Material Properties';
  description: string;
}

export interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string;
  units: {
    symbol: string;
    name: string;
    toBase: (val: number) => number;
    fromBase: (val: number) => number;
  }[];
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  discipline?: string;
  note?: string;
}

export interface StepDerivation {
  stepNumber: number;
  title: string;
  formula: string;
  substitution: string;
  resultWithUnits: string;
  explanation: string;
}

export interface LectureProblem {
  id: string;
  discipline: 'mechanical' | 'chemical' | 'civil';
  topic: string;
  title: string;
  difficulty: 'Undergraduate Core (Yr 1-2)' | 'Advanced Engineering (Yr 3-4)' | 'Graduate / Professional FE/PE';
  statement: string;
  givenData: Record<string, string>;
  steps: StepDerivation[];
  finalAnswer: string;
  pedagogicalNotes: string;
}
