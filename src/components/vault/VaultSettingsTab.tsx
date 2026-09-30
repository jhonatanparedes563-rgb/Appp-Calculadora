import React, { useState, useEffect } from 'react';
import { getSecretCode } from '../../config/secret';
import {
  updateVaultPasscode,
  getVaultStats,
  clearAllLocalVaultData,
  fetchIntruders,
  clearIntruders
} from '../../services/vaultService';
import { VaultStats, IntruderSelfie } from '../../types/vault';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  ShieldCheck,
  Key,
  Database,
  HardDrive,
  Check,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Camera,
  Trash2,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface VaultSettingsTabProps {
  onLockVault: () => void;
}

export const VaultSettingsTab: React.FC<VaultSettingsTabProps> = ({ onLockVault }) => {
  const [currentCode, setCurrentCode] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [confirmCode, setConfirmCode] = useState<string>('');
  const [codeSuccess, setCodeSuccess] = useState<boolean>(false);
  const [codeError, setCodeError] = useState<string>('');
  const [intruders, setIntruders] = useState<IntruderSelfie[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetSuccessToast, setResetSuccessToast] = useState<string | null>(null);

  const [stats, setStats] = useState<VaultStats>({
    totalFiles: 0,
    totalNotes: 0,
    totalCredentials: 0,
    totalHiddenApps: 0,
    totalContacts: 0,
    usedBytes: 0
  });

  useEffect(() => {
    setCurrentCode(getSecretCode());
    getVaultStats().then(setStats);
    fetchIntruders().then(setIntruders);
  }, []);

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    setCodeSuccess(false);

    if (newCode.length < 2) {
      setCodeError('El código debe tener al menos 2 caracteres o dígitos.');
      return;
    }

    if (newCode !== confirmCode) {
      setCodeError('Los códigos no coinciden.');
      return;
    }

    const ok = await updateVaultPasscode(newCode);
    if (ok) {
      setCurrentCode(newCode);
      setNewCode('');
      setConfirmCode('');
      setCodeSuccess(true);
      setTimeout(() => setCodeSuccess(false), 3000);
    } else {
      setCodeError('Error al guardar nuevo código.');
    }
  };

  const handleClearIntruders = async () => {
    await clearIntruders();
    setIntruders([]);
  };

  const handleResetConfirmed = async () => {
    await clearAllLocalVaultData();
    const updated = await getVaultStats();
    setStats(updated);
    setIntruders([]);
    setShowResetConfirm(false);
    setResetSuccessToast('Todos los datos de la bóveda fueron vaciados correctamente.');
    setTimeout(() => setResetSuccessToast(null), 3500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* 1. Alerta de Intrusos (Selfie con Cámara Frontal) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Registro de Intrusos</h4>
              <p className="text-xs text-zinc-400">
                Capturas silenciosas tomadas cuando alguien intenta adivinar el código secreto
              </p>
            </div>
          </div>

          {intruders.length > 0 && (
            <button
              type="button"
              onClick={handleClearIntruders}
              className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar historial</span>
            </button>
          )}
        </div>

        {intruders.length === 0 ? (
          <div className="p-6 bg-neutral-950 rounded-xl border border-neutral-800/80 text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-300 font-medium">Ningún intruso detectado</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Si alguien presiona `=` con códigos incorrectos repetidamente, la cámara del teléfono tomará una foto silenciosa de su rostro.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {intruders.map(intruder => (
              <div key={intruder.id} className="bg-neutral-950 rounded-xl border border-neutral-800 p-2 text-center">
                <img
                  src={intruder.photoDataUrl}
                  alt="Intruso"
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                />
                <span className="text-[10px] text-zinc-400 block truncate">
                  {new Date(intruder.timestamp).toLocaleString()}
                </span>
                <span className="text-[10px] text-red-400 font-mono block">
                  Código: {intruder.attemptedCode}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Cómo Instalar la App como Calculadora en tu Teléfono */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Instalar en la Pantalla de Inicio del Teléfono</h4>
            <p className="text-xs text-zinc-400">
              Haz que aparezca como &quot;Calculadora&quot; en tu celular para sustituir a la calculadora original
            </p>
          </div>
        </div>

        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs text-zinc-300 space-y-2">
          <p className="leading-relaxed">
            <b>En Android (Chrome):</b> Toca los tres puntos de la esquina superior derecha del navegador y pulsa en <b>&quot;Agregar a la pantalla principal&quot;</b> o <b>&quot;Instalar aplicación&quot;</b>.
          </p>
          <p className="leading-relaxed">
            <b>En iPhone (Safari):</b> Toca el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba) y selecciona <b>&quot;Agregar al inicio&quot;</b>.
          </p>
          <p className="text-[11px] text-amber-400/90 pt-1 border-t border-neutral-800">
            ✓ Tendrá el icono y nombre idéntico a una calculadora real. Nadie sospechará que dentro guardas fotos, audios y aplicaciones ocultas.
          </p>
        </div>
      </div>

      {/* 3. Configurar Código Secreto */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Código Secreto de Desbloqueo</h4>
            <p className="text-xs text-zinc-400">
              Código que escribes en la calculadora antes de presionar &quot;=&quot;
            </p>
          </div>
        </div>

        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80 mb-4 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Código actual activo:</span>
          <span className="text-sm font-mono text-amber-400 font-bold bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
            {currentCode}
          </span>
        </div>

        <form onSubmit={handleUpdateCode} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Nuevo Código Secreto</label>
              <input
                type="text"
                placeholder="ej: 2580 o nueva clave"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Confirmar Nuevo Código</label>
              <input
                type="text"
                placeholder="Repite el código"
                value={confirmCode}
                onChange={e => setConfirmCode(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {codeError && <p className="text-xs text-red-400">{codeError}</p>}
          {codeSuccess && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Código actualizado con éxito.
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
            >
              Guardar Nuevo Código
            </button>
          </div>
        </form>
      </div>

      {/* 4. Estadísticas de Almacenamiento */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Resumen de Almacenamiento</h4>
            <p className="text-xs text-zinc-400">Elementos protegidos en este dispositivo</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center">
            <span className="text-xl font-bold text-white block">{stats.totalHiddenApps}</span>
            <span className="text-[11px] text-zinc-500">Apps Ocultas</span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center">
            <span className="text-xl font-bold text-white block">{stats.totalFiles}</span>
            <span className="text-[11px] text-zinc-500">Archivos / Medios</span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center">
            <span className="text-xl font-bold text-white block">{stats.totalContacts}</span>
            <span className="text-[11px] text-zinc-500">Contactos</span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center">
            <span className="text-xl font-bold text-white block">{stats.totalNotes}</span>
            <span className="text-[11px] text-zinc-500">Notas Privadas</span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center col-span-2 sm:col-span-1">
            <span className="text-xl font-bold text-amber-400 block">{formatFileSize(stats.usedBytes)}</span>
            <span className="text-[11px] text-zinc-500">Espacio Usado</span>
          </div>
        </div>
      </div>

      {/* 5. Acciones de Emergencia */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Bloqueo Rápido de Emergencia</h4>
          <p className="text-xs text-zinc-400">
            Cierra de inmediato la bóveda y vuelve a la calculadora pública en 0
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLockVault}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium cursor-pointer transition-colors"
          >
            Bloquear Ahora (Esc)
          </button>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 rounded-xl text-xs font-medium cursor-pointer transition-colors"
          >
            Vaciar Bóveda
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="¿Vaciar toda la bóveda?"
        message="¿Estás seguro de que deseas borrar todos los archivos locales guardados en la bóveda? Esta acción no se puede deshacer."
        confirmLabel="Vaciar Bóveda"
        isDestructive={true}
        onConfirm={handleResetConfirmed}
        onCancel={() => setShowResetConfirm(false)}
      />

      {resetSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resetSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
