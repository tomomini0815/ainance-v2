import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Zap, ZapOff, RotateCcw, Check } from 'lucide-react';

interface ReceiptCameraProps {
    onCapture: (blob: Blob) => void;
    onClose: () => void;
}

const ReceiptCamera: React.FC<ReceiptCameraProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const constraints = {
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error('Camera error:', err);
                setError('カメラを起動できませんでした。権限を確認してください。');
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Capture photo
    const capture = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            setIsCapturing(true);
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setCapturedImage(dataUrl);
            }
            setIsCapturing(false);
        }
    }, []);

    // Retake photo
    const retake = () => {
        setCapturedImage(null);
    };

    // Confirm photo
    const confirm = () => {
        if (capturedImage) {
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => onCapture(blob));
        }
    };

    if (error) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white p-4">
                <div className="text-center">
                    <p className="mb-4">{error}</p>
                    <button onClick={onClose} className="px-4 py-2 bg-white/20 rounded-full">
                        閉じる
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-full bg-black/20 backdrop-blur-md">
                    <X size={24} />
                </button>
            </div>

            {/* Main View */}
            <div className="flex-1 relative overflow-hidden bg-black">
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {/* Guide Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 border-[40px] border-black/50">
                                <div className="w-full h-full border-2 border-white/30 relative">
                                    {/* Corner Markers */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

                                    {/* Center Line */}
                                    <div className="absolute top-1/2 left-4 right-4 h-px bg-white/20" />

                                    {/* Hint Text */}
                                    <div className="absolute bottom-8 left-0 right-0 text-center text-white/80 text-sm font-medium drop-shadow-md">
                                        レシートを枠内に合わせてください
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Footer Controls */}
            <div className="p-8 bg-black flex justify-center items-center gap-12 pb-12">
                {capturedImage ? (
                    <>
                        <button onClick={retake} className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors">
                            <div className="p-4 rounded-full bg-white/10">
                                <RotateCcw size={24} />
                            </div>
                            <span className="text-xs">撮り直す</span>
                        </button>
                        <button onClick={confirm} className="flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                            <div className="p-4 rounded-full bg-primary/20 border-2 border-primary">
                                <Check size={32} />
                            </div>
                            <span className="text-xs font-bold">これを使う</span>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={capture}
                        disabled={isCapturing}
                        className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
                    >
                        <div className="w-16 h-16 rounded-full bg-white group-hover:bg-gray-200 transition-colors" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReceiptCamera;
