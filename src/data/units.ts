/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitCategory } from '../types';

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'pressure_stress',
    name: 'Pressure & Stress',
    baseUnit: 'Pa',
    units: [
      { symbol: 'Pa', name: 'Pascal (N/m²)', toBase: (v) => v, fromBase: (v) => v },
      { symbol: 'kPa', name: 'Kilopascal', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { symbol: 'MPa', name: 'Megapascal (N/mm²)', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { symbol: 'GPa', name: 'Gigapascal', toBase: (v) => v * 1e9, fromBase: (v) => v / 1e9 },
      { symbol: 'bar', name: 'Bar', toBase: (v) => v * 1e5, fromBase: (v) => v / 1e5 },
      { symbol: 'psi', name: 'Pound / sq inch (psi)', toBase: (v) => v * 6894.75729, fromBase: (v) => v / 6894.75729 },
      { symbol: 'ksi', name: 'Kip / sq inch (ksi)', toBase: (v) => v * 6.89475729e6, fromBase: (v) => v / 6.89475729e6 },
      { symbol: 'atm', name: 'Standard Atmosphere', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { symbol: 'mmHg / Torr', name: 'Millimeter of Mercury', toBase: (v) => v * 133.322387, fromBase: (v) => v / 133.322387 },
    ]
  },
  {
    id: 'flow_rate',
    name: 'Volumetric Flow Rate',
    baseUnit: 'm³/s',
    units: [
      { symbol: 'm³/s', name: 'Cubic meter per second', toBase: (v) => v, fromBase: (v) => v },
      { symbol: 'm³/h', name: 'Cubic meter per hour', toBase: (v) => v / 3600, fromBase: (v) => v * 3600 },
      { symbol: 'L/s', name: 'Liter per second', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { symbol: 'L/min', name: 'Liter per minute', toBase: (v) => v / 60000, fromBase: (v) => v * 60000 },
      { symbol: 'GPM (US)', name: 'US Gallons per minute', toBase: (v) => v * 0.0000630901964, fromBase: (v) => v / 0.0000630901964 },
      { symbol: 'CFM', name: 'Cubic feet per min (ft³/min)', toBase: (v) => v * 0.000471947443, fromBase: (v) => v / 0.000471947443 },
      { symbol: 'cfs', name: 'Cubic feet per second (ft³/s)', toBase: (v) => v * 0.0283168466, fromBase: (v) => v / 0.0283168466 },
    ]
  },
  {
    id: 'viscosity_dynamic',
    name: 'Dynamic Viscosity',
    baseUnit: 'Pa·s',
    units: [
      { symbol: 'Pa·s', name: 'Pascal-second (kg/(m·s))', toBase: (v) => v, fromBase: (v) => v },
      { symbol: 'mPa·s / cP', name: 'Centipoise (cP)', toBase: (v) => v * 0.001, fromBase: (v) => v * 1000 },
      { symbol: 'Poise (P)', name: 'Poise (dyne·s/cm²)', toBase: (v) => v * 0.1, fromBase: (v) => v * 10 },
      { symbol: 'lbf·s/ft²', name: 'Pound-force second / ft²', toBase: (v) => v * 47.880259, fromBase: (v) => v / 47.880259 },
    ]
  },
  {
    id: 'energy_heat',
    name: 'Energy, Work & Heat',
    baseUnit: 'J',
    units: [
      { symbol: 'J', name: 'Joule', toBase: (v) => v, fromBase: (v) => v },
      { symbol: 'kJ', name: 'Kilojoule', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { symbol: 'MJ', name: 'Megajoule', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { symbol: 'cal', name: 'Calorie (thermochemical)', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      { symbol: 'kcal', name: 'Kilocalorie', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      { symbol: 'BTU', name: 'British Thermal Unit (ISO)', toBase: (v) => v * 1055.05585, fromBase: (v) => v / 1055.05585 },
      { symbol: 'kWh', name: 'Kilowatt-hour', toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
      { symbol: 'hp·h', name: 'Horsepower-hour', toBase: (v) => v * 2.6845195e6, fromBase: (v) => v / 2.6845195e6 },
      { symbol: 'ft·lbf', name: 'Foot-pound force', toBase: (v) => v * 1.35581795, fromBase: (v) => v / 1.35581795 },
    ]
  },
  {
    id: 'power',
    name: 'Power & Heat Rate',
    baseUnit: 'W',
    units: [
      { symbol: 'W', name: 'Watt (J/s)', toBase: (v) => v, fromBase: (v) => v },
      { symbol: 'kW', name: 'Kilowatt', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { symbol: 'MW', name: 'Megawatt', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { symbol: 'hp (mech)', name: 'Mechanical Horsepower (550 ft·lb/s)', toBase: (v) => v * 745.699872, fromBase: (v) => v / 745.699872 },
      { symbol: 'hp (metric)', name: 'Metric Horsepower (CV / PS)', toBase: (v) => v * 735.49875, fromBase: (v) => v / 735.49875 },
      { symbol: 'BTU/h', name: 'BTU per hour', toBase: (v) => v * 0.29307107, fromBase: (v) => v / 0.29307107 },
      { symbol: 'tons ref.', name: 'Tons of Refrigeration', toBase: (v) => v * 3516.85284, fromBase: (v) => v / 3516.85284 },
    ]
  },
  {
    id: 'force',
    name: 'Force & Weight',
    baseUnit: 'N',
    units: [
      { symbol: 'N', name: 'Newton', toBase: (v) => v, fromBase: (v) => v },
      { symbol: 'kN', name: 'Kilonewton', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { symbol: 'lbf', name: 'Pound-force', toBase: (v) => v * 4.44822162, fromBase: (v) => v / 4.44822162 },
      { symbol: 'kip', name: 'Kip (1000 lbf)', toBase: (v) => v * 4448.22162, fromBase: (v) => v / 4448.22162 },
      { symbol: 'kgf / kp', name: 'Kilogram-force', toBase: (v) => v * 9.80665, fromBase: (v) => v / 9.80665 },
      { symbol: 'dyne', name: 'Dyne', toBase: (v) => v * 1e-5, fromBase: (v) => v * 1e5 },
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'K',
    units: [
      { symbol: 'K', name: 'Kelvin', toBase: (v) => v, fromBase: (v) => v },
      { symbol: '°C', name: 'Degree Celsius', toBase: (v) => v + 273.15, fromBase: (v) => v - 273.15 },
      { symbol: '°F', name: 'Degree Fahrenheit', toBase: (v) => (v - 32) * (5 / 9) + 273.15, fromBase: (v) => (v - 273.15) * (9 / 5) + 32 },
      { symbol: '°R', name: 'Rankine', toBase: (v) => v * (5 / 9), fromBase: (v) => v * (9 / 5) },
    ]
  },
  {
    id: 'length',
    name: 'Length & Distance',
    baseUnit: 'm',
    units: [
      { symbol: 'm', name: 'Meter', toBase: (v) => v, fromBase: (v) => v },
      { symbol: 'mm', name: 'Millimeter', toBase: (v) => v * 1e-3, fromBase: (v) => v * 1e3 },
      { symbol: 'cm', name: 'Centimeter', toBase: (v) => v * 1e-2, fromBase: (v) => v * 1e2 },
      { symbol: 'km', name: 'Kilometer', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { symbol: 'in', name: 'Inch', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { symbol: 'ft', name: 'Foot', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { symbol: 'yd', name: 'Yard', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { symbol: 'mi', name: 'Mile', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ]
  }
];
