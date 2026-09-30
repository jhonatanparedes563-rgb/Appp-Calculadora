import React, { useState, useEffect } from 'react';
import { SecretContact } from '../../types/vault';
import {
  fetchSecretContacts,
  saveSecretContact,
  deleteSecretContact
} from '../../services/vaultService';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  Users,
  Plus,
  Phone,
  MessageCircle,
  Trash2,
  Copy,
  Check,
  Search,
  Smartphone,
  Shield,
  X
} from 'lucide-react';

export const VaultContactsTab: React.FC = () => {
  const [contacts, setContacts] = useState<SecretContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<{ id: string; name: string } | null>(null);

  // Formulario
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [alias, setAlias] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await fetchSecretContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Jalar del teléfono usando Web Contacts API (si el celular lo soporta en Chrome/Android)
  const handleImportFromPhoneBook = async () => {
    const nav = navigator as unknown as { contacts?: { select: (props: string[], opts?: { multiple?: boolean }) => Promise<Array<{ name?: string[]; tel?: string[] }>> } };
    if (nav.contacts && typeof nav.contacts.select === 'function') {
      try {
        const props = ['name', 'tel'];
        const selected = await nav.contacts.select(props, { multiple: true });
        if (selected && selected.length > 0) {
          for (const item of selected) {
            const contactName = item.name?.[0] || 'Contacto';
            const contactTel = item.tel?.[0] || '';
            if (contactTel) {
              await saveSecretContact({
                name: contactName,
                phone: contactTel,
                alias: 'Contacto Privado',
                notes: 'Importado de la agenda del teléfono'
              });
            }
          }
          await loadContacts();
          return;
        }
      } catch (err) {
        console.warn("Contacts API no concedida o cancelada:", err);
      }
    }

    // Si no está soportado o se canceló, abrir el formulario manual
    setIsAdding(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      await saveSecretContact({
        name: name.trim(),
        phone: phone.trim(),
        alias: alias.trim() || 'Contacto Secreto',
        notes: notes.trim()
      });
      await loadContacts();
      setName('');
      setPhone('');
      setAlias('');
      setNotes('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!contactToDelete) return;
    try {
      await deleteSecretContact(contactToDelete.id);
      setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
    } catch (err) {
      console.error(err);
    } finally {
      setContactToDelete(null);
    }
  };

  const copyPhone = (tel: string, id: string) => {
    navigator.clipboard.writeText(tel);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.alias && c.alias.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar contactos confidenciales..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleImportFromPhoneBook}
            className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Importar de la agenda del celular"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Jalar de la Agenda</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Contacto
          </button>
        </div>
      </div>

      {/* Formulario para Nuevo Contacto */}
      {isAdding && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h4 className="text-sm font-semibold text-white">Guardar Contacto Confidencial</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveContact} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre Real</label>
              <input
                type="text"
                placeholder="ej: Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                placeholder="+52 123 456 7890"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Alias de Camuflaje</label>
              <input
                type="text"
                placeholder="ej: Plomero, Oficina, Soporte..."
                value={alias}
                onChange={e => setAlias(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-amber-300 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Notas Privadas</label>
              <input
                type="text"
                placeholder="Horarios para llamar, temas a tratar..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-amber-500"
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
                <Check className="w-4 h-4" /> Guardar Contacto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Contactos */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 text-sm">Cargando contactos confidenciales...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-zinc-500" />
          </div>
          <h4 className="text-white font-medium text-base mb-1">Sin contactos secretos</h4>
          <p className="text-zinc-500 text-xs max-w-sm mb-4">
            Guarda números y chats con alias protegidos para que no figuren en la agenda de tu teléfono.
          </p>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            Añadir primer contacto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(contact => {
            const isCopied = copiedId === contact.id;
            const cleanNumber = contact.phone.replace(/[^0-9]/g, '');

            return (
              <div
                key={contact.id}
                className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm text-white">{contact.name}</h5>
                        {contact.alias && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Alias: {contact.alias}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setContactToDelete({ id: contact.id, name: contact.name })}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Eliminar contacto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-300 tracking-wide">
                      {contact.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyPhone(contact.phone, contact.id)}
                      className={`p-1 rounded ${isCopied ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      title="Copiar número"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {contact.notes && (
                    <p className="mt-2 text-xs text-zinc-400 italic bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/40">
                      {contact.notes}
                    </p>
                  )}
                </div>

                {/* Acciones directas de llamada y WhatsApp */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex-1 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Llamar</span>
                  </a>

                  <a
                    href={`https://wa.me/${cleanNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!contactToDelete}
        title="¿Eliminar contacto?"
        message={`¿Estás seguro de que deseas eliminar permanentemente a "${contactToDelete?.name}" de la agenda secreta?`}
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setContactToDelete(null)}
      />

    </div>
  );
};
