import React from 'react';
import { CalculatorDisplay } from './CalculatorDisplay';
import { CalculatorKey } from './CalculatorKey';
import { useCalculator } from '../../hooks/useCalculator';

interface CalculatorViewProps {
  onUnlockSecretVault?: () => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  onUnlockSecretVault
}) => {
  const {
    display,
    expression,
    activeOperator,
    inputDigit,
    inputDecimal,
    inputOperator,
    calculate,
    applyPercentage,
    clearAll,
    deleteLast
  } = useCalculator({
    onSecretUnlock: onUnlockSecretVault
  });

  return (
    <main className="min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-3 sm:p-6 select-none font-sans">
      {/* Marco chasis de la calculadora */}
      <div className="w-full max-w-[360px] sm:max-w-[400px] bg-black/95 rounded-[40px] sm:rounded-[48px] p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-neutral-800/80 flex flex-col justify-between">
        
        {/* Pantalla Superior de Dígitos */}
        <CalculatorDisplay display={display} expression={expression} />

        {/* Teclado de Botones Circulares */}
        <div className="grid grid-cols-4 gap-3 sm:gap-3.5 mt-2">
          
          {/* Fila 1: AC, Borrar, %, ÷ */}
          <CalculatorKey
            label={display !== "0" && !expression ? "C" : "AC"}
            onClick={clearAll}
            variant="function"
            ariaLabel="Limpiar todo"
          />
          <CalculatorKey
            label={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 sm:w-7 sm:h-7"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            }
            onClick={deleteLast}
            variant="function"
            ariaLabel="Borrar último dígito"
          />
          <CalculatorKey
            label="%"
            onClick={applyPercentage}
            variant="function"
            ariaLabel="Porcentaje"
          />
          <CalculatorKey
            label="÷"
            onClick={() => inputOperator('÷')}
            variant="operator"
            isActive={activeOperator === '÷'}
            ariaLabel="Dividir"
          />

          {/* Fila 2: 7, 8, 9, × */}
          <CalculatorKey label="7" onClick={() => inputDigit('7')} />
          <CalculatorKey label="8" onClick={() => inputDigit('8')} />
          <CalculatorKey label="9" onClick={() => inputDigit('9')} />
          <CalculatorKey
            label="×"
            onClick={() => inputOperator('×')}
            variant="operator"
            isActive={activeOperator === '×'}
            ariaLabel="Multiplicar"
          />

          {/* Fila 3: 4, 5, 6, - */}
          <CalculatorKey label="4" onClick={() => inputDigit('4')} />
          <CalculatorKey label="5" onClick={() => inputDigit('5')} />
          <CalculatorKey label="6" onClick={() => inputDigit('6')} />
          <CalculatorKey
            label="-"
            onClick={() => inputOperator('-')}
            variant="operator"
            isActive={activeOperator === '-'}
            ariaLabel="Restar"
          />

          {/* Fila 4: 1, 2, 3, + */}
          <CalculatorKey label="1" onClick={() => inputDigit('1')} />
          <CalculatorKey label="2" onClick={() => inputDigit('2')} />
          <CalculatorKey label="3" onClick={() => inputDigit('3')} />
          <CalculatorKey
            label="+"
            onClick={() => inputOperator('+')}
            variant="operator"
            isActive={activeOperator === '+'}
            ariaLabel="Sumar"
          />

          {/* Fila 5: 0 (extendido), ., = */}
          <CalculatorKey
            label="0"
            onClick={() => inputDigit('0')}
            doubleWidth={true}
            ariaLabel="Cero"
          />
          <CalculatorKey
            label="."
            onClick={inputDecimal}
            ariaLabel="Punto decimal"
          />
          <CalculatorKey
            label="="
            onClick={calculate}
            variant="operator"
            ariaLabel="Calcular resultado"
          />

        </div>

      </div>
    </main>
  );
};
