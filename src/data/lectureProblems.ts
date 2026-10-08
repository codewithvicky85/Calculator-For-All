/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LectureProblem } from '../types';

export const LECTURE_PROBLEMS: LectureProblem[] = [
  {
    id: 'mech_beam_deflection_1',
    discipline: 'mechanical',
    topic: 'Mechanics of Materials: Beam Deflection & Maximum Stress',
    title: 'Simply Supported Beam with Center Point Load',
    difficulty: 'Undergraduate Core (Yr 1-2)',
    statement: 'A simply supported steel beam of length L = 4.0 m has a rectangular cross-section with width b = 120 mm and height h = 250 mm. A concentrated load P = 45 kN is applied at midspan. Assuming elastic modulus E = 200 GPa, determine: (a) Area moment of inertia I, (b) Maximum bending moment M_max, (c) Maximum bending stress σ_max, and (d) Maximum center deflection δ_max.',
    givenData: {
      'Span Length (L)': '4.0 m',
      'Width (b)': '120 mm (0.12 m)',
      'Height (h)': '250 mm (0.25 m)',
      'Load (P)': '45 kN (45,000 N)',
      'Modulus of Elasticity (E)': '200 GPa (2.0 × 10¹¹ Pa)'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Compute Area Moment of Inertia (I)',
        formula: 'I = (b · h³) / 12',
        substitution: 'I = (0.12 m × (0.25 m)³) / 12 = (0.12 × 0.015625) / 12',
        resultWithUnits: '1.5625 × 10⁻⁴ m⁴ (15,625 cm⁴)',
        explanation: 'For a solid rectangular cross-section bending about its horizontal neutral centroidal axis.'
      },
      {
        stepNumber: 2,
        title: 'Calculate Maximum Bending Moment (M_max)',
        formula: 'M_max = (P · L) / 4',
        substitution: 'M_max = (45,000 N × 4.0 m) / 4',
        resultWithUnits: '45,000 N·m (45.0 kN·m)',
        explanation: 'For a center point load on a simply supported beam, max moment occurs at midspan x = L/2.'
      },
      {
        stepNumber: 3,
        title: 'Calculate Maximum Flexural Bending Stress (σ_max)',
        formula: 'σ_max = (M_max · c) / I, where c = h / 2 = 0.125 m',
        substitution: 'σ_max = (45,000 N·m × 0.125 m) / (1.5625 × 10⁻⁴ m⁴)',
        resultWithUnits: '36.0 MPa (3.60 × 10⁷ Pa)',
        explanation: 'Outer extreme fiber tensile/compressive stress. Since σ_max = 36 MPa is well below A36 yield stress (250 MPa), the linear elastic assumption holds.'
      },
      {
        stepNumber: 4,
        title: 'Calculate Midspan Center Deflection (δ_max)',
        formula: 'δ_max = (P · L³) / (48 · E · I)',
        substitution: 'δ_max = (45,000 N × (4.0 m)³) / [48 × (2.0 × 10¹¹ Pa) × (1.5625 × 10⁻⁴ m⁴)]',
        resultWithUnits: '1.92 mm (0.00192 m)',
        explanation: 'Span-to-deflection ratio is L / δ = 4000 / 1.92 ≈ 2083, which comfortably satisfies standard building code deflection limits (L/360 = 11.1 mm).'
      }
    ],
    finalAnswer: 'I = 1.563 × 10⁻⁴ m⁴ | M_max = 45.0 kN·m | σ_max = 36.0 MPa | δ_max = 1.92 mm',
    pedagogicalNotes: 'Remind students that deflection scales inversely with h³, whereas stress scales with h². Deepening the section is much more efficient than widening.'
  },
  {
    id: 'mech_mohrs_circle_1',
    discipline: 'mechanical',
    topic: 'Continuum Mechanics: 2D Plane Stress Transformation & Mohr Circle',
    title: 'Principal Stresses and Maximum Shear in a Pressure Vessel Element',
    difficulty: 'Advanced Engineering (Yr 3-4)',
    statement: 'A cylindrical pressure vessel wall element is subjected to a state of plane stress: normal stress σ_x = 90 MPa, normal stress σ_y = 30 MPa, and shear stress τ_xy = 40 MPa. Determine: (a) Center and radius of Mohr\'s circle, (b) Major and minor principal stresses (σ₁, σ₂), (c) Orientation of the principal planes (θ_p), and (d) Maximum in-plane shear stress (τ_max).',
    givenData: {
      'Normal stress X (σ_x)': '90 MPa',
      'Normal stress Y (σ_y)': '30 MPa',
      'Shear stress (τ_xy)': '40 MPa'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Compute Mohr\'s Circle Center (σ_avg)',
        formula: 'σ_avg = (σ_x + σ_y) / 2',
        substitution: 'σ_avg = (90 + 30) / 2',
        resultWithUnits: '60.0 MPa',
        explanation: 'The center C of Mohr\'s circle always lies on the normal stress horizontal axis at (σ_avg, 0).'
      },
      {
        stepNumber: 2,
        title: 'Calculate Radius of Mohr\'s Circle (R)',
        formula: 'R = √[((σ_x - σ_y) / 2)² + τ_xy²]',
        substitution: 'R = √[((90 - 30) / 2)² + 40²] = √[30² + 40²] = √[900 + 1600] = √2500',
        resultWithUnits: '50.0 MPa',
        explanation: 'Radius R represents the hypotenuse in stress space and equals the maximum in-plane shear stress τ_max.'
      },
      {
        stepNumber: 3,
        title: 'Determine Principal Stresses (σ₁, σ₂)',
        formula: 'σ₁,₂ = σ_avg ± R',
        substitution: 'σ₁ = 60 + 50 = 110 MPa, σ₂ = 60 - 50 = 10 MPa',
        resultWithUnits: 'σ₁ = 110.0 MPa, σ₂ = 10.0 MPa',
        explanation: 'On the principal planes, shear stress is identically zero. Both principal stresses are tensile in this state.'
      },
      {
        stepNumber: 4,
        title: 'Determine Principal Orientation Angle (θ_p)',
        formula: 'tan(2θ_p) = (2 · τ_xy) / (σ_x - σ_y)',
        substitution: 'tan(2θ_p) = (2 × 40) / (90 - 30) = 80 / 60 = 1.3333 ⇒ 2θ_p = 53.13°',
        resultWithUnits: 'θ_p = +26.57° (counter-clockwise)',
        explanation: 'A coordinate rotation of 26.57° CCW aligns the element axes with the principal stress planes.'
      }
    ],
    finalAnswer: 'σ₁ = 110.0 MPa | σ₂ = 10.0 MPa | τ_max = 50.0 MPa | θ_p = 26.57°',
    pedagogicalNotes: 'Highlight to students that Tresca failure criterion yields σ_max - σ_min = 110 - 0 = 110 MPa when considering the out-of-plane 3D principal stress σ₃ = 0.'
  },
  {
    id: 'chem_heat_exchanger_1',
    discipline: 'chemical',
    topic: 'Heat Transfer: Log Mean Temperature Difference (LMTD) & Area Sizing',
    title: 'Counter-Current Shell-and-Tube Heat Exchanger Design',
    difficulty: 'Undergraduate Core (Yr 1-2)',
    statement: 'A process stream of hot oil is cooled from 160 °C to 90 °C in a counter-current heat exchanger by cooling water entering at 25 °C and exiting at 65 °C. The heat duty required is Q = 450 kW. The overall heat transfer coefficient is U = 350 W/(m²·K). Calculate: (a) Temperature approaches ΔT₁ and ΔT₂, (b) Log Mean Temperature Difference (LMTD), and (c) Required heat transfer surface area A.',
    givenData: {
      'Hot Fluid Inlet (T_h,in)': '160 °C',
      'Hot Fluid Outlet (T_h,out)': '90 °C',
      'Cold Fluid Inlet (T_c,in)': '25 °C',
      'Cold Fluid Outlet (T_c,out)': '65 °C',
      'Heat Duty (Q)': '450 kW (450,000 W)',
      'Overall U': '350 W / (m²·K)'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Determine Terminal Temperature Differences (Counter-Flow)',
        formula: 'ΔT₁ = T_h,in - T_c,out;  ΔT₂ = T_h,out - T_c,in',
        substitution: 'ΔT₁ = 160 - 65 = 95 °C;  ΔT₂ = 90 - 25 = 65 °C',
        resultWithUnits: 'ΔT₁ = 95.0 °C (or K),  ΔT₂ = 65.0 °C (or K)',
        explanation: 'In counter-current flow, hot inlet encounters cold outlet, ensuring superior thermal driving force across the entire exchanger length.'
      },
      {
        stepNumber: 2,
        title: 'Calculate Log Mean Temperature Difference (LMTD)',
        formula: 'ΔT_lm = (ΔT₁ - ΔT₂) / ln(ΔT₁ / ΔT₂)',
        substitution: 'ΔT_lm = (95 - 65) / ln(95 / 65) = 30 / ln(1.4615) = 30 / 0.3795',
        resultWithUnits: '79.05 K (°C)',
        explanation: 'Arithmetic mean would be (95 + 65)/2 = 80 K. LMTD provides the true logarithmic effective thermal driving force.'
      },
      {
        stepNumber: 3,
        title: 'Determine Required Surface Area (A)',
        formula: 'A = Q / (U · ΔT_lm)',
        substitution: 'A = 450,000 W / (350 W/(m²·K) × 79.05 K)',
        resultWithUnits: '16.26 m²',
        explanation: 'Provides baseline area requirement before applying tube fouling resistance margins (typically +15% to 20%).'
      }
    ],
    finalAnswer: 'LMTD = 79.05 °C | Required Surface Area A = 16.26 m²',
    pedagogicalNotes: 'Ask students what happens in co-current (parallel) flow: cold outlet cannot exceed hot outlet, severely constraining thermodynamic heat recovery.'
  },
  {
    id: 'chem_van_der_waals_1',
    discipline: 'chemical',
    topic: 'Thermodynamics: Real Gas Compressibility & Van der Waals Equation',
    title: 'Molar Volume and Pressure Deviation of Carbon Dioxide at High Pressure',
    difficulty: 'Advanced Engineering (Yr 3-4)',
    statement: 'A rigid cylinder contains 500 moles of CO₂ gas at T = 350 K within a volume V = 0.50 m³. For CO₂, the Van der Waals constants are a = 0.3658 Pa·m⁶/mol² and b = 4.286 × 10⁻⁵ m³/mol. Determine: (a) The ideal gas pressure P_ideal, (b) The real gas pressure P_vdw using the Van der Waals equation, (c) The compressibility factor Z, and (d) The percentage deviation from ideality.',
    givenData: {
      'Moles (n)': '500 mol',
      'Volume (V)': '0.50 m³ (Molar volume v = 0.001 m³/mol)',
      'Temperature (T)': '350 K',
      'Constant a': '0.3658 Pa·m⁶/mol²',
      'Constant b': '4.286 × 10⁻⁵ m³/mol',
      'Gas Constant R': '8.3145 J/(mol·K)'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Compute Ideal Gas Pressure',
        formula: 'P_ideal = (n · R · T) / V',
        substitution: 'P_ideal = (500 × 8.3145 × 350) / 0.50',
        resultWithUnits: '2.910 MPa (29.10 bar)',
        explanation: 'Assumes point-mass molecules with zero intermolecular attraction or excluded volume.'
      },
      {
        stepNumber: 2,
        title: 'Compute Van der Waals Real Gas Pressure',
        formula: 'P_vdw = [n · R · T / (V - n·b)] - a · (n/V)²',
        substitution: 'V - nb = 0.50 - 500(4.286×10⁻⁵) = 0.47857 m³; Repulsive term = 1,455,038 / 0.47857 = 3.0404 MPa; Attractive term = 0.3658 × (1000)² = 0.3658 MPa',
        resultWithUnits: '2.675 MPa (26.75 bar)',
        explanation: 'Intermolecular London dispersion attractive forces between CO₂ molecules reduce the wall collision pressure by 0.366 MPa.'
      },
      {
        stepNumber: 3,
        title: 'Compute Compressibility Factor Z & Deviation',
        formula: 'Z = P_vdw / P_ideal;  % Deviation = ((P_vdw - P_ideal) / P_ideal) × 100%',
        substitution: 'Z = 2.675 / 2.910 = 0.9192;  % Dev = ((2.675 - 2.910) / 2.910) × 100%',
        resultWithUnits: 'Z = 0.919 (8.07% lower than ideal)',
        explanation: 'Z < 1 confirms that attractive intermolecular forces dominate over repulsive molecular volume exclusion at 350 K and 29 bar.'
      }
    ],
    finalAnswer: 'P_ideal = 2.910 MPa | P_vdw = 2.675 MPa | Z = 0.919 | Deviation = -8.07%',
    pedagogicalNotes: 'Excellent example to illustrate that standard engineering equipment sizing for high pressure pipelines requires EOS models (Peng-Robinson or SRK in process simulation).'
  },
  {
    id: 'civil_manning_1',
    discipline: 'civil',
    topic: 'Water Resources & Hydraulics: Open Channel Flow by Manning\'s Equation',
    title: 'Discharge and Froude Number in a Concrete Trapezoidal Canal',
    difficulty: 'Undergraduate Core (Yr 1-2)',
    statement: 'A finished concrete trapezoidal drainage channel (Manning\'s n = 0.013) has a bottom width b = 3.0 m and side slopes 1.5H : 1V (z = 1.5). The channel longitudinal bed slope is S₀ = 0.0016 (0.16%). The flow depth is y = 1.2 m. Determine: (a) Cross-sectional area A and wetted perimeter P, (b) Hydraulic radius R_h, (c) Flow velocity V and discharge Q, and (d) Froude number Fr and flow regime.',
    givenData: {
      'Bottom Width (b)': '3.0 m',
      'Flow Depth (y)': '1.2 m',
      'Side Slope (z)': '1.5',
      'Bed Slope (S₀)': '0.0016',
      'Manning Roughness (n)': '0.013'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Calculate Hydraulic Geometry (A and P)',
        formula: 'A = (b + z·y)·y;  P = b + 2·y·√(1 + z²)',
        substitution: 'A = (3.0 + 1.5×1.2)×1.2 = (3.0 + 1.8)×1.2 = 5.76 m²; P = 3.0 + 2×1.2×√(1 + 2.25) = 3.0 + 2.4×1.8028 = 7.327 m',
        resultWithUnits: 'A = 5.76 m², P = 7.327 m',
        explanation: 'Geometry for trapezoidal channel with sloping earthen or concrete banks.'
      },
      {
        stepNumber: 2,
        title: 'Calculate Hydraulic Radius (R_h)',
        formula: 'R_h = A / P',
        substitution: 'R_h = 5.76 m² / 7.327 m',
        resultWithUnits: '0.786 m',
        explanation: 'Hydraulic radius measures the ratio of flow cross-section to frictional contact boundary.'
      },
      {
        stepNumber: 3,
        title: 'Calculate Flow Velocity (V) and Discharge (Q)',
        formula: 'V = (1 / n) · R_h^(2/3) · S₀^(1/2);  Q = A · V',
        substitution: 'V = (1 / 0.013) × (0.786)^(0.6667) × √(0.0016) = 76.923 × 0.8517 × 0.040 = 2.621 m/s; Q = 5.76 × 2.621',
        resultWithUnits: 'V = 2.62 m/s, Q = 15.10 m³/s (15,100 L/s)',
        explanation: 'High discharge capacity suitable for municipal stormwater drainage or irrigation conduits.'
      },
      {
        stepNumber: 4,
        title: 'Check Froude Number (Fr) & Flow Regime',
        formula: 'Top width T = b + 2·z·y = 6.6 m; Hydraulic depth D_h = A / T = 0.873 m; Fr = V / √(g · D_h)',
        substitution: 'Fr = 2.621 / √(9.81 × 0.873) = 2.621 / √8.564 = 2.621 / 2.926',
        resultWithUnits: 'Fr = 0.896 (Subcritical Flow, Fr < 1.0)',
        explanation: 'Since Fr < 1, surface disturbances travel upstream; flow is tranquil and will not undergo hydraulic jump without sudden slope change.'
      }
    ],
    finalAnswer: 'Discharge Q = 15.10 m³/s | Velocity V = 2.62 m/s | Froude Number Fr = 0.896 (Subcritical)',
    pedagogicalNotes: 'Direct students to notice how sensitive Manning\'s velocity is to n: increasing roughness from 0.013 (concrete) to 0.035 (unmaintained weed channel) cuts flow capacity by 63%!'
  },
  {
    id: 'civil_concrete_beam_1',
    discipline: 'civil',
    topic: 'Structural Design: Reinforced Concrete Beam Flexural Strength (ACI 318)',
    title: 'Nominal and Factored Moment Capacity of Singly Reinforced Beam',
    difficulty: 'Advanced Engineering (Yr 3-4)',
    statement: 'A rectangular reinforced concrete beam has width b = 300 mm and effective depth d = 500 mm. It is reinforced with 4 No. 25M longitudinal rebar, giving total tensile steel area A_s = 2000 mm². Material strengths: concrete compressive strength f\'c = 28 MPa and steel yield strength f_y = 420 MPa. Using ACI 318 / Eurocode 2 principles, determine: (a) Depth of equivalent compressive rectangular stress block a, (b) Nominal flexural moment capacity M_n, (c) Design factored moment φM_n (φ = 0.90 for tension-controlled), and (d) Check reinforcement ratio ρ against limits.',
    givenData: {
      'Width (b)': '300 mm',
      'Effective Depth (d)': '500 mm',
      'Steel Area (A_s)': '2000 mm² (0.0020 m²)',
      'Concrete Strength (f\'c)': '28 MPa',
      'Steel Yield (f_y)': '420 MPa',
      'Strength Reduction (φ)': '0.90'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Check Reinforcement Ratio (ρ)',
        formula: 'ρ = A_s / (b · d)',
        substitution: 'ρ = 2000 mm² / (300 mm × 500 mm) = 2000 / 150,000',
        resultWithUnits: '0.01333 (1.33%)',
        explanation: 'Typical economic structural range for beams is 0.008 to 0.018.'
      },
      {
        stepNumber: 2,
        title: 'Calculate Equivalent Concrete Stress Block Depth (a)',
        formula: 'a = (A_s · f_y) / (0.85 · f\'c · b)',
        substitution: 'a = (2000 mm² × 420 MPa) / (0.85 × 28 MPa × 300 mm) = 840,000 / 7,140',
        resultWithUnits: '117.65 mm (0.1176 m)',
        explanation: 'Based on Whitney stress block equilibrium: tension T = compression C.'
      },
      {
        stepNumber: 3,
        title: 'Calculate Nominal Moment Capacity (M_n)',
        formula: 'M_n = A_s · f_y · (d - a / 2)',
        substitution: 'M_n = 2000 × 10⁻⁶ m² × (420 × 10⁶ N/m²) × [0.500 m - (0.11765 m / 2)] = 840,000 N × 0.44118 m',
        resultWithUnits: '370.59 kN·m (370,590 N·m)',
        explanation: 'Lever arm between steel tension resultant and concrete compression centroid is d - a/2 = 441.2 mm.'
      },
      {
        stepNumber: 4,
        title: 'Calculate Design Factored Flexural Strength (φM_n)',
        formula: 'φM_n = φ · M_n',
        substitution: 'φM_n = 0.90 × 370.59 kN·m',
        resultWithUnits: '333.53 kN·m',
        explanation: 'Tension-controlled ductility verified: c = a / β₁ = 117.65 / 0.85 = 138.4 mm; net tensile strain ε_t = 0.003 × (500 - 138.4) / 138.4 = 0.0078 > 0.005, confirming φ = 0.90 is valid.'
      }
    ],
    finalAnswer: 'Stress block a = 117.6 mm | M_n = 370.6 kN·m | φM_n = 333.5 kN·m (Ductile)',
    pedagogicalNotes: 'Emphasize why civil engineers enforce ductile failure: steel yields well before concrete crushing, providing visible cracks and warning deflections prior to collapse.'
  }
];
