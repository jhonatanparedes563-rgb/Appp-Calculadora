import React, { useState, useEffect } from 'react';
import { VaultCredential } from '../../types/vault';
import {
  fetchVaultCredentials,
  saveVaultCredential,
  deleteVaultCredential
} from '../../services/vaultService';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Search,
  X
} from 'lucide-react';

export const VaultCredentialsTab: React.FC = () => {
  const [creds, setCreds] = useState<VaultCredential[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Formulario
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [service, setService] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const loadCreds = async () => {
    setLoading(true);
    try {
      const data = await fetchVaultCredentials();
      setCreds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreds();
  }, []);

  const handleOpenNew = () => {
    setCurrentId(null);
    setService('');
    setUsername('');
    setPassword('');
    setUrl('');
    setNotes('');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim() || !password.trim()) return;

    try {
      await saveVaultCredential({
        id: currentId || undefined,
        service: service.trim(),
        username: username.trim(),
        password: password.trim(),
        url: url.trim(),
        notes: notes.trim()
      });
      await loadCreds();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la cuenta "${name}"?`)) return;
    try {
      await deleteVaultCredential(id);
      setCreds(prev => prev.filter(c => c.id !== id));
      if (currentId === id) setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const filtered = creds.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.service.toLowerCase().includes(q) || c.username.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Barra de acción superior */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cuentas, correos o servicios..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva Cuenta
        </button>
      </div>

      {/* Editor Modal / Formulario */}
      {isEditing && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h4 className="text-sm font-semibold text-white">
              {currentId ? 'Editar Credencial' : 'Registrar Nueva Credencial'}
            </h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Servicio / Sitio</label>
              <input
                type="text"
                placeholder="ej: Google, Banco, Correo Privado"
                value={service}
                onChange={e => setService(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Usuario / Email / ID</label>
              <input
                type="text"
                placeholder="ej: usuario@ejemplo.com"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-400">Contraseña / PIN</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Generar contraseña segura
                </button>
              </div>
              <input
                type="text"
                placeholder="Contraseña secreta"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">URL / Enlace (opcional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Notas adicionales (opcional)</label>
              <textarea
                rows={2}
                placeholder="Preguntas de seguridad, códigos 2FA de recuperación, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-300 rounded-xl text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs"
              >
                <Check className="w-4 h-4" /> Guardar Cuenta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Cuentas */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 text-sm">Cargando credenciales...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6 text-zinc-500" />
          </div>
          <h4 className="text-white font-medium text-base mb-1">Sin credenciales guardadas</h4>
          <p className="text-zinc-500 text-xs max-w-sm mb-4">
            Guarda de forma encriptada contraseñas, billeteras de cripto y accesos privados.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            Añadir primera cuenta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => {
            const isRevealed = !!revealedIds[item.id];
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm text-white">{item.service}</h5>
                        {item.username && (
                          <p className="text-xs text-zinc-400">{item.username}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-neutral-800 transition-colors"
                          title="Abrir enlace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.service)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Campo de Contraseña con acciones */}
                  <div className="mt-3 bg-neutral-950 border border-neutral-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-amber-300 tracking-wider truncate">
                      {isRevealed ? item.password : '••••••••••••••••'}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleReveal(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        title={isRevealed ? "Ocultar" : "Mostrar"}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.password, item.id)}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          isCopied ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Copiar contraseña"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-xs text-zinc-400 italic bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/40">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-neutral-800/60">
                  <span>Actualizado: {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                  {item.username && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.username, item.id + '_u')}
                      className="text-amber-500/80 hover:text-amber-400 transition-colors"
                    >
                      Copiar usuario
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
