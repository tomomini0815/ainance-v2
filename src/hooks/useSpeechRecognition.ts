import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionProps {
    onResult?: (transcript: string) => void;
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
}

export const useSpeechRecognition = ({
    onResult,
    lang = 'ja-JP',
    continuous = true,
    interimResults = true
}: UseSpeechRecognitionProps = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check for browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('このブラウザは音声認識をサポートしていません。最新のChromeまたはEdgeをご利用ください。');
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = lang;
            recognition.continuous = continuous;
            recognition.interimResults = interimResults;
            // Android quirk: maxAlternatives might help with stability
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    // Remove punctuation
                    finalTranscript = finalTranscript.replace(/[、。]/g, '');
                    // Append to local state
                    setTranscript((prev) => prev + finalTranscript + ' ');
                    // Callback if provided
                    if (onResult) {
                        onResult(finalTranscript);
                    }
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);

                // Android often throws 'no-speech' if silence. We might want to just stop listening or ignore.
                if (event.error === 'no-speech') {
                    // Don't show visible error for no-speech, just stop or let it retry if needed.
                    // Usually on mobile, it's better to stop and let user press button again to save battery/ux.
                    setError(null);
                } else if (event.error === 'not-allowed') {
                    setError('マイクの使用が許可されていません。設定を確認してください。');
                } else if (event.error === 'network') {
                    setError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
                } else {
                    // Other errors
                    setError(`エラーが発生しました: ${event.error}`);
                }

                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                // If continuous is true, some implementations might auto-restart, 
                // but robust implementation usually relies on user restart or manual loop.
                // For mobile battery/stability, we'll respect the stop.
            };

            recognitionRef.current = recognition;
        } catch (e) {
            console.error('Speech recognition initialization failed', e);
            setIsSupported(false);
            setError('音声認識の初期化に失敗しました。');
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { /* ignore */ }
            }
        };
    }, [lang, continuous, interimResults]); // Dependencies

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            // Clear old error
            setError(null);
            recognitionRef.current.start();
        } catch (e) {
            // If already started, it might throw
            console.warn('Recognition start failed/already started', e);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.stop();
        } catch (e) { /* ignore */ }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        setTranscript, // Allow manual edits/clearing
        error,
        startListening,
        stopListening,
        isSupported,
        resetTranscript
    };
};
