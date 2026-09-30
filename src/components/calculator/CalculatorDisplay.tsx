import React from 'react';
import { formatNumberForDisplay } from '../../utils/calculatorEngine';

interface CalculatorDisplayProps {
  display: string;
  expression: string;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  display,
  expression
}) => {
  const formatted = formatNumberForDisplay(display);
  const charLength = formatted.length;

  // Escala dinámica del tamaño de texto según la longitud de los dígitos
  let fontSizeClass = 'text-6xl sm:text-7xl';
  if (charLength >= 14) {
    fontSizeClass = 'text-3xl sm:text-4xl';
  } else if (charLength >= 10) {
    fontSizeClass = 'text-4xl sm:text-5xl';
  } else if (charLength >= 7) {
    fontSizeClass = 'text-5xl sm:text-6xl';
  }

  return (
    <div className="w-full px-5 py-4 flex flex-col justify-end items-end select-none min-h-[140px] sm:min-h-[170px] overflow-hidden">
      {/* Sub-pantalla de expresión o cálculo previo */}
      <div className="h-6 sm:h-7 text-right text-sm sm:text-base text-zinc-400 font-mono tracking-wide tabular-nums overflow-hidden text-ellipsis whitespace-nowrap w-full">
        {expression}
      </div>

      {/* Pantalla principal de dígitos */}
      <div
        className={`w-full text-right text-white font-light tracking-tight tabular-nums transition-all duration-150 leading-none overflow-x-auto no-scrollbar py-2 ${fontSizeClass}`}
      >
        {formatted}
      </div>
    </div>
  );
};
