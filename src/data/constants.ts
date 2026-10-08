/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhysicalConstant } from '../types';

export const ENGINEERING_CONSTANTS: PhysicalConstant[] = [
  {
    id: 'R_gas',
    name: 'Universal Gas Constant',
    symbol: 'R',
    value: 8.314462618,
    unit: 'J / (mol·K)',
    category: 'Thermodynamics',
    description: 'Constant in ideal and real gas laws, reaction kinetics, and electrochemical equations.'
  },
  {
    id: 'R_gas_liters',
    name: 'Gas Constant (L·atm)',
    symbol: 'R_atm',
    value: 0.082057338,
    unit: 'L·atm / (mol·K)',
    category: 'Thermodynamics',
    description: 'Frequently used in chemical reaction and phase equilibrium calculations.'
  },
  {
    id: 'g_accel',
    name: 'Standard Gravitational Acceleration',
    symbol: 'g',
    value: 9.80665,
    unit: 'm / s²',
    category: 'Mechanics & Fluids',
    description: 'Standard Earth surface acceleration (32.174 ft/s² in US customary).'
  },
  {
    id: 'g_us',
    name: 'Gravitational Accel. (US Customary)',
    symbol: 'g_fps',
    value: 32.1740,
    unit: 'ft / s²',
    category: 'Mechanics & Fluids',
    description: 'Standard gravitational acceleration in feet per second squared.'
  },
  {
    id: 'p_atm',
    name: 'Standard Atmospheric Pressure',
    symbol: 'P_atm',
    value: 101325,
    unit: 'Pa (1.01325 bar)',
    category: 'Thermodynamics',
    description: '1 atmosphere at sea level = 14.696 psi = 760 mmHg.'
  },
  {
    id: 'stefan_boltzmann',
    name: 'Stefan-Boltzmann Constant',
    symbol: 'σ',
    value: 5.670374419e-8,
    unit: 'W / (m²·K⁴)',
    category: 'Thermodynamics',
    description: 'Blackbody radiation thermal emissive power coefficient.'
  },
  {
    id: 'avogadro',
    name: 'Avogadro Constant',
    symbol: 'N_A',
    value: 6.02214076e23,
    unit: 'mol⁻¹',
    category: 'Universal',
    description: 'Number of constituent particles in one mole of a substance.'
  },
  {
    id: 'boltzmann',
    name: 'Boltzmann Constant',
    symbol: 'k_B',
    value: 1.380649e-23,
    unit: 'J / K',
    category: 'Thermodynamics',
    description: 'Relates average relative kinetic energy of gas molecules with temperature.'
  },
  {
    id: 'c_light',
    name: 'Speed of Light in Vacuum',
    symbol: 'c',
    value: 299792458,
    unit: 'm / s',
    category: 'Universal',
    description: 'Fundamental physical constant across physics and wave mechanics.'
  },
  {
    id: 'planck',
    name: 'Planck Constant',
    symbol: 'h',
    value: 6.62607015e-34,
    unit: 'J·s',
    category: 'Universal',
    description: 'Quantum of electromagnetic action and photon energy.'
  },
  {
    id: 'density_water_4c',
    name: 'Density of Water (at 4°C, 1 atm)',
    symbol: 'ρ_water',
    value: 1000,
    unit: 'kg / m³',
    category: 'Mechanics & Fluids',
    description: 'Standard reference density for hydraulic and civil engineering calculations.'
  },
  {
    id: 'viscosity_water_20c',
    name: 'Dynamic Viscosity of Water (20°C)',
    symbol: 'μ_water',
    value: 0.001002,
    unit: 'Pa·s (1.002 cP)',
    category: 'Mechanics & Fluids',
    description: 'Reference dynamic viscosity for pipe flow and Reynolds calculations.'
  },
  {
    id: 'modulus_steel',
    name: 'Young Modulus - Structural Steel (A36)',
    symbol: 'E_steel',
    value: 200e9,
    unit: 'Pa (200 GPa)',
    category: 'Material Properties',
    description: 'Elastic modulus for structural carbon steel (29,000 ksi in US).'
  },
  {
    id: 'modulus_al',
    name: 'Young Modulus - Aluminum 6061-T6',
    symbol: 'E_al',
    value: 68.9e9,
    unit: 'Pa (68.9 GPa)',
    category: 'Material Properties',
    description: 'Elastic modulus for aerospace and structural grade aluminum (10,000 ksi).'
  },
  {
    id: 'modulus_concrete',
    name: 'Young Modulus - Normal Concrete (4000 psi)',
    symbol: 'E_conc',
    value: 24.8e9,
    unit: 'Pa (24.8 GPa)',
    category: 'Material Properties',
    description: 'Approximate elastic modulus computed via 57,000 * sqrt(f\'c).'
  },
  {
    id: 'perm_vacuum',
    name: 'Vacuum Permittivity',
    symbol: 'ε_0',
    value: 8.8541878128e-12,
    unit: 'F / m',
    category: 'Electromagnetism',
    description: 'Electric constant dielectric permittivity in vacuum.'
  }
];
