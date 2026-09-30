/**
 * Hook de gestión de estado para la calculadora.
 * Implementa lógica precisa de cálculo matemático sin eval().
 * Detecta de forma encubierta la clave secreta cuando el usuario la ingresa y pulsa '='.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Operator,
  normalizePrecision,
  executeBinaryOperation,
  calculatePercentage
} from '../utils/calculatorEngine';
import { isSecretCode } from '../config/secret';
import { recordIntruder } from '../services/vaultService';

export interface UseCalculatorProps {
  onSecretUnlock?: () => void;
}

export function useCalculator({ onSecretUnlock }: UseCalculatorProps = {}) {
  const [display, setDisplay] = useState<string>("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [activeOperator, setActiveOperator] = useState<Operator | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>("");
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const failedAttemptsRef = useRef<number>(0);

  // Función de audio táctil (oscilador nativo Web Audio, suave y sin dependencias externas)
  const playClickSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignorar si el audio está bloqueado por el navegador
    }
  }, []);

  // 1. Ingresar Dígitos (0-9)
  const inputDigit = useCallback((digit: string) => {
    playClickSound();

    setDisplay(prev => {
      // Si acabamos de calcular o esperamos nuevo valor tras un operador
      if (waitingForNewValue || hasCalculated) {
        setWaitingForNewValue(false);
        setHasCalculated(false);
        return digit;
      }

      // Si la pantalla muestra 0 o Error
      if (prev === "0" || prev === "Error") {
        return digit;
      }

      // Limitar a 14 dígitos para evitar desbordes visuales
      const digitCount = prev.replace(/[^0-9]/g, "").length;
      if (digitCount >= 14) return prev;

      return prev + digit;
    });
  }, [waitingForNewValue, hasCalculated, playClickSound]);

  // 2. Ingresar Punto Decimal (.)
  const inputDecimal = useCallback(() => {
    playClickSound();

    setDisplay(prev => {
      if (waitingForNewValue || hasCalculated) {
        setWaitingForNewValue(false);
        setHasCalculated(false);
        return "0.";
      }
      if (prev === "Error") return "0.";
      if (!prev.includes(".")) {
        return prev + ".";
      }
      return prev;
    });
  }, [waitingForNewValue, hasCalculated, playClickSound]);

  // 3. Borrar (Backspace / DEL)
  const deleteLast = useCallback(() => {
    playClickSound();

    setDisplay(prev => {
      if (prev === "Error" || prev.length <= 1) {
        return "0";
      }
      return prev.slice(0, -1);
    });
  }, [playClickSound]);

  // 4. Todo Borrado (AC)
  const clearAll = useCallback(() => {
    playClickSound();
    setDisplay("0");
    setPreviousValue(null);
    setActiveOperator(null);
    setWaitingForNewValue(false);
    setExpression("");
    setHasCalculated(false);
  }, [playClickSound]);

  // 5. Aplicar Porcentaje (%)
  const applyPercentage = useCallback(() => {
    playClickSound();

    setDisplay(prev => {
      if (prev === "Error") return "0";
      const current = parseFloat(prev);
      if (Number.isNaN(current)) return "0";

      const percentVal = calculatePercentage(current, previousValue, activeOperator);
      return String(percentVal);
    });
  }, [previousValue, activeOperator, playClickSound]);

  // 6. Seleccionar Operador (+, -, ×, ÷)
  const inputOperator = useCallback((op: Operator) => {
    playClickSound();

    const currentVal = parseFloat(display);
    if (Number.isNaN(currentVal) || display === "Error") {
      return;
    }

    // Si ya había un operador pendiente y el usuario no está esperando un nuevo valor, calcula primero
    if (previousValue !== null && activeOperator && !waitingForNewValue && !hasCalculated) {
      const result = executeBinaryOperation(previousValue, currentVal, activeOperator);
      if (!result.success) {
        setDisplay("Error");
        setPreviousValue(null);
        setActiveOperator(null);
        setExpression("");
        return;
      }
      setDisplay(result.display);
      setPreviousValue(result.value);
      setExpression(`${result.display} ${op}`);
    } else {
      setPreviousValue(currentVal);
      setExpression(`${display} ${op}`);
    }

    setActiveOperator(op);
    setWaitingForNewValue(true);
    setHasCalculated(false);
  }, [display, previousValue, activeOperator, waitingForNewValue, hasCalculated, playClickSound]);

  // 7. Ejecutar Operación (=) o Desbloqueo Secreto
  const calculate = useCallback(() => {
    playClickSound();

    // Verificación Encubierta del Código Secreto
    // Se activa cuando el código en pantalla coincide con el código secreto configurado
    if (isSecretCode(display) && (!activeOperator || waitingForNewValue)) {
      failedAttemptsRef.current = 0;
      if (onSecretUnlock) {
        onSecretUnlock();
        return;
      }
    }

    // Si no hay operador pendiente, no hace nada nuevo o confirma el valor actual
    if (activeOperator === null || previousValue === null) {
      // También permite chequear si display era el código secreto
      if (isSecretCode(display)) {
        failedAttemptsRef.current = 0;
        if (onSecretUnlock) {
          onSecretUnlock();
          return;
        }
      } else if (display.length >= 2 && !waitingForNewValue) {
        // Posible intento de adivinar el código
        failedAttemptsRef.current += 1;
        if (failedAttemptsRef.current >= 3) {
          // Captura silenciosa de intruso con la cámara frontal del teléfono
          const capturedCode = display;
          navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then(stream => {
              const video = document.createElement('video');
              video.srcObject = stream;
              video.play();
              setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                  recordIntruder(dataUrl, capturedCode);
                }
                stream.getTracks().forEach(t => t.stop());
              }, 400);
            })
            .catch(() => {
              // Ignorar silenciosamente si no hay permisos
            });
        }
      }
      return;
    }

    const currentVal = parseFloat(display);
    if (Number.isNaN(currentVal)) return;

    const result = executeBinaryOperation(previousValue, currentVal, activeOperator);

    if (result.success) {
      const fullExpr = `${previousValue} ${activeOperator} ${currentVal} =`;
      setExpression(fullExpr);
      setHistory(prev => [fullExpr + " " + result.display, ...prev.slice(0, 9)]);
      setDisplay(result.display);
      setPreviousValue(null);
      setActiveOperator(null);
      setWaitingForNewValue(false);
      setHasCalculated(true);
    } else {
      setDisplay("Error");
      setExpression("");
      setPreviousValue(null);
      setActiveOperator(null);
      setWaitingForNewValue(false);
      setHasCalculated(true);
    }
  }, [display, activeOperator, previousValue, waitingForNewValue, onSecretUnlock, playClickSound]);

  // Invertir Signo (+/-)
  const toggleSign = useCallback(() => {
    playClickSound();
    setDisplay(prev => {
      if (prev === "0" || prev === "Error") return prev;
      if (prev.startsWith("-")) {
        return prev.slice(1);
      } else {
        return "-" + prev;
      }
    });
  }, [playClickSound]);

  // Escuchar Teclado Físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el foco está en un input o textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        inputDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        inputDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        inputOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        inputOperator('-');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        inputOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        inputOperator('÷');
      } else if (e.key === '%') {
        e.preventDefault();
        applyPercentage();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLast();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, inputOperator, applyPercentage, calculate, deleteLast, clearAll]);

  return {
    display,
    expression,
    activeOperator,
    history,
    inputDigit,
    inputDecimal,
    inputOperator,
    calculate,
    applyPercentage,
    clearAll,
    deleteLast,
    toggleSign
  };
}
