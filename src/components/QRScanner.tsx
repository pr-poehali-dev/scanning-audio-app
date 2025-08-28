import { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import Icon from '@/components/ui/icon';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const QRScanner = ({ onScan, onClose, isOpen }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // задняя камера
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Ошибка доступа к камере:', err);
      setError('Не удалось получить доступ к камере. Проверьте разрешения.');
      setIsScanning(false);
    }
  }, []);

  const scanQR = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !isScanning) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('QR код найден:', code.data);
        onScan(code.data);
        stopCamera();
        onClose();
        return;
      }
    }
    
    animationRef.current = requestAnimationFrame(scanQR);
  }, [isScanning, onScan, onClose, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return stopCamera;
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      videoRef.current.addEventListener('loadeddata', scanQR);
      scanQR();
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', scanQR);
      }
    };
  }, [isScanning, scanQR]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-2xl max-h-[80vh] bg-black rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
          <div className="flex items-center justify-between text-white">
            <h3 className="text-lg font-medium">Сканирование QR-кода</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Canvas (hidden) */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64">
            {/* Scanning frame */}
            <div className="absolute inset-0 border-2 border-white opacity-50 rounded-lg" />
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-purple-500" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-purple-500" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-purple-500" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-purple-500" />
            
            {/* Scanning line */}
            {isScanning && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 animate-pulse opacity-80" />
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white p-4">
            <div className="flex items-center gap-2">
              <Icon name="AlertCircle" size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 text-white text-center">
          <p className="text-sm">
            {isScanning 
              ? 'Наведите камеру на QR-код' 
              : 'Подготовка камеры...'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;