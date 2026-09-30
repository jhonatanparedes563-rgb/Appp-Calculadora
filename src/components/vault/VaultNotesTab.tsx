import React, { useState, useEffect } from 'react';
import { VaultNote } from '../../types/vault';
import { fetchVaultNotes, saveVaultNote, deleteVaultNote } from '../../services/vaultService';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Plus, Pin, Trash2, Edit3, Check, X, Search, FileText } from 'lucide-react';

export const VaultNotesTab: React.FC = () => {
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Formulario
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<string>('Personal');
  const [isPinned, setIsPinned] = useState<boolean>(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await fetchVaultNotes();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleOpenNew = () => {
    setCurrentId(null);
    setTitle('');
    setContent('');
    setCategory('Personal');
    setIsPinned(false);
    setIsEditing(true);
  };

  const handleEdit = (note: VaultNote) => {
    setCurrentId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || 'Personal');
    setIsPinned(note.isPinned);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    try {
      await saveVaultNote({
        id: currentId || undefined,
        title: title.trim() || 'Nota sin título',
        content,
        category,
        isPinned
      });
      await loadNotes();
      setIsEditing(false);
    } catch (err) {
      console.error("Error al guardar nota:", err);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!noteToDelete) return;
    try {
      await deleteVaultNote(noteToDelete);
      setNotes(prev => prev.filter(n => n.id !== noteToDelete));
      if (currentId === noteToDelete) setIsEditing(false);
    } catch (err) {
      console.error("Error al eliminar nota:", err);
    } finally {
      setNoteToDelete(null);
    }
  };

  const togglePin = async (note: VaultNote, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await saveVaultNote({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        isPinned: !note.isPinned
      });
      await loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Barra de acción superior */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar notas secretas..."
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
          Nueva Nota
        </button>
      </div>

      {/* Editor Modal / Inline Form */}
      {isEditing && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h4 className="text-sm font-semibold text-white">
              {currentId ? 'Editar Nota Secreta' : 'Crear Nota Secreta'}
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  isPinned ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:bg-neutral-800'
                }`}
              >
                <Pin className="w-4 h-4" />
                <span className="hidden sm:inline">{isPinned ? 'Fijada' : 'Fijar'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <input
              type="text"
              placeholder="Título de la nota..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-medium text-sm focus:outline-none focus:border-amber-500"
              autoFocus
            />

            <textarea
              rows={6}
              placeholder="Escribe aquí tu información confidencial, claves, pensamientos o listas..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-amber-500 resize-none font-sans"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Categoría:</span>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 text-xs text-zinc-300 rounded-lg focus:outline-none focus:border-amber-500"
                >
                  <option value="Personal">Personal</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Trabajo">Trabajo</option>
                  <option value="Claves">Claves</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-colors"
                >
                  <Check className="w-4 h-4" /> Guardar Nota
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Notas */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 text-sm">Cargando notas...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-zinc-500" />
          </div>
          <h4 className="text-white font-medium text-base mb-1">Sin notas secretas</h4>
          <p className="text-zinc-500 text-xs max-w-sm mb-4">
            Guarda reflexiones privadas, números de cuenta, códigos de respaldo y listas confidenciales.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            Crear primera nota
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => handleEdit(note)}
              className="group relative bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="font-semibold text-sm text-white line-clamp-1 flex-1">
                    {note.title}
                  </h5>
                  <button
                    type="button"
                    onClick={(e) => togglePin(note, e)}
                    className={`p-1 rounded-md transition-colors ${
                      note.isPinned ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-4 whitespace-pre-wrap font-sans">
                  {note.content || 'Sin contenido adicional'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-800/80 text-[11px] text-zinc-500">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-neutral-800 rounded text-zinc-400">
                  {note.category || 'General'}
                </span>
                <div className="flex items-center gap-2">
                  <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNoteToDelete(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-opacity p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!noteToDelete}
        title="¿Eliminar nota privada?"
        message="¿Estás seguro de que deseas eliminar permanentemente esta nota de la bóveda?"
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
};
