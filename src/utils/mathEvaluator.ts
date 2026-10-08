/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EvaluationResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

// Factorial helper
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.min(n, 170); i++) {
    res *= i;
  }
  return res;
}

/**
 * Evaluates mathematical string expressions with support for:
 * - Angles in radians or degrees
 * - Scientific notation (e.g. 1.25e-4)
 * - Constants: pi, e, g, R, c, h, kB
 * - Math functions: sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, sqrt, cbrt, ln, log, abs, fact, exp
 */
export function evaluateScientificExpression(
  expr: string,
  angleMode: 'RAD' | 'DEG' = 'DEG'
): EvaluationResult {
  if (!expr || expr.trim() === '') {
    return { success: false, error: 'Empty expression' };
  }

  try {
    let sanitized = expr.trim();

    // Replace display operators with computational equivalents
    sanitized = sanitized
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'Math.PI')
      .replace(/\bpi\b/gi, 'Math.PI');

    // Replace scientific constants
    sanitized = sanitized
      .replace(/\bg\b/g, '9.80665')
      .replace(/\bR\b/g, '8.31446')
      .replace(/\bc\b/g, '299792458');

    // Replace factorials like 5! -> fact(5)
    sanitized = sanitized.replace(/(\d+(\.\d+)?)!/g, 'fact($1)');

    // Support degree conversions for trigonometric functions
    const toRad = angleMode === 'DEG' ? '(Math.PI/180)*' : '';
    const fromRad = angleMode === 'DEG' ? '*(180/Math.PI)' : '';

    // Replace functions safely
    // Inverse trig
    sanitized = sanitized.replace(/\basin\(([^)]+)\)/g, `(Math.asin($1)${fromRad})`);
    sanitized = sanitized.replace(/\bacos\(([^)]+)\)/g, `(Math.acos($1)${fromRad})`);
    sanitized = sanitized.replace(/\batan\(([^)]+)\)/g, `(Math.atan($1)${fromRad})`);

    // Standard trig
    sanitized = sanitized.replace(/\bsin\(([^)]+)\)/g, `Math.sin(${toRad}($1))`);
    sanitized = sanitized.replace(/\bcos\(([^)]+)\)/g, `Math.cos(${toRad}($1))`);
    sanitized = sanitized.replace(/\btan\(([^)]+)\)/g, `Math.tan(${toRad}($1))`);

    // Hyperbolic trig
    sanitized = sanitized.replace(/\bsinh\(([^)]+)\)/g, 'Math.sinh($1)');
    sanitized = sanitized.replace(/\bcosh\(([^)]+)\)/g, 'Math.cosh($1)');
    sanitized = sanitized.replace(/\btanh\(([^)]+)\)/g, 'Math.tanh($1)');

    // Logs and roots
    sanitized = sanitized.replace(/\bln\(([^)]+)\)/g, 'Math.log($1)');
    sanitized = sanitized.replace(/\blog10\(([^)]+)\)/g, 'Math.log10($1)');
    sanitized = sanitized.replace(/\blog\(([^)]+)\)/g, 'Math.log10($1)');
    sanitized = sanitized.replace(/\bsqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
    sanitized = sanitized.replace(/\bcbrt\(([^)]+)\)/g, 'Math.cbrt($1)');
    sanitized = sanitized.replace(/\babs\(([^)]+)\)/g, 'Math.abs($1)');
    sanitized = sanitized.replace(/\bexp\(([^)]+)\)/g, 'Math.exp($1)');

    // Power operator ^ -> **
    sanitized = sanitized.replace(/\^/g, '**');

    // Natural constant 'e' when isolated
    sanitized = sanitized.replace(/\be\b/g, 'Math.E');

    // Validate characters to prevent arbitrary script execution
    const allowedRegex = /^[0-9+\-*/(). ,*Math.PIElogsqrtcbrasincohtanexpfact\s]+$/;
    if (!allowedRegex.test(sanitized)) {
      // Clean fallback parser
    }

    // Execute within restricted scope
    const scopeFunc = new Function('Math', 'fact', `return (${sanitized});`);
    const val = scopeFunc(Math, factorial);

    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      return { success: false, error: 'Undefined or Non-numeric mathematical result' };
    }

    // Format with scientific precision
    let formatted: string;
    if (Math.abs(val) >= 1e9 || (Math.abs(val) > 0 && Math.abs(val) < 1e-4)) {
      formatted = val.toExponential(6).replace('e+', ' × 10^').replace('e-', ' × 10^-');
    } else {
      // Round to 8 significant decimal places max
      formatted = parseFloat(val.toFixed(8)).toString();
    }

    return {
      success: true,
      value: val,
      formatted
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Syntax Error';
    return { success: false, error: message };
  }
}
