import React, { useState } from 'react';
import { HiddenApp } from '../../types/vault';
import { X, Lock, ExternalLink, RefreshCw, Shield, ArrowLeft, ArrowRight } from 'lucide-react';

interface AppRunnerModalProps {
  app: HiddenApp;
  onClose: () => void;
  onEmergencyLock: () => void;
}

export const AppRunnerModal: React.FC<AppRunnerModalProps> = ({
  app,
  onClose,
  onEmergencyLock
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      
      {/* Barra superior de control de la app oculta */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between gap-3 shrink-0">
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Cerrar y volver a la bóveda"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: app.color }}
            >
              {app.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                {app.isCloaked && app.disguiseName ? app.disguiseName : app.name}
              </h3>
              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Espacio Privado Aislado</span>
              </p>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setIframeKey(k => k + 1);
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Recargar app"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={app.url}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs"
            title="Abrir en pestaña protegida externa"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Pestaña Externa</span>
          </a>

          <button
            type="button"
            onClick={onEmergencyLock}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Bloqueo inmediato: volver a la calculadora"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bloquear (Esc)</span>
          </button>
        </div>

      </div>

      {/* Contenedor del Navegador / Iframe de la App */}
      <div className="flex-1 w-full relative bg-neutral-950 flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm text-center p-4">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-zinc-300 font-medium">Iniciando {app.name} de forma segura...</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Cargando contenedor privado sin historial de navegación en el teléfono.
            </p>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={app.url}
          title={app.name}
          onLoad={() => setLoading(false)}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />

        {/* Banner de seguridad inferior con atajo para salir */}
        <div className="bg-neutral-900/90 border-t border-neutral-800 px-4 py-2 flex items-center justify-between text-xs text-zinc-400">
          <span className="truncate max-w-xs sm:max-w-md font-mono text-[11px] text-zinc-500">
            {app.url}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-400 hover:underline cursor-pointer font-medium shrink-0"
          >
            Regresar a Apps Ocultas
          </button>
        </div>
      </div>

    </div>
  );
};
