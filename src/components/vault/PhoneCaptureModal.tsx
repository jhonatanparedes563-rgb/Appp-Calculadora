import React, { useState, useRef, useEffect } from 'react';
import { saveDirectMedia, uploadVaultFile } from '../../services/vaultService';
import {
  Camera,
  Mic,
  FolderOpen,
  X,
  RefreshCw,
  Check,
  Square,
  Sparkles,
  Smartphone,
  Shield,
  Volume2
} from 'lucide-react';

interface PhoneCaptureModalProps {
  onClose: () => void;
  onMediaSaved: () => void;
}

export const PhoneCaptureModal: React.FC<PhoneCaptureModalProps> = ({
  onClose,
  onMediaSaved
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'audio' | 'gallery'>('camera');
  
  // Cámara
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [capturedFlash, setCapturedFlash] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioError, setAudioError] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Galería
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryUploading, setGalleryUploading] = useState<boolean>(false);

  // Iniciar / detener cámara
  const startCamera = async (facing: 'user' | 'environment') => {
    stopCamera();
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error(err);
      setCameraError('No se pudo acceder a la cámara del teléfono o permiso denegado.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeMode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      stopAudioRecording();
    };
  }, [activeMode, facingMode]);

  // Tomar Foto Directa con la cámara del teléfono
  const takeSecretPhoto = async () => {
    if (!videoRef.current || !cameraActive) return;

    setCapturedFlash(true);
    setTimeout(() => setCapturedFlash(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Si es cámara frontal, espejar
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const filename = `Foto_Secreta_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.jpg`;
    await saveDirectMedia(dataUrl, filename, 'image/jpeg', 'image', 'secret_camera');
    onMediaSaved();
  };

  // Alternar cámara frontal/trasera
  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Grabación de Audio desde el micrófono del teléfono
  const startAudioRecording = async () => {
    setAudioError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const filename = `Nota_Voz_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.webm`;
          await saveDirectMedia(dataUrl, filename, 'audio/webm', 'audio', 'voice_recorder');
          onMediaSaved();
        };
        reader.readAsDataURL(audioBlob);

        // Detener pistas de audio
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      setAudioError('No se pudo acceder al micrófono del teléfono.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Importar desde el almacenamiento / Galería del teléfono
  const handlePhoneGalleryImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadVaultFile(files[i], undefined, 'Importado de la galería del celular', 'phone_gallery');
      }
      onMediaSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setGalleryUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Capturador de Teléfono */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Jalar Cosas del Teléfono</h3>
              <p className="text-[11px] text-zinc-400">
                Captura o importa directamente a la bóveda privada sin dejar rastros en la galería
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Modo */}
        <div className="flex items-center gap-1 p-2 bg-neutral-950 border-b border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Cámara Oculta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('audio')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeMode === 'audio'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Grabar Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('gallery')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeMode === 'gallery'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Galería del Teléfono</span>
          </button>
        </div>

        {/* Contenido según el modo */}
        <div className="p-5 flex-1 overflow-y-auto">
          
          {/* MODO 1: CÁMARA OCULTA */}
          {activeMode === 'camera' && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center text-xs text-red-400">
                    <p>{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="mt-3 px-3 py-1.5 bg-neutral-800 text-zinc-200 rounded-lg text-xs"
                    >
                      Reintentar permiso
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    {capturedFlash && (
                      <div className="absolute inset-0 bg-white opacity-80 animate-out fade-out duration-200 pointer-events-none" />
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Cámara Directa a Bóveda</span>
                    </div>
                  </>
                )}
              </div>

              {/* Controles de Disparo */}
              <div className="flex items-center justify-center gap-6 w-full pt-2">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 text-zinc-300 rounded-full transition-colors cursor-pointer"
                  title="Cambiar entre cámara frontal y trasera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                {/* Botón Obturador Grande */}
                <button
                  type="button"
                  onClick={takeSecretPhoto}
                  disabled={!cameraActive}
                  className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-90 transition-transform shadow-lg shadow-amber-500/30 flex items-center justify-center border-4 border-neutral-900 cursor-pointer disabled:opacity-50"
                  title="Tomar Foto Secreta"
                >
                  <Camera className="w-7 h-7 text-black" />
                </button>

                <div className="w-11" /> {/* balanceador visual */}
              </div>

              <p className="text-[11px] text-zinc-500 text-center">
                Las fotos se guardan <b>solo en la bóveda privada</b>. No aparecerán en Google Fotos ni en la galería nativa de tu teléfono.
              </p>
            </div>
          )}

          {/* MODO 2: GRABADORA DE AUDIO ESPÍA */}
          {activeMode === 'audio' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
              <div className="relative">
                <div
                  className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-red-500/20 text-red-500 border-2 border-red-500 animate-pulse'
                      : 'bg-neutral-950 text-amber-400 border border-neutral-800'
                  }`}
                >
                  <Mic className="w-12 h-12" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-mono font-bold text-white block">
                  {Math.floor(recordingSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(recordingSeconds % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-zinc-400 mt-1 block">
                  {isRecording ? 'Grabando audio en directo con el micrófono...' : 'Listo para grabar audio confidencial'}
                </span>
              </div>

              {audioError && <p className="text-xs text-red-400">{audioError}</p>}

              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startAudioRecording}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-2xl text-sm transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Iniciar Grabación</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopAudioRecording}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-2xl text-sm transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Detener y Guardar en Bóveda</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MODO 3: GALERÍA DEL TELÉFONO */}
          {activeMode === 'gallery' && (
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhoneGalleryImport}
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                className="hidden"
              />

              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <FolderOpen className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-base font-semibold text-white">Importar del Carrete y Teléfono</h4>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  Selecciona fotos, videos o archivos guardados en tu teléfono para copiarlos directamente al almacenamiento protegido.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={galleryUploading}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-2xl text-sm transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <FolderOpen className="w-4 h-4" />
                <span>{galleryUploading ? 'Importando archivos...' : 'Abrir Selector del Teléfono'}</span>
              </button>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-zinc-400 max-w-sm text-left flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <b>Consejo de Privacidad:</b> Tras importar tus fotos o videos a esta bóveda, puedes eliminarlas de la galería normal de tu celular para que nadie más las encuentre.
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
