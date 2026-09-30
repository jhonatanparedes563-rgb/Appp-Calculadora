import React, { useState, useEffect } from 'react';
import { VaultHiderHub } from './VaultHiderHub';
import { VaultAppsTab } from './VaultAppsTab';
import { VaultFilesTab } from './VaultFilesTab';
import { VaultNotesTab } from './VaultNotesTab';
import { VaultContactsTab } from './VaultContactsTab';
import { VaultCredentialsTab } from './VaultCredentialsTab';
import { VaultSettingsTab } from './VaultSettingsTab';
import { PhoneCaptureModal } from './PhoneCaptureModal';
import {
  Lock,
  FolderLock,
  FileText,
  KeyRound,
  Settings,
  ShieldCheck,
  Smartphone,
  Users,
  EyeOff
} from 'lucide-react';

interface VaultDashboardProps {
  onLock: () => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({ onLock }) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'apps' | 'files' | 'notes' | 'contacts' | 'creds' | 'settings'>('hub');
  const [showPhoneCapture, setShowPhoneCapture] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Atajo de teclado: pulsar tecla Escape para bloquear y salir de inmediato
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onLock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLock]);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-zinc-100 flex flex-col font-sans select-none animate-in fade-in duration-200">
      
      {/* Barra Superior de la Bóveda */}
      <header className="sticky top-0 z-40 bg-[#0d0f12]/95 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Título de la Bóveda */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FolderLock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  Bóveda Privada
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  <ShieldCheck className="w-3 h-3" /> Desbloqueada
                </span>
              </div>
            </div>
          </div>

          {/* Botones Rápidos Superiores */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPhoneCapture(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              title="Abrir cámara espía o extractor del móvil"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Jalar del Teléfono</span>
            </button>

            <button
              type="button"
              onClick={onLock}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 text-xs sm:text-sm font-medium rounded-xl transition-all active:scale-95 cursor-pointer border border-neutral-700/60"
              title="Volver a la calculadora pública (Esc)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Bloquear y Salir</span>
              <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-zinc-400 font-mono">
                Esc
              </kbd>
            </button>
          </div>

        </div>
      </header>

      {/* Contenido Principal con Pestañas */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        
        {/* Barra de Pestañas con Ocultador de Apps */}
        <nav className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto no-scrollbar">
          
          <button
            type="button"
            onClick={() => setActiveTab('hub')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'hub'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>Ocultar Cosas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apps')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'apps'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Ocultador de Apps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'files'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>Fotos & Videos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notas & Mensajes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contactos Secretos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('creds')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'creds'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Contraseñas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes & Intrusos</span>
          </button>
        </nav>

        {/* Vistas de contenido según pestaña activa */}
        <main className="flex-1 pb-10">
          {activeTab === 'hub' && (
            <VaultHiderHub
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRefreshData={() => setRefreshTrigger(t => t + 1)}
            />
          )}
          {activeTab === 'apps' && <VaultAppsTab onEmergencyLock={onLock} />}
          {activeTab === 'files' && <VaultFilesTab key={refreshTrigger} />}
          {activeTab === 'notes' && <VaultNotesTab />}
          {activeTab === 'contacts' && <VaultContactsTab />}
          {activeTab === 'creds' && <VaultCredentialsTab />}
          {activeTab === 'settings' && <VaultSettingsTab onLockVault={onLock} />}
        </main>

      </div>

      {/* Modal de Captura Directa del Teléfono */}
      {showPhoneCapture && (
        <PhoneCaptureModal
          onClose={() => setShowPhoneCapture(false)}
          onMediaSaved={() => {
            setShowPhoneCapture(false);
            setRefreshTrigger(t => t + 1);
            setActiveTab('files');
          }}
        />
      )}

    </div>
  );
};
