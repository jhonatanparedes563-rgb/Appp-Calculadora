import React, { useState, useRef } from 'react';
import { uploadVaultFile, fetchVaultFiles, getVaultStats } from '../../services/vaultService';
import { PhoneCaptureModal } from './PhoneCaptureModal';
import {
  ShieldAlert,
  Image as ImageIcon,
  Film,
  Smartphone,
  FileText,
  Users,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  EyeOff,
  Download,
  Trash2,
  Lock,
  Plus
} from 'lucide-react';

interface VaultHiderHubProps {
  onNavigateTab: (tab: 'apps' | 'files' | 'notes' | 'contacts' | 'settings') => void;
  onRefreshData?: () => void;
}

export const VaultHiderHub: React.FC<VaultHiderHubProps> = ({
  onNavigateTab,
  onRefreshData
}) => {
  const [showCaptureModal, setShowCaptureModal] = useState<boolean>(false);
  const [hidingLoading, setHidingLoading] = useState<boolean>(false);
  const [hideSuccessMessage, setHideSuccessMessage] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChosen = async (
    e: React.ChangeEvent<HTMLInputElement>,
    typeLabel: string,
    category?: 'image' | 'video' | 'document'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setHidingLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadVaultFile(
          files[i],
          category,
          `Ocultado del teléfono el ${new Date().toLocaleDateString()}`,
          'phone_gallery'
        );
      }
      setHideSuccessMessage(
        `¡${files.length} ${typeLabel} ocultado(s) exitosamente! Recuerda borrar el original de la galería pública de tu teléfono para que quede 100% invisible.`
      );
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
      setHideSuccessMessage('No se pudo procesar el archivo seleccionado. Por favor verifica el formato.');
    } finally {
      setHidingLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Mensaje de Éxito al Ocultar */}
      {hideSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-4 flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-300">Elemento Ocultado en la Bóveda</h4>
              <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
                {hideSuccessMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHideSuccessMessage(null)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-1 rounded bg-emerald-900/60"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Cabecera Principal del Centro de Ocultación */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-neutral-800 rounded-3xl p-5 sm:p-7 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Centro de Ocultación Telefónica</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            ¿Qué deseas ocultar de tu teléfono hoy?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-5">
            Mueve tus fotos comprometedoras, videos íntimos, conversaciones o aplicaciones privadas dentro de esta calculadora. Nadie sabrá que existen a menos que escriban tu clave secreta.
          </p>

          {/* Selector de Archivos Ocultos Input Elements */}
          <input
            type="file"
            ref={photoInputRef}
            onChange={(e) => handleFilesChosen(e, 'foto(s)', 'image')}
            multiple
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => handleFilesChosen(e, 'video(s)', 'video')}
            multiple
            accept="video/*"
            className="hidden"
          />
          <input
            type="file"
            ref={docInputRef}
            onChange={(e) => handleFilesChosen(e, 'documento(s)', 'document')}
            multiple
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
            className="hidden"
          />

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={hidingLoading}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs sm:text-sm transition-all active:scale-95 shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Ocultar Fotos del Teléfono</span>
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={hidingLoading}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 border border-neutral-700 font-medium rounded-xl text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Film className="w-4 h-4 text-purple-400" />
              <span>Ocultar Videos</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCaptureModal(true)}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 border border-neutral-700 font-medium rounded-xl text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Foto/Video Directo a Bóveda</span>
            </button>
          </div>
        </div>

        {/* Decoración de fondo */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <EyeOff className="w-64 h-64 text-amber-500" />
        </div>
      </div>

      {/* Grid de 5 Puertas de Ocultación Especializadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Ocultar Aplicaciones */}
        <div
          onClick={() => onNavigateTab('apps')}
          className="group bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-black/40"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>Ocultar Aplicaciones</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Oculta WhatsApp, Tinder, Instagram o Telegram. Ábrelas en privado y camufla sus iconos para que nadie las vea en tu teléfono.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Ver Ocultador de Apps</span>
            <span className="text-[11px] bg-neutral-950 px-2 py-0.5 rounded text-zinc-400">Espacio Dual</span>
          </div>
        </div>

        {/* 2. Ocultar Fotos y Videos de la Galería */}
        <div
          onClick={() => onNavigateTab('files')}
          className="group bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-black/40"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>Fotos y Videos Ocultos</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Carrete secreto protegido. Puedes desocultar y devolver fotos a tu teléfono en cualquier instante con un solo toque.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Explorar Bóveda Multimedia</span>
            <span className="text-[11px] bg-neutral-950 px-2 py-0.5 rounded text-zinc-400">Desocultar disponible</span>
          </div>
        </div>

        {/* 3. Ocultar Contactos y Chats */}
        <div
          onClick={() => onNavigateTab('contacts')}
          className="group bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-black/40"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>Ocultar Contactos</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Guarda números secretos con alias falsos (ej: &quot;Plomero&quot; o &quot;Oficina&quot;). Llama o chatea por WhatsApp sin dejar registro en la agenda normal.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Agenda Encubierta</span>
            <span className="text-[11px] bg-neutral-950 px-2 py-0.5 rounded text-zinc-400">WhatsApp directo</span>
          </div>
        </div>

        {/* 4. Ocultar Notas y Mensajes Privados */}
        <div
          onClick={() => onNavigateTab('notes')}
          className="group bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-black/40"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>Notas y Mensajes Ocultos</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Guarda reflexiones, borradores de mensajes, códigos de seguridad o listas confidenciales lejos de la app de notas común.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Notas Cifradas</span>
            <span className="text-[11px] bg-neutral-950 px-2 py-0.5 rounded text-zinc-400">Fijar notas</span>
          </div>
        </div>

        {/* 5. Ocultar Documentos y Archivos */}
        <div
          onClick={() => docInputRef.current?.click()}
          className="group bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-black/40"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>Ocultar Documentos / PDFs</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Selecciona identificaciones oficiales (INE/DNI), estados de cuenta bancarios o contratos descargados en tu teléfono.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Seleccionar Documentos</span>
            <span className="text-[11px] bg-neutral-950 px-2 py-0.5 rounded text-zinc-400">+ Ocultar PDF</span>
          </div>
        </div>

        {/* 6. Cámara Secreta Directa */}
        <div
          onClick={() => setShowCaptureModal(true)}
          className="group bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-black/40"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>Cámara Oculta en Vivo</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Toma fotos y graba audio directamente en la bóveda. No se guardan en el carrete del teléfono ni generan miniaturas.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Abrir Cámara / Micrófono</span>
            <span className="text-[11px] bg-neutral-950 px-2 py-0.5 rounded text-emerald-400">Sin rastro</span>
          </div>
        </div>

      </div>

      {/* Regla de Oro / Guía Paso a Paso para Ocultar 100% */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              ¿Cómo funciona el proceso de ocultar cosas del teléfono?
            </h3>
            <p className="text-xs text-zinc-400">
              Sigue estos 3 pasos para que ningún amigo, familiar o pareja vea tus cosas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-300">
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/80">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs mb-2">
              1
            </div>
            <h4 className="font-semibold text-white mb-1">Mueve a la Bóveda</h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Presiona <b>&quot;Ocultar Fotos&quot;</b> o <b>&quot;Ocultar Apps&quot;</b> arriba. La app guardará una copia encriptada dentro de la calculadora.
            </p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/80">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs mb-2">
              2
            </div>
            <h4 className="font-semibold text-white mb-1">Borra el Original de tu Celular</h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Abre la galería o la pantalla de tu celular y elimina la foto o desinstala/oculta el icono original. Recuerda vaciar también la papelera de reciclaje de tu teléfono.
            </p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/80">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs mb-2">
              3
            </div>
            <h4 className="font-semibold text-white mb-1">Totalmente Oculto y Restaurable</h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              ¡Listo! Ahora solo existe dentro de la calculadora tras digitar tu código <b>2580 =</b>. Si quieres devolverlo a tu teléfono, tocas <b>&quot;Desocultar&quot;</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Cámara / Extracción del Teléfono */}
      {showCaptureModal && (
        <PhoneCaptureModal
          onClose={() => setShowCaptureModal(false)}
          onMediaSaved={() => {
            setShowCaptureModal(false);
            if (onRefreshData) onRefreshData();
            onNavigateTab('files');
          }}
        />
      )}

    </div>
  );
};
