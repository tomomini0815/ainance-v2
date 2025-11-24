import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Zap, ZapOff, RotateCcw, Check, Camera, Sun, Contrast, RotateCw, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface ReceiptCameraProps {
    onCapture: (blob: Blob) => void;
    onClose: () => void;
}

interface QualityMetrics {
    brightness: number;
    contrast: number;
    sharpness: number;
    hasReceipt: boolean;
}

const ReceiptCamera: React.FC<ReceiptCameraProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
    const [zoom, setZoom] = useState(1);
    const [autoCapture, setAutoCapture] = useState(true);
    const [continuousMode, setContinuousMode] = useState(false);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // 編集モードの状態
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [rotation, setRotation] = useState(0);

    // Initialize camera with advanced settings
    useEffect(() => {
        const startCamera = async () => {
            try {
                const constraints = {
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        focusMode: 'continuous',
                        exposureMode: 'continuous',
                    }
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }

                // フラッシュの設定
                const track = mediaStream.getVideoTracks()[0];
                const capabilities = track.getCapabilities();
                if (capabilities.torch) {
                    applyFlashMode(track, flashMode);
                }
            } catch (err) {
                console.error('Camera error:', err);
                setError('カメラを起動できませんでした。権限を確認してください。');
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
        };
    }, []);

    // Apply flash mode
    const applyFlashMode = async (track: MediaStreamTrack, mode: 'off' | 'on' | 'auto') => {
        try {
            const capabilities = track.getCapabilities() as any;
            if (capabilities.torch) {
                await track.applyConstraints({
                    advanced: [{ torch: mode === 'on' }]
                } as any);
            }
        } catch (err) {
            console.warn('Flash mode not supported:', err);
        }
    };

    // Toggle flash mode
    const toggleFlash = () => {
        const modes: ('off' | 'on' | 'auto')[] = ['off', 'on', 'auto'];
        const currentIndex = modes.indexOf(flashMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        setFlashMode(nextMode);

        if (stream) {
            const track = stream.getVideoTracks()[0];
            applyFlashMode(track, nextMode);
        }
    };

    // Handle zoom
    const handleZoom = (delta: number) => {
        const newZoom = Math.max(1, Math.min(3, zoom + delta));
        setZoom(newZoom);

        if (stream) {
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            if (capabilities.zoom) {
                track.applyConstraints({
                    advanced: [{ zoom: newZoom }]
                } as any);
            }
        }
    };

    // Auto-detect receipt and quality
    useEffect(() => {
        if (!videoRef.current || capturedImage || !autoCapture) return;

        const interval = setInterval(() => {
            analyzeFrame();
        }, 500);

        return () => clearInterval(interval);
    }, [videoRef.current, capturedImage, autoCapture]);

    // Analyze frame quality
    const analyzeFrame = useCallback(() => {
        if (!videoRef.current || !detectionCanvasRef.current) return;

        const video = videoRef.current;
        const canvas = detectionCanvasRef.current;
        canvas.width = 320; // 小さいサイズで高速分析
        canvas.height = 240;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const metrics = calculateQualityMetrics(imageData);
        setQualityMetrics(metrics);

        // 自動撮影の条件：明るさ、コントラスト、シャープネスが十分で、レシートを検出した場合
        if (autoCapture &&
            metrics.brightness > 60 &&
            metrics.brightness < 200 &&
            metrics.contrast > 40 &&
            metrics.sharpness > 30 &&
            metrics.hasReceipt) {
            // 条件を満たしたら自動撮影
            setTimeout(() => capture(), 300);
        }
    }, [autoCapture]);

    // Calculate quality metrics
    const calculateQualityMetrics = (imageData: ImageData): QualityMetrics => {
        const data = imageData.data;
        let totalBrightness = 0;
        let edgeStrength = 0;

        // 明るさとエッジ強度を計算
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;

            // 簡易的なエッジ検出
            if (i > imageData.width * 4 * 4) {
                const prevBrightness = (data[i - imageData.width * 4] +
                    data[i - imageData.width * 4 + 1] +
                    data[i - imageData.width * 4 + 2]) / 3;
                edgeStrength += Math.abs(brightness - prevBrightness);
            }
        }

        const avgBrightness = totalBrightness / (data.length / 4);
        const avgEdgeStrength = edgeStrength / (data.length / 4);

        // コントラストの推定
        let variance = 0;
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            variance += Math.pow(brightness - avgBrightness, 2);
        }
        const contrast = Math.sqrt(variance / (data.length / 4));

        // レシート検出（白い矩形の存在を簡易的に検出）
        const hasReceipt = avgBrightness > 100 && contrast > 40;

        return {
            brightness: avgBrightness,
            contrast: contrast,
            sharpness: avgEdgeStrength,
            hasReceipt: hasReceipt
        };
    };

    // Capture photo with quality check
    const capture = useCallback(() => {
        if (videoRef.current && canvasRef.current && !isCapturing) {
            setIsCapturing(true);
            setIsAnalyzing(true);

            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

                // 振動フィードバック
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }

                setTimeout(() => {
                    setCapturedImage(dataUrl);
                    if (continuousMode) {
                        setCapturedImages(prev => [...prev, dataUrl]);
                    }
                    setIsAnalyzing(false);
                }, 300);
            }
            setIsCapturing(false);
        }
    }, [continuousMode, isCapturing]);

    // Retake photo
    const retake = () => {
        setCapturedImage(null);
        setBrightness(100);
        setContrast(100);
        setRotation(0);
    };

    // Apply image adjustments
    const applyAdjustments = (imageUrl: string): string => {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = imageUrl;

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return imageUrl;

        // 回転を適用
        if (rotation !== 0) {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.drawImage(img, 0, 0);

        return canvas.toDataURL('image/jpeg', 0.95);
    };

    // Confirm photo
    const confirm = () => {
        if (capturedImage) {
            const adjustedImage = applyAdjustments(capturedImage);
            fetch(adjustedImage)
                .then(res => res.blob())
                .then(blob => onCapture(blob));
        }
    };

    // Handle tap to focus
    const handleTapFocus = async (e: React.TouchEvent | React.MouseEvent) => {
        if (!stream || capturedImage) return;

        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;

        if (capabilities.focusMode && capabilities.focusMode.includes('manual')) {
            try {
                await track.applyConstraints({
                    advanced: [{ focusMode: 'manual' }]
                } as any);
            } catch (err) {
                console.warn('Manual focus not supported:', err);
            }
        }
    };

    // Get quality indicator
    const getQualityIndicator = () => {
        if (!qualityMetrics) return null;

        const { brightness: b, contrast: c, sharpness: s, hasReceipt } = qualityMetrics;

        if (b < 40 || b > 220) {
            return { icon: AlertTriangle, text: '明るさが不適切です', color: 'text-yellow-400' };
        }
        if (c < 30) {
            return { icon: AlertTriangle, text: 'コントラストが低いです', color: 'text-yellow-400' };
        }
        if (s < 20) {
            return { icon: AlertTriangle, text: 'ピントが合っていません', color: 'text-yellow-400' };
        }
        if (!hasReceipt) {
            return { icon: Camera, text: 'レシートを検出中...', color: 'text-blue-400' };
        }

        return { icon: CheckCircle2, text: '撮影準備完了！', color: 'text-green-400' };
    };

    if (error) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white p-4">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <p className="mb-4 text-lg">{error}</p>
                    <button onClick={onClose} className="px-6 py-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        閉じる
                    </button>
                </div>
            </div>
        );
    }

    const qualityIndicator = getQualityIndicator();

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/70 to-transparent">
                <button onClick={onClose} className="p-3 text-white/90 hover:text-white rounded-full bg-black/30 backdrop-blur-md transition-all hover:bg-black/50">
                    <X size={24} />
                </button>

                {!capturedImage && (
                    <div className="flex gap-2">
                        {/* Auto Capture Toggle */}
                        <button
                            onClick={() => setAutoCapture(!autoCapture)}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all backdrop-blur-md ${autoCapture
                                ? 'bg-primary/80 text-white'
                                : 'bg-black/30 text-white/70'
                                }`}
                        >
                            自動撮影: {autoCapture ? 'ON' : 'OFF'}
                        </button>

                        {/* Flash Control */}
                        <button
                            onClick={toggleFlash}
                            className="p-3 text-white/90 hover:text-white rounded-full bg-black/30 backdrop-blur-md transition-all hover:bg-black/50"
                        >
                            {flashMode === 'on' ? <Zap size={20} className="text-yellow-400" /> :
                                flashMode === 'off' ? <ZapOff size={20} /> :
                                    <Zap size={20} className="text-blue-400" />}
                        </button>
                    </div>
                )}
            </div>

            {/* Main View */}
            <div className="flex-1 relative overflow-hidden bg-black">
                {capturedImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="max-w-full max-h-full object-contain"
                            style={{
                                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                                transform: `rotate(${rotation}deg)`
                            }}
                        />

                        {/* Edit Controls Overlay */}
                        <div className="absolute bottom-24 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="max-w-md mx-auto space-y-4">
                                {/* Brightness */}
                                <div className="flex items-center gap-3">
                                    <Sun size={20} className="text-white" />
                                    <input
                                        type="range"
                                        min="50"
                                        max="150"
                                        value={brightness}
                                        onChange={(e) => setBrightness(Number(e.target.value))}
                                        className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-white text-sm w-12">{brightness}%</span>
                                </div>

                                {/* Contrast */}
                                <div className="flex items-center gap-3">
                                    <Contrast size={20} className="text-white" />
                                    <input
                                        type="range"
                                        min="50"
                                        max="150"
                                        value={contrast}
                                        onChange={(e) => setContrast(Number(e.target.value))}
                                        className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-white text-sm w-12">{contrast}%</span>
                                </div>

                                {/* Rotation */}
                                <div className="flex items-center gap-3 justify-center">
                                    <button
                                        onClick={() => setRotation((rotation - 90) % 360)}
                                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                    >
                                        <RotateCcw size={20} className="text-white" />
                                    </button>
                                    <span className="text-white text-sm">{rotation}°</span>
                                    <button
                                        onClick={() => setRotation((rotation + 90) % 360)}
                                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                    >
                                        <RotateCw size={20} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            onClick={handleTapFocus}
                            onTouchStart={handleTapFocus}
                        />

                        {/* Guide Overlay with Edge Detection - 縦長レシート用 */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* 縦長のレシート撮影ガイド（3:4のアスペクト比） */}
                            <div className="relative" style={{ width: '75%', paddingBottom: '100%' }}>
                                <div className="absolute inset-0 border-4 border-primary/60 rounded-lg shadow-2xl" style={{
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
                                }}>
                                    {/* Enhanced Corner Markers */}
                                    <div className="absolute -top-1 -left-1 w-16 h-16 border-t-[6px] border-l-[6px] border-primary rounded-tl-xl shadow-lg shadow-primary/50" />
                                    <div className="absolute -top-1 -right-1 w-16 h-16 border-t-[6px] border-r-[6px] border-primary rounded-tr-xl shadow-lg shadow-primary/50" />
                                    <div className="absolute -bottom-1 -left-1 w-16 h-16 border-b-[6px] border-l-[6px] border-primary rounded-bl-xl shadow-lg shadow-primary/50" />
                                    <div className="absolute -bottom-1 -right-1 w-16 h-16 border-b-[6px] border-r-[6px] border-primary rounded-br-xl shadow-lg shadow-primary/50" />

                                    {/* Center Lines */}
                                    <div className="absolute top-1/2 left-4 right-4 h-px bg-primary/40" />
                                    <div className="absolute left-1/2 top-4 bottom-4 w-px bg-primary/40" />

                                    {/* Quality Indicator */}
                                    {qualityIndicator && (
                                        <div className="absolute top-4 left-0 right-0 flex justify-center">
                                            <div className="px-4 py-2 bg-black/70 backdrop-blur-md rounded-full flex items-center gap-2">
                                                <qualityIndicator.icon size={16} className={qualityIndicator.color} />
                                                <span className={`text-xs font-medium ${qualityIndicator.color}`}>
                                                    {qualityIndicator.text}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Analyzing Indicator */}
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-black/70 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center gap-3">
                                                <Loader2 size={32} className="text-primary animate-spin" />
                                                <span className="text-white text-sm">画像を解析中...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hint Text */}
                                    <div className="absolute -bottom-16 left-0 right-0 text-center">
                                        <p className="text-white/90 text-sm font-medium drop-shadow-lg mb-2">
                                            レシートを枠内に合わせてください
                                        </p>
                                        <p className="text-white/70 text-xs drop-shadow-lg">
                                            タップしてフォーカス調整
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <canvas ref={canvasRef} className="hidden" />
                <canvas ref={detectionCanvasRef} className="hidden" />
            </div>

            {/* Footer Controls */}
            <div className="p-6 bg-black flex justify-center items-center gap-8 pb-safe">
                {capturedImage ? (
                    <>
                        <button
                            onClick={retake}
                            className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors active:scale-95"
                        >
                            <div className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                <RotateCcw size={24} />
                            </div>
                            <span className="text-xs font-medium">撮り直す</span>
                        </button>

                        <button
                            onClick={confirm}
                            className="flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-all active:scale-95"
                        >
                            <div className="p-5 rounded-full bg-primary/20 border-4 border-primary shadow-lg shadow-primary/30 hover:shadow-primary/50">
                                <Check size={36} />
                            </div>
                            <span className="text-xs font-bold">この画像を使用</span>
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={capture}
                            disabled={isCapturing}
                            className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-all disabled:opacity-50 shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-full bg-white group-hover:bg-gray-200 transition-colors" />
                            {isCapturing && (
                                <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                            )}
                        </button>

                        {autoCapture && qualityMetrics?.hasReceipt && (
                            <div className="text-center">
                                <p className="text-green-400 text-xs font-medium animate-pulse">
                                    自動撮影待機中...
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceiptCamera;
