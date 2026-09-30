/**
 * Tipos de datos para el sistema de bóveda y almacenamiento privado.
 * Diseñados para integrarse directamente con colecciones de Firestore y Firebase Storage.
 */

export type FileCategory = 'image' | 'video' | 'document' | 'audio' | 'other';

export interface VaultFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  /** En frontend es dataUrl / blob; en Firebase será storagePath o downloadURL */
  dataUrl: string;
  storagePath?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  notes?: string;
  source?: 'phone_gallery' | 'secret_camera' | 'voice_recorder' | 'upload';
}

export interface VaultNote {
  id: string;
  title: string;
  content: string;
  category?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VaultCredential {
  id: string;
  service: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppCategory = 'messaging' | 'social' | 'dating' | 'finance' | 'browser' | 'tools' | 'custom';

export interface HiddenApp {
  id: string;
  name: string;
  originalName: string;
  category: AppCategory;
  iconType: 'preset' | 'custom' | 'emoji';
  iconKey: string;
  color: string;
  url: string;
  isCloaked: boolean;
  disguiseName?: string;
  disguiseIcon?: string;
  notes?: string;
  createdAt: string;
  lastOpened?: string;
}

export interface SecretContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  alias?: string;
  notes?: string;
  createdAt: string;
}

export interface IntruderSelfie {
  id: string;
  photoDataUrl: string;
  timestamp: string;
  attemptedCode: string;
}

export interface VaultConfig {
  secretCode: string;
  autoLockMinutes: number;
  fakeErrorEnabled: boolean;
  intruderDetection: boolean;
}

export interface VaultStats {
  totalFiles: number;
  totalNotes: number;
  totalCredentials: number;
  totalHiddenApps: number;
  totalContacts: number;
  usedBytes: number;
}
