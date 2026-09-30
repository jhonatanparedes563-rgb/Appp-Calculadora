/**
 * Motor de cálculo matemático seguro para la aplicación Calculadora.
 * Cumple estrictamente con la regla de NO usar eval() ni new Function().
 * Implementa orden de precedencia estándar, cálculo de porcentajes y
 * redondeo de precisión para evitar errores de coma flotante de JavaScript.
 */

export type Operator = '+' | '-' | '×' | '÷' | '%';

export interface CalculationResult {
  success: boolean;
  value: number;
  display: string;
  error?: string;
}

/**
 * Corrige errores de precisión de punto flotante en JS (ej: 0.1 + 0.2 = 0.3)
 */
export function normalizePrecision(num: number): number {
  if (!Number.isFinite(num)) return num;
  // Redondea a 12 decimales significativos para descartar artefactos binarios
  return parseFloat(num.toPrecision(12));
}

/**
 * Formatea un número en formato legible con separador de miles y punto decimal
 */
export function formatNumberForDisplay(rawStr: string): string {
  if (!rawStr) return "0";
  if (rawStr === "Error" || rawStr === "Indefinido" || rawStr === "NaN" || rawStr === "Infinity") {
    return rawStr;
  }

  // Si termina en punto (ej: "12.")
  const endsWithDot = rawStr.endsWith(".");
  const hasDot = rawStr.includes(".");

  const parts = rawStr.split(".");
  const intPart = parts[0];
  const decPart = parts[1] !== undefined ? parts[1] : "";

  // Separar miles en la parte entera
  const isNegative = intPart.startsWith("-");
  const absInt = isNegative ? intPart.slice(1) : intPart;

  const formattedInt = absInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = isNegative ? "-" : "";

  if (hasDot) {
    return `${sign}${formattedInt}.${decPart}`;
  }
  if (endsWithDot) {
    return `${sign}${formattedInt}.`;
  }
  return `${sign}${formattedInt}`;
}

/**
 * Ejecuta una operación binaria básica de manera segura
 */
export function executeBinaryOperation(
  first: number,
  second: number,
  operator: Operator
): CalculationResult {
  first = normalizePrecision(first);
  second = normalizePrecision(second);

  switch (operator) {
    case '+': {
      const res = normalizePrecision(first + second);
      return { success: true, value: res, display: String(res) };
    }
    case '-': {
      const res = normalizePrecision(first - second);
      return { success: true, value: res, display: String(res) };
    }
    case '×': {
      const res = normalizePrecision(first * second);
      return { success: true, value: res, display: String(res) };
    }
    case '÷': {
      if (second === 0) {
        return { success: false, value: 0, display: "Error", error: "División por cero" };
      }
      const res = normalizePrecision(first / second);
      return { success: true, value: res, display: String(res) };
    }
    case '%': {
      // Modulo o porcentaje residual
      if (second === 0) {
        return { success: false, value: 0, display: "Error", error: "División por cero" };
      }
      const res = normalizePrecision(first % second);
      return { success: true, value: res, display: String(res) };
    }
    default:
      return { success: false, value: second, display: String(second), error: "Operador no soportado" };
  }
}

/**
 * Calcula porcentaje contextual al estilo calculadora estándar:
 * - Si hay un número base y operador '+': 100 + 20% = 120 (100 + (100*0.2))
 * - Si hay un número base y operador '-': 100 - 20% = 80 (100 - (100*0.2))
 * - Si hay un número base y operador '×': 100 × 20% = 20 (100 * 0.2)
 * - Si hay un número base y operador '÷': 100 ÷ 20% = 500 (100 / 0.2)
 * - Si es aislado: 50% = 0.5
 */
export function calculatePercentage(
  currentVal: number,
  baseVal: number | null,
  pendingOperator: Operator | null
): number {
  if (baseVal === null || pendingOperator === null) {
    return normalizePrecision(currentVal / 100);
  }

  if (pendingOperator === '+' || pendingOperator === '-') {
    return normalizePrecision(baseVal * (currentVal / 100));
  }

  if (pendingOperator === '×' || pendingOperator === '÷') {
    return normalizePrecision(currentVal / 100);
  }

  return normalizePrecision(currentVal / 100);
}

/**
 * Evaluador de expresiones compuestas mediante algoritmo Shunting-Yard (sin eval).
 * Permite evaluar secuencias como "12 + 4 × 3 - 6 ÷ 2" respetando precedencia.
 */
export function evaluateExpressionSafe(expression: string): CalculationResult {
  try {
    // Normalizar símbolos
    const sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, '');

    // Tokenizar números y operadores
    const tokens: (number | string)[] = [];
    let i = 0;
    while (i < sanitized.length) {
      const char = sanitized[i];

      // Número o punto decimal o signo negativo al inicio / después de operador
      if (
        /\d/.test(char) ||
        char === '.' ||
        (char === '-' && (tokens.length === 0 || typeof tokens[tokens.length - 1] === 'string'))
      ) {
        let numStr = char;
        i++;
        while (i < sanitized.length && (/[\d.]/.test(sanitized[i]))) {
          numStr += sanitized[i];
          i++;
        }
        const num = parseFloat(numStr);
        if (Number.isNaN(num)) {
          return { success: false, value: 0, display: "Error", error: "Número inválido" };
        }
        tokens.push(num);
      } else if (['+', '-', '*', '/'].includes(char)) {
        tokens.push(char);
        i++;
      } else {
        // Carácter desconocido, saltar
        i++;
      }
    }

    if (tokens.length === 0) {
      return { success: true, value: 0, display: "0" };
    }

    // Paso 1: Resolver multiplicación y división (*, /)
    const intermediateTokens: (number | string)[] = [];
    let idx = 0;
    while (idx < tokens.length) {
      const token = tokens[idx];
      if (token === '*' || token === '/') {
        const prev = intermediateTokens.pop() as number;
        const next = tokens[idx + 1] as number;
        if (typeof prev !== 'number' || typeof next !== 'number') {
          return { success: false, value: 0, display: "Error", error: "Sintaxis incorrecta" };
        }
        if (token === '/' && next === 0) {
          return { success: false, value: 0, display: "Error", error: "División por cero" };
        }
        const res = token === '*' ? prev * next : prev / next;
        intermediateTokens.push(normalizePrecision(res));
        idx += 2;
      } else {
        intermediateTokens.push(token);
        idx++;
      }
    }

    // Paso 2: Resolver suma y resta (+, -)
    if (intermediateTokens.length === 0) {
      return { success: true, value: 0, display: "0" };
    }

    let finalResult = intermediateTokens[0] as number;
    let opIdx = 1;
    while (opIdx < intermediateTokens.length) {
      const op = intermediateTokens[opIdx] as string;
      const nextNum = intermediateTokens[opIdx + 1] as number;
      if (typeof nextNum !== 'number') break;

      if (op === '+') {
        finalResult = normalizePrecision(finalResult + nextNum);
      } else if (op === '-') {
        finalResult = normalizePrecision(finalResult - nextNum);
      }
      opIdx += 2;
    }

    return {
      success: true,
      value: finalResult,
      display: String(finalResult)
    };
  } catch {
    return { success: false, value: 0, display: "Error", error: "Error de cálculo" };
  }
}
