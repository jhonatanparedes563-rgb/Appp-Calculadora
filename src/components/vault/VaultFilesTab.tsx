import React, { useState, useEffect, useRef } from 'react';
import { VaultFile, FileCategory } from '../../types/vault';
import { fetchVaultFiles, uploadVaultFile, deleteVaultFile } from '../../services/vaultService';
import { PhoneCaptureModal } from './PhoneCaptureModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  UploadCloud,
  File,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Trash2,
  Download,
  Eye,
  X,
  Search,
  Smartphone,
  Camera,
  Mic,
  CheckCircle2
} from 'lucide-react';

export const VaultFilesTab: React.FC = () => {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<VaultFile | null>(null);
  const [showPhoneCapture, setShowPhoneCapture] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fetchVaultFiles();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        await uploadVaultFile(selectedFiles[i]);
      }
      await loadFiles();
      showToast(`${selectedFiles.length} archivo(s) guardado(s) en la bóveda`);
    } catch (err) {
      console.error("Error al subir archivo:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!fileToDelete) return;
    try {
      await deleteVaultFile(fileToDelete.id);
      setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      if (selectedFileForPreview?.id === fileToDelete.id) {
        setSelectedFileForPreview(null);
      }
      showToast(`"${fileToDelete.name}" eliminado de la bóveda`);
    } catch (err) {
      console.error("Error al eliminar archivo:", err);
    } finally {
      setFileToDelete(null);
    }
  };

  const handleUnhideFile = async (file: VaultFile) => {
    // 1. Descargar / devolver al teléfono
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 2. Quitar de la bóveda ya que fue devuelto al teléfono
    await deleteVaultFile(file.id);
    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (selectedFileForPreview?.id === file.id) {
      setSelectedFileForPreview(null);
    }
    showToast(`"${file.name}" se restauró y descargó en tu teléfono.`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => {
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    const matchesQuery = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'video':
        return <Film className="w-5 h-5 text-purple-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-amber-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-400" />;
      default:
        return <File className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getSourceBadge = (source?: string) => {
    if (source === 'secret_camera') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] bg-red-950/70 text-red-400 border border-red-800/40 px-1.5 py-0.5 rounded">
          <Camera className="w-2.5 h-2.5" /> Cámara Secreta
        </span>
      );
    }
    if (source === 'voice_recorder') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] bg-amber-950/70 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded">
          <Mic className="w-2.5 h-2.5" /> Audio Secreto
        </span>
      );
    }
    if (source === 'phone_gallery') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] bg-blue-950/70 text-blue-400 border border-blue-800/40 px-1.5 py-0.5 rounded">
          <Smartphone className="w-2.5 h-2.5" /> Galería Móvil
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Zona superior: Buscador + Botón "Jalar del Teléfono" + Subida Normal */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar archivos secretos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2">
          {/* BOTÓN PROMINENTE: Jalar del Teléfono */}
          <button
            type="button"
            onClick={() => setShowPhoneCapture(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold rounded-xl text-xs sm:text-sm transition-all duration-150 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Jalar del Teléfono</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 font-medium rounded-xl text-xs sm:text-sm transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden md:inline">{uploading ? 'Guardando...' : 'Subir Archivo'}</span>
          </button>
        </div>
      </div>

      {/* Selector de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'image', label: 'Imágenes' },
          { id: 'document', label: 'Documentos' },
          { id: 'video', label: 'Videos' },
          { id: 'audio', label: 'Audios / Voz' }
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

      {/* Lista / Grid de Archivos */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 text-sm">Cargando archivos de la bóveda...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-3">
            <Smartphone className="w-6 h-6 text-amber-500" />
          </div>
          <h4 className="text-white font-medium text-base mb-1">Bóveda vacía</h4>
          <p className="text-zinc-500 text-xs max-w-sm mb-4">
            Jala fotos del carrete de tu celular, toma fotos con la cámara secreta o graba audio protegido.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPhoneCapture(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Jalar del Teléfono
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="group relative bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col"
            >
              {/* Previsualización */}
              <div
                onClick={() => setSelectedFileForPreview(file)}
                className="aspect-square bg-neutral-950 flex items-center justify-center cursor-pointer relative overflow-hidden"
              >
                {file.category === 'image' ? (
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-3 text-center">
                    {getCategoryIcon(file.category)}
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                      {file.type.split('/')[1] || 'ARCHIVO'}
                    </span>
                  </div>
                )}

                {/* Badge de Origen (Cámara, Voz, Galería) */}
                <div className="absolute top-2 left-2 pointer-events-none">
                  {getSourceBadge(file.source)}
                </div>

                {/* Overlay de hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    title="Ver detalle"
                    className="p-2 bg-neutral-800/90 hover:bg-neutral-700 text-white rounded-full transition-transform active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Información y Acciones */}
              <div className="p-3 flex flex-col justify-between flex-1 gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-white truncate flex-1" title={file.name}>
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFileToDelete({ id: file.id, name: file.name })}
                    title="Eliminar"
                    className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Botón explícito para Desocultar y devolver al teléfono */}
                <button
                  type="button"
                  onClick={() => handleUnhideFile(file)}
                  className="w-full mt-1 py-1 px-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 border border-neutral-800 text-[10px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Devolver este archivo a tu galería o descargas del teléfono"
                >
                  <Download className="w-3 h-3" />
                  <span>Desocultar / Restaurar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Captura y Extracción del Teléfono */}
      {showPhoneCapture && (
        <PhoneCaptureModal
          onClose={() => setShowPhoneCapture(false)}
          onMediaSaved={() => {
            loadFiles();
          }}
        />
      )}

      {/* Modal de Previsualización a pantalla completa */}
      {selectedFileForPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedFileForPreview(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 truncate pr-4">
                {getCategoryIcon(selectedFileForPreview.category)}
                <span className="text-sm font-semibold text-white truncate">
                  {selectedFileForPreview.name}
                </span>
                {getSourceBadge(selectedFileForPreview.source)}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedFileForPreview.dataUrl}
                  download={selectedFileForPreview.name}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-zinc-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Descargar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedFileForPreview(null)}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-auto py-4 flex items-center justify-center min-h-[300px]">
              {selectedFileForPreview.category === 'image' ? (
                <img
                  src={selectedFileForPreview.dataUrl}
                  alt={selectedFileForPreview.name}
                  className="max-h-[65vh] object-contain rounded-lg"
                />
              ) : selectedFileForPreview.category === 'video' ? (
                <video
                  src={selectedFileForPreview.dataUrl}
                  controls
                  className="max-h-[65vh] max-w-full rounded-lg"
                />
              ) : selectedFileForPreview.category === 'audio' ? (
                <div className="w-full max-w-md p-6 bg-neutral-950 rounded-2xl border border-neutral-800 text-center">
                  <Music className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm text-white font-medium mb-3">{selectedFileForPreview.name}</p>
                  <audio
                    src={selectedFileForPreview.dataUrl}
                    controls
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-300 font-medium mb-1">
                    Vista previa de documento
                  </p>
                  <p className="text-xs text-zinc-500 mb-4">
                    Tamaño: {formatFileSize(selectedFileForPreview.size)}
                  </p>
                  <a
                    href={selectedFileForPreview.dataUrl}
                    download={selectedFileForPreview.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-lg"
                  >
                    <Download className="w-4 h-4" /> Descargar para visualizar
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Borrado */}
      <ConfirmDialog
        isOpen={!!fileToDelete}
        title="¿Eliminar archivo?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${fileToDelete?.name}" de la bóveda?`}
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setFileToDelete(null)}
      />

      {/* Notificación Toast flotante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
