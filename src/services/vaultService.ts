/**
 * Servicio de almacenamiento y gestión de la bóveda secreta.
 *
 * NOTA DE ARQUITECTURA:
 * Este servicio está estructurado para conectarse directamente a Firebase (Firestore y Firebase Storage).
 * Las firmas de las funciones son asíncronas (Promise-based) para que la migración a backend/Firebase
 * sea un reemplazo directo sin alterar los componentes de la interfaz.
 */

import {
  VaultFile,
  VaultNote,
  VaultCredential,
  FileCategory,
  VaultStats,
  HiddenApp,
  SecretContact,
  IntruderSelfie
} from '../types/vault';
import { getSecretCode, setCustomSecretCode } from '../config/secret';

const STORAGE_KEYS = {
  FILES: 'calc_vault_files_v1',
  NOTES: 'calc_vault_notes_v1',
  CREDS: 'calc_vault_creds_v1',
  APPS: 'calc_vault_hidden_apps_v1',
  CONTACTS: 'calc_vault_contacts_v1',
  INTRUDERS: 'calc_vault_intruders_v1',
  CONFIG: 'calc_vault_config_v1'
};

// =========================================================================
// MÉTODOS PREPARADOS PARA ARCHIVOS (FOTOS, DOCUMENTOS, VIDEOS, CÁMARA, AUDIO)
// [FIREBASE_READY]: Reemplazar lógica local por 'ref(storage, ...)' y 'collection(db, "vault_files")'
// =========================================================================

export async function fetchVaultFiles(): Promise<VaultFile[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FILES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error al cargar archivos locales:", err);
    return [];
  }
}

export async function uploadVaultFile(
  file: File,
  category?: FileCategory,
  notes?: string,
  source: 'phone_gallery' | 'secret_camera' | 'voice_recorder' | 'upload' = 'upload'
): Promise<VaultFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const detectedCategory: FileCategory =
          category ||
          (file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
            ? 'video'
            : file.type.startsWith('audio/')
            ? 'audio'
            : file.type.includes('pdf') || file.type.includes('text') || file.type.includes('document')
            ? 'document'
            : 'other');

        const newFile: VaultFile = {
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          category: detectedCategory,
          dataUrl: reader.result as string,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: notes || '',
          source
        };

        const existing = await fetchVaultFiles();
        existing.unshift(newFile);
        localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(existing));
        resolve(newFile);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Guarda directamente una captura de la cámara o grabación de audio como archivo en la bóveda
 */
export async function saveDirectMedia(
  dataUrl: string,
  name: string,
  type: string,
  category: FileCategory,
  source: 'secret_camera' | 'voice_recorder'
): Promise<VaultFile> {
  const approxSize = Math.round((dataUrl.length * 3) / 4);
  const newFile: VaultFile = {
    id: 'media_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name,
    size: approxSize,
    type,
    category,
    dataUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source
  };

  const existing = await fetchVaultFiles();
  existing.unshift(newFile);
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(existing));
  return newFile;
}

export async function deleteVaultFile(fileId: string): Promise<void> {
  const existing = await fetchVaultFiles();
  const filtered = existing.filter(f => f.id !== fileId);
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(filtered));
}

// =========================================================================
// MÉTODOS PARA OCULTADOR DE APLICACIONES (APP HIDER / CLOAKER)
// [FIREBASE_READY]: Reemplazar lógica local por 'collection(db, "vault_apps")'
// =========================================================================

const DEFAULT_PRESET_APPS: HiddenApp[] = [
  {
    id: 'app_whatsapp',
    name: 'WhatsApp Privado',
    originalName: 'WhatsApp',
    category: 'messaging',
    iconType: 'preset',
    iconKey: 'whatsapp',
    color: '#25D366',
    url: 'https://web.whatsapp.com',
    isCloaked: true,
    disguiseName: 'Calculadora de Notas',
    disguiseIcon: 'FileText',
    notes: 'Sesión aislada para chats confidenciales',
    createdAt: new Date().toISOString()
  },
  {
    id: 'app_telegram',
    name: 'Telegram Secreto',
    originalName: 'Telegram',
    category: 'messaging',
    iconType: 'preset',
    iconKey: 'telegram',
    color: '#0088cc',
    url: 'https://web.telegram.org',
    isCloaked: false,
    disguiseName: 'Registro de Gastos',
    notes: 'Mensajería cifrada independiente',
    createdAt: new Date().toISOString()
  },
  {
    id: 'app_instagram',
    name: 'Instagram Oculto',
    originalName: 'Instagram',
    category: 'social',
    iconType: 'preset',
    iconKey: 'instagram',
    color: '#E4405F',
    url: 'https://www.instagram.com',
    isCloaked: true,
    disguiseName: 'Calculadora de Impuestos',
    notes: 'Cuenta secundaria privada',
    createdAt: new Date().toISOString()
  },
  {
    id: 'app_tiktok',
    name: 'TikTok Privado',
    originalName: 'TikTok',
    category: 'social',
    iconType: 'preset',
    iconKey: 'tiktok',
    color: '#000000',
    url: 'https://www.tiktok.com',
    isCloaked: false,
    notes: 'Videos sin recomendaciones del feed principal',
    createdAt: new Date().toISOString()
  },
  {
    id: 'app_ghost_browser',
    name: 'Navegador Fantasma',
    originalName: 'Navegador Privado',
    category: 'browser',
    iconType: 'preset',
    iconKey: 'browser',
    color: '#6366f1',
    url: 'https://duckduckgo.com',
    isCloaked: true,
    disguiseName: 'Conversor de Unidades',
    notes: 'Búsquedas y navegación sin guardar cookies ni historial',
    createdAt: new Date().toISOString()
  },
  {
    id: 'app_tinder',
    name: 'App de Citas Oculta',
    originalName: 'Tinder',
    category: 'dating',
    iconType: 'preset',
    iconKey: 'dating',
    color: '#FE3C72',
    url: 'https://tinder.com',
    isCloaked: true,
    disguiseName: 'Configuración de Audio',
    notes: 'Perfil de citas oculto de la pantalla de inicio',
    createdAt: new Date().toISOString()
  }
];

export async function fetchHiddenApps(): Promise<HiddenApp[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPS);
    if (!raw) {
      // Inicializar con las aplicaciones predeterminadas
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(DEFAULT_PRESET_APPS));
      return DEFAULT_PRESET_APPS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error al cargar aplicaciones ocultas:", err);
    return DEFAULT_PRESET_APPS;
  }
}

export async function saveHiddenApp(
  app: Omit<HiddenApp, 'id' | 'createdAt'> & { id?: string }
): Promise<HiddenApp> {
  const existing = await fetchHiddenApps();
  const now = new Date().toISOString();

  if (app.id) {
    const updated = existing.map(a => {
      if (a.id === app.id) {
        return {
          ...a,
          ...app,
          lastOpened: a.lastOpened
        };
      }
      return a;
    });
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(updated));
    return updated.find(a => a.id === app.id)!;
  } else {
    const created: HiddenApp = {
      id: 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: app.name,
      originalName: app.originalName || app.name,
      category: app.category || 'custom',
      iconType: app.iconType || 'preset',
      iconKey: app.iconKey || 'custom',
      color: app.color || '#f59e0b',
      url: app.url,
      isCloaked: !!app.isCloaked,
      disguiseName: app.disguiseName,
      disguiseIcon: app.disguiseIcon,
      notes: app.notes,
      createdAt: now
    };
    existing.unshift(created);
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(existing));
    return created;
  }
}

export async function deleteHiddenApp(appId: string): Promise<void> {
  const existing = await fetchHiddenApps();
  const filtered = existing.filter(a => a.id !== appId);
  localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(filtered));
}

// =========================================================================
// MÉTODOS PARA CONTACTOS SECRETOS (JALADOS O GUARDADOS)
// =========================================================================

export async function fetchSecretContacts(): Promise<SecretContact[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error al cargar contactos:", err);
    return [];
  }
}

export async function saveSecretContact(
  contact: Omit<SecretContact, 'id' | 'createdAt'> & { id?: string }
): Promise<SecretContact> {
  const existing = await fetchSecretContacts();
  const now = new Date().toISOString();

  if (contact.id) {
    const updated = existing.map(c => (c.id === contact.id ? { ...c, ...contact } : c));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(updated));
    return updated.find(c => c.id === contact.id)!;
  } else {
    const created: SecretContact = {
      id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      alias: contact.alias,
      notes: contact.notes,
      createdAt: now
    };
    existing.unshift(created);
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(existing));
    return created;
  }
}

export async function deleteSecretContact(contactId: string): Promise<void> {
  const existing = await fetchSecretContacts();
  const filtered = existing.filter(c => c.id !== contactId);
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(filtered));
}

// =========================================================================
// MÉTODOS PARA DETECCIÓN DE INTRUSOS
// =========================================================================

export async function recordIntruder(photoDataUrl: string, attemptedCode: string): Promise<IntruderSelfie> {
  const intruder: IntruderSelfie = {
    id: 'intruder_' + Date.now(),
    photoDataUrl,
    timestamp: new Date().toISOString(),
    attemptedCode
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTRUDERS);
    const list: IntruderSelfie[] = raw ? JSON.parse(raw) : [];
    list.unshift(intruder);
    // Limitar a los últimos 20 intentos
    localStorage.setItem(STORAGE_KEYS.INTRUDERS, JSON.stringify(list.slice(0, 20)));
  } catch (e) {
    console.error("Error guardando intruso:", e);
  }
  return intruder;
}

export async function fetchIntruders(): Promise<IntruderSelfie[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTRUDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearIntruders(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.INTRUDERS);
}

// =========================================================================
// MÉTODOS PREPARADOS PARA NOTAS PRIVADAS
// =========================================================================

export async function fetchVaultNotes(): Promise<VaultNote[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error al cargar notas:", err);
    return [];
  }
}

export async function saveVaultNote(
  note: Omit<VaultNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<VaultNote> {
  const existing = await fetchVaultNotes();
  const now = new Date().toISOString();

  if (note.id) {
    const updated = existing.map(n => {
      if (n.id === note.id) {
        return {
          ...n,
          title: note.title,
          content: note.content,
          category: note.category,
          isPinned: note.isPinned,
          updatedAt: now
        };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
    return updated.find(n => n.id === note.id)!;
  } else {
    const created: VaultNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: note.title || 'Nota sin título',
      content: note.content || '',
      category: note.category || 'General',
      isPinned: note.isPinned || false,
      createdAt: now,
      updatedAt: now
    };
    existing.unshift(created);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(existing));
    return created;
  }
}

export async function deleteVaultNote(noteId: string): Promise<void> {
  const existing = await fetchVaultNotes();
  const filtered = existing.filter(n => n.id !== noteId);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
}

// =========================================================================
// MÉTODOS PREPARADOS PARA CONTRASEÑAS Y CREDENCIALES
// =========================================================================

export async function fetchVaultCredentials(): Promise<VaultCredential[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error al cargar credenciales:", err);
    return [];
  }
}

export async function saveVaultCredential(
  cred: Omit<VaultCredential, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<VaultCredential> {
  const existing = await fetchVaultCredentials();
  const now = new Date().toISOString();

  if (cred.id) {
    const updated = existing.map(c => {
      if (c.id === cred.id) {
        return {
          ...c,
          service: cred.service,
          username: cred.username,
          password: cred.password,
          url: cred.url,
          notes: cred.notes,
          updatedAt: now
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.CREDS, JSON.stringify(updated));
    return updated.find(c => c.id === cred.id)!;
  } else {
    const created: VaultCredential = {
      id: 'cred_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      service: cred.service,
      username: cred.username,
      password: cred.password,
      url: cred.url || '',
      notes: cred.notes || '',
      createdAt: now,
      updatedAt: now
    };
    existing.unshift(created);
    localStorage.setItem(STORAGE_KEYS.CREDS, JSON.stringify(existing));
    return created;
  }
}

export async function deleteVaultCredential(credId: string): Promise<void> {
  const existing = await fetchVaultCredentials();
  const filtered = existing.filter(c => c.id !== credId);
  localStorage.setItem(STORAGE_KEYS.CREDS, JSON.stringify(filtered));
}

// =========================================================================
// ESTADÍSTICAS Y CONFIGURACIÓN
// =========================================================================

export async function getVaultStats(): Promise<VaultStats> {
  const files = await fetchVaultFiles();
  const notes = await fetchVaultNotes();
  const creds = await fetchVaultCredentials();
  const apps = await fetchHiddenApps();
  const contacts = await fetchSecretContacts();

  const usedBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return {
    totalFiles: files.length,
    totalNotes: notes.length,
    totalCredentials: creds.length,
    totalHiddenApps: apps.length,
    totalContacts: contacts.length,
    usedBytes
  };
}

export async function updateVaultPasscode(newCode: string): Promise<boolean> {
  return setCustomSecretCode(newCode);
}

export async function clearAllLocalVaultData(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.FILES);
  localStorage.removeItem(STORAGE_KEYS.NOTES);
  localStorage.removeItem(STORAGE_KEYS.CREDS);
  localStorage.removeItem(STORAGE_KEYS.APPS);
  localStorage.removeItem(STORAGE_KEYS.CONTACTS);
  localStorage.removeItem(STORAGE_KEYS.INTRUDERS);
}
