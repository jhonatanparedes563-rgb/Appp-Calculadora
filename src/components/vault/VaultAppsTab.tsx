import React, { useState, useEffect } from 'react';
import { HiddenApp, AppCategory } from '../../types/vault';
import {
  fetchHiddenApps,
  saveHiddenApp,
  deleteHiddenApp
} from '../../services/vaultService';
import { AppRunnerModal } from './AppRunnerModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  Grid,
  Plus,
  Play,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Smartphone,
  Info,
  Check,
  X,
  Search,
  MessageCircle,
  Share2,
  Heart,
  Globe,
  Lock,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface VaultAppsTabProps {
  onEmergencyLock: () => void;
}

export const VaultAppsTab: React.FC<VaultAppsTabProps> = ({ onEmergencyLock }) => {
  const [apps, setApps] = useState<HiddenApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedAppToRun, setSelectedAppToRun] = useState<HiddenApp | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [appToDelete, setAppToDelete] = useState<{ id: string; name: string } | null>(null);

  // Formulario para nueva app oculta
  const [name, setName] = useState<string>('');
  const [originalName, setOriginalName] = useState<string>('');
  const [category, setCategory] = useState<AppCategory>('messaging');
  const [color, setColor] = useState<string>('#f59e0b');
  const [url, setUrl] = useState<string>('https://');
  const [isCloaked, setIsCloaked] = useState<boolean>(true);
  const [disguiseName, setDisguiseName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const loadApps = async () => {
    setLoading(true);
    try {
      const data = await fetchHiddenApps();
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleOpenAdd = (preset?: { name: string; url: string; category: AppCategory; color: string; disguise: string }) => {
    if (preset) {
      setName(preset.name);
      setOriginalName(preset.name);
      setCategory(preset.category);
      setColor(preset.color);
      setUrl(preset.url);
      setIsCloaked(true);
      setDisguiseName(preset.disguise);
      setNotes('Aplicación clonada en espacio protegido');
    } else {
      setName('');
      setOriginalName('');
      setCategory('messaging');
      setColor('#f59e0b');
      setUrl('https://');
      setIsCloaked(false);
      setDisguiseName('');
      setNotes('');
    }
    setIsAdding(true);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    try {
      await saveHiddenApp({
        name: name.trim(),
        originalName: originalName.trim() || name.trim(),
        category,
        iconType: 'preset',
        iconKey: name.toLowerCase().replace(/\s+/g, '_'),
        color,
        url: url.trim(),
        isCloaked,
        disguiseName: disguiseName.trim() || 'Calculadora Extra',
        notes: notes.trim()
      });
      await loadApps();
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!appToDelete) return;
    try {
      await deleteHiddenApp(appToDelete.id);
      setApps(prev => prev.filter(a => a.id !== appToDelete.id));
      if (selectedAppToRun?.id === appToDelete.id) setSelectedAppToRun(null);
    } catch (err) {
      console.error(err);
    } finally {
      setAppToDelete(null);
    }
  };

  const toggleCloak = async (app: HiddenApp, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await saveHiddenApp({
        ...app,
        isCloaked: !app.isCloaked
      });
      await loadApps();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = apps.filter(a => {
    const matchesCat = activeCategory === 'all' || a.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = a.name.toLowerCase().includes(q) || (a.disguiseName && a.disguiseName.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Barra Superior del Ocultador de Apps */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar apps ocultas o camufladas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cómo ocultar apps en Android / iPhone"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Guía de Ocultación</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ocultar Nueva App
          </button>
        </div>
      </div>

      {/* Guía Interactiva Desplegable para Ocultar Apps Nativas */}
      {showGuide && (
        <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">¿Cómo ocultar la app original de tu teléfono?</h4>
              <p className="text-xs text-zinc-400">
                Pasos para que nadie vea el icono en la pantalla de inicio de tu celular
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-neutral-800 text-zinc-300">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
              <span className="font-semibold text-amber-400 block mb-1">Samsung Galaxy</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                1. Mantén presionada la pantalla de inicio &gt; <b>Ajustes</b>.<br />
                2. Toca <b>&quot;Ocultar aplicaciones en las pantallas de inicio y Aplicaciones&quot;</b>.<br />
                3. Selecciona la app (ej: WhatsApp o Tinder) y pulsa <b>Realizado</b>.
              </p>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
              <span className="font-semibold text-amber-400 block mb-1">Xiaomi / Redmi (MIUI)</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                1. Abre la app de <b>Seguridad</b> nativa de Xiaomi.<br />
                2. Toca en <b>&quot;Bloqueo de aplicaciones&quot; &gt; &quot;Ocultar aplicaciones&quot;</b>.<br />
                3. Activa el interruptor en las apps que deseas que desaparezcan.
              </p>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
              <span className="font-semibold text-amber-400 block mb-1">iPhone (iOS 14+)</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                1. Mantén presionado el icono de la app.<br />
                2. Toca <b>&quot;Eliminar app&quot; &gt; &quot;Eliminar de la pantalla de inicio&quot;</b>.<br />
                3. La app quedará oculta y solo podrás usarla desde esta Bóveda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Catálogo Rápido de Sugerencias para Ocultar con un Clic */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
        <span className="text-xs font-medium text-zinc-400 block mb-2.5">
          Apps sugeridas para ocultar y proteger con doble identidad:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { name: 'WhatsApp Web', url: 'https://web.whatsapp.com', category: 'messaging' as AppCategory, color: '#25D366', disguise: 'Calculadora de Notas' },
            { name: 'Instagram', url: 'https://www.instagram.com', category: 'social' as AppCategory, color: '#E4405F', disguise: 'Conversor de Medidas' },
            { name: 'Telegram', url: 'https://web.telegram.org', category: 'messaging' as AppCategory, color: '#0088cc', disguise: 'Historial de Gastos' },
            { name: 'TikTok', url: 'https://www.tiktok.com', category: 'social' as AppCategory, color: '#000000', disguise: 'Lector de Archivos' },
            { name: 'Tinder', url: 'https://tinder.com', category: 'dating' as AppCategory, color: '#FE3C72', disguise: 'Calculadora de Descuentos' },
            { name: 'Navegador Oculto', url: 'https://duckduckgo.com', category: 'browser' as AppCategory, color: '#6366f1', disguise: 'Reloj y Cronómetro' }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOpenAdd(preset)}
              className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-zinc-300 rounded-lg border border-neutral-800 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
              <span>+ {preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Todas las Apps' },
          { id: 'messaging', label: 'Mensajería & Chats' },
          { id: 'social', label: 'Redes Sociales' },
          { id: 'dating', label: 'Citas & Parejas' },
          { id: 'browser', label: 'Navegación Fantasma' },
          { id: 'custom', label: 'Personalizadas' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-neutral-800 text-amber-400 border border-amber-500/30'
                : 'bg-neutral-900/60 text-zinc-400 hover:text-zinc-200 border border-neutral-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Formulario para Añadir / Clonar App */}
      {isAdding && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h4 className="text-sm font-semibold text-white">Configurar Nueva App Oculta</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveApp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre Real de la App</label>
              <input
                type="text"
                placeholder="ej: WhatsApp, Tinder, Galería..."
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Enlace / Web App (URL)</label>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as AppCategory)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="messaging">Mensajería y Chats</option>
                <option value="social">Redes Sociales</option>
                <option value="dating">Citas y Encuentros</option>
                <option value="browser">Navegador Fantasma</option>
                <option value="finance">Bancos y Finanzas</option>
                <option value="custom">Otra Personalizada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Color del Icono</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer p-0.5"
                />
                <span className="text-xs text-zinc-400 font-mono">{color}</span>
              </div>
            </div>

            {/* Modo Camuflaje / Disguise */}
            <div className="sm:col-span-2 p-3.5 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Modo Camuflaje (Doble Identidad)</span>
                  <span className="text-[11px] text-zinc-500 block">
                    Muestra un nombre e icono ficticio para despistar a quien revise la pantalla
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isCloaked}
                  onChange={e => setIsCloaked(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {isCloaked && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre Falso de Camuflaje</label>
                  <input
                    type="text"
                    placeholder="ej: Conversor de Divisas, Notas de Cálculo..."
                    value={disguiseName}
                    onChange={e => setDisguiseName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-amber-300 text-xs focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Notas de la app (opcional)</label>
              <textarea
                rows={2}
                placeholder="Cuentas secundarias, recordatorios, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-300 rounded-xl text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs"
              >
                <Check className="w-4 h-4" /> Guardar en Bóveda
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Aplicaciones Ocultas - Estilo Pantalla de Inicio Móvil */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 text-sm">Cargando aplicaciones ocultas...</div>
      ) : filteredApps.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-3">
            <Smartphone className="w-6 h-6 text-zinc-500" />
          </div>
          <h4 className="text-white font-medium text-base mb-1">No hay aplicaciones ocultas</h4>
          <p className="text-zinc-500 text-xs max-w-sm mb-4">
            Clona o añade apps como WhatsApp, Instagram, Telegram o apps de citas para abrirlas en un contenedor privado sin dejar rastro.
          </p>
          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            Añadir primera app
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredApps.map(app => {
            const displayName = app.isCloaked && app.disguiseName ? app.disguiseName : app.name;

            return (
              <div
                key={app.id}
                onClick={() => setSelectedAppToRun(app)}
                className="group relative bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col items-center justify-between text-center gap-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
              >
                {/* Badge de Camuflaje / Estado */}
                <div className="w-full flex items-center justify-between text-[10px]">
                  <span
                    onClick={(e) => toggleCloak(app, e)}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                      app.isCloaked
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-neutral-800 text-zinc-500'
                    }`}
                    title={app.isCloaked ? "Camuflada con nombre ficticio" : "Nombre real visible"}
                  >
                    {app.isCloaked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{app.isCloaked ? 'Camuflada' : 'Visible'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAppToDelete({ id: app.id, name: app.name });
                    }}
                    className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar de la bóveda"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Icono de App Estilo Smartphone */}
                <div
                  className="w-16 h-16 rounded-[22px] shadow-lg flex items-center justify-center text-white text-2xl font-bold tracking-tight transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: app.color,
                    boxShadow: `0 8px 20px ${app.color}35`
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>

                {/* Nombres y Estado */}
                <div className="w-full">
                  <h5 className="font-semibold text-xs text-white truncate w-full" title={displayName}>
                    {displayName}
                  </h5>
                  {app.isCloaked && (
                    <p className="text-[10px] text-zinc-500 truncate w-full" title={app.originalName}>
                      Real: {app.originalName}
                    </p>
                  )}
                </div>

                {/* Botón de Ejecutar / Abrir */}
                <div className="w-full pt-1">
                  <span className="w-full py-1.5 px-2 bg-neutral-950 group-hover:bg-amber-500 group-hover:text-black text-zinc-400 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-colors">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Abrir</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visor de App en Ejecución */}
      {selectedAppToRun && (
        <AppRunnerModal
          app={selectedAppToRun}
          onClose={() => setSelectedAppToRun(null)}
          onEmergencyLock={onEmergencyLock}
        />
      )}

      <ConfirmDialog
        isOpen={!!appToDelete}
        title="¿Eliminar app oculta?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${appToDelete?.name}" de la bóveda?`}
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setAppToDelete(null)}
      />

    </div>
  );
};
