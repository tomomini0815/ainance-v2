import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import ReceiptCamera from '../components/ReceiptCamera';
import ReceiptResultModal from '../components/ReceiptResultModal';

interface ExtractedReceiptData {
    merchant: string;
    date: string;
    amount: number;
    category: string;
    taxRate: number;
    confidence: number;
}

const QuickReceiptScan: React.FC = () => {
    const [showCamera, setShowCamera] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCapture = async (imageBlob: Blob) => {
        setShowCamera(false);
        setIsProcessing(true);

        try {
            // Tesseract.jsを使用してOCR処理
            const Tesseract = await import('tesseract.js');
            const imageUrl = URL.createObjectURL(imageBlob);

            const result = await Tesseract.recognize(imageUrl, 'jpn+eng');
            URL.revokeObjectURL(imageUrl);

            console.log('OCR結果:', result.data.text);

            // 簡易データ抽出（実際のReceiptParserを使用）
            const { ReceiptParser } = await import('../utils/ReceiptParser');
            const parser = new ReceiptParser();
            const parsed = parser.parse(result.data.text);

            setExtractedData({
                merchant: parsed.merchant || '不明',
                date: parsed.date || new Date().toISOString().split('T')[0],
                amount: parsed.totalAmount || 0,
                category: '雑費',
                taxRate: parsed.taxRate || 0,
                confidence: 80,
            });

            setShowResultModal(true);
        } catch (error) {
            console.error('OCR処理エラー:', error);
            alert('レシートの読み取りに失敗しました');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRetake = () => {
        setShowResultModal(false);
        setShowCamera(true);
    };

    const handleClose = () => {
        setShowResultModal(false);
        setExtractedData(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        📸 クイックレシートスキャン
                    </h1>
                    <p className="text-gray-600">
                        レシートを撮影して、すぐに記録できます
                    </p>
                </div>

                {/* メインボタン */}
                {!showCamera && !isProcessing && (
                    <div className="text-center">
                        <button
                            onClick={() => setShowCamera(true)}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg flex items-center mx-auto"
                        >
                            <Camera className="w-6 h-6 mr-2" />
                            レシートを撮影
                        </button>
                    </div>
                )}

                {/* 処理中表示 */}
                {isProcessing && (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700">レシートを読み取り中...</p>
                    </div>
                )}

                {/* カメラ */}
                {showCamera && (
                    <ReceiptCamera
                        onCapture={handleCapture}
                        onClose={() => setShowCamera(false)}
                    />
                )}

                {/* 結果モーダル */}
                {showResultModal && extractedData && (
                    <ReceiptResultModal
                        receiptData={extractedData}
                        onClose={handleClose}
                        onRetake={handleRetake}
                    />
                )}
            </div>
        </div>
    );
};

export default QuickReceiptScan;
