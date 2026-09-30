import React from 'react';

export type KeyVariant = 'number' | 'operator' | 'function';

interface CalculatorKeyProps {
  label: React.ReactNode;
  onClick: () => void;
  variant?: KeyVariant;
  isActive?: boolean;
  className?: string;
  ariaLabel?: string;
  doubleWidth?: boolean;
}

export const CalculatorKey: React.FC<CalculatorKeyProps> = ({
  label,
  onClick,
  variant = 'number',
  isActive = false,
  className = '',
  ariaLabel,
  doubleWidth = false
}) => {
  // Configuración de variantes de color estrictamente según requerimiento:
  // - Botones naranjas para operaciones
  // - Botones grises para AC, borrar y porcentaje
  // - Fondo negro / gris oscuro para números
  let colorStyles = '';

  if (variant === 'operator') {
    if (isActive) {
      colorStyles = 'bg-white text-[#ff9f0a] shadow-inner font-semibold';
    } else {
      colorStyles = 'bg-[#ff9f0a] text-white hover:bg-[#ffb340] active:bg-[#e08900] font-semibold';
    }
  } else if (variant === 'function') {
    colorStyles = 'bg-[#a5a5a5] text-black hover:bg-[#c4c4c2] active:bg-[#e2e2e0] font-medium';
  } else {
    // number
    colorStyles = 'bg-[#2e2e30] text-white hover:bg-[#3d3d40] active:bg-[#525256] font-normal';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
      className={`
        ${doubleWidth ? 'col-span-2 aspect-auto h-16 sm:h-20 rounded-full px-7 justify-start' : 'aspect-square h-16 w-16 sm:h-20 sm:w-20 rounded-full justify-center'}
        flex items-center
        text-2xl sm:text-3xl
        select-none
        cursor-pointer
        transition-all duration-100 ease-out
        active:scale-[0.93] active:brightness-110
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
        shadow-[0_4px_12px_rgba(0,0,0,0.35)]
        ${colorStyles}
        ${className}
      `}
    >
      <span className="leading-none">{label}</span>
    </button>
  );
};
