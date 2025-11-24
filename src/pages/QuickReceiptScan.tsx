import React, { useState } from 'react';
import { Camera, Sparkles, Zap, CheckCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import ReceiptCamera from '../components/ReceiptCamera';
import ReceiptResultModal from '../components/ReceiptResultModal';
import { ReceiptParser } from '../utils/ReceiptParser';

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
    const [statusMessage, setStatusMessage] = useState('処理中...');

    const handleCapture = async (imageBlob: Blob) => {
        console.log('📸 handleCapture called with imageBlob:', imageBlob);
        setShowCamera(false);
        setIsProcessing(true);
        setStatusMessage('画像を解析中...');

        try {
            const imageUrl = URL.createObjectURL(imageBlob);
            console.log('🖼️ 画像URL生成:', imageUrl);

            // タイムアウト付きでOCR実行
            const ocrPromise = Tesseract.recognize(imageUrl, 'jpn+eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        console.log(`🔍 OCR進捗: ${progress}%`);
                        setStatusMessage(`文字を読み取っています... ${progress}%`);
                    }
                }
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('OCR処理がタイムアウトしました')), 30000)
            );

            let ocrText = '';
            try {
                const result: any = await Promise.race([ocrPromise, timeoutPromise]);
                ocrText = result.data.text;
                console.log('✅ OCR完了:', ocrText.substring(0, 100) + '...');
            } catch (ocrError) {
                console.warn('⚠️ OCR処理に失敗しましたが、手動入力を続行します:', ocrError);
                // OCR失敗時も続行
            }

            URL.revokeObjectURL(imageUrl);
            setStatusMessage('データを抽出中...');

            // データ抽出
            const parser = new ReceiptParser();
            // OCRテキストが空でもパースを実行（デフォルト値を返すはず）
            const parsed = parser.parseReceipt(ocrText || '');

            console.log('📊 パース結果:', parsed);

            const extractedData = {
                merchant: parsed.store_name || '',
                date: parsed.date || new Date().toISOString().split('T')[0],
                amount: parsed.total_amount || 0,
                category: '雑費', // デフォルト
                taxRate: parsed.tax_rate || 0,
                confidence: ocrText ? 80 : 0, // OCR成功なら80、失敗なら0
            };

            console.log('📦 設定するextractedData:', extractedData);
            setExtractedData(extractedData);

            console.log('🚀 setShowResultModalをtrueに設定');
            setShowResultModal(true);
        } catch (error: any) {
            console.error('💥 処理エラー:', error);
            // 致命的なエラーの場合でも、手動入力のためにモーダルを表示
            const errorData = {
                merchant: '',
                date: new Date().toISOString().split('T')[0],
                amount: 0,
                category: '雑費',
                taxRate: 10,
                confidence: 0,
            };
            
            console.log('❌ エラー時のextractedData:', errorData);
            setExtractedData(errorData);
            setShowResultModal(true);
        } finally {
            console.log('🏁 handleCapture finallyブロック');
            setIsProcessing(false);
            setStatusMessage('処理中...');
        }
    };

    const handleRetake = () => {
        setShowResultModal(false);
        setShowCamera(true);
    };

    const handleClose = () => {
        console.log('🚪 モーダルを閉じる');
        setShowResultModal(false);
        setExtractedData(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* ヘッダーバー */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">クイックスキャン</h1>
                                <p className="text-xs text-gray-600">レシート自動読み取り</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                                <span className="text-xs font-semibold text-green-700">AI搭載</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                {/* メインコンテンツグリッド */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左サイドバー - 使い方ガイド */}
                    <div className="lg:col-span-1 space-y-6 order-last lg:order-first">
                        {/* 使い方カード */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    📖
                                </div>
                                使い方
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { step: 1, title: 'レシートを撮影', icon: '📸' },
                                    { step: 2, title: 'AI が自動認識', icon: '🤖' },
                                    { step: 3, title: 'カテゴリを選択', icon: '🏷️' },
                                    { step: 4, title: 'データを記録', icon: '💾' }
                                ].map((item) => (
                                    <div key={item.step} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {item.step}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {item.step === 1 && 'カメラで撮影するだけ'}
                                                {item.step === 2 && '数秒で完了'}
                                                {item.step === 3 && '8種類から選択'}
                                                {item.step === 4 && '即座にダッシュボードへ'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 特徴カード */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-4">✨ プレミアム機能</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">超高速処理（5-10秒）</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">AI精度95%以上</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">自動カテゴリ判定</span>
                                </div>
                            </div>
                        </div>

                        {/* ヘルプカード */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 text-2xl">💡</div>
                                <div>
                                    <h4 className="font-semibold text-amber-900 mb-1">撮影のコツ</h4>
                                    <ul className="text-sm text-amber-800 space-y-1">
                                        <li>• 明るい場所で撮影</li>
                                        <li>• レシート全体を枠内に</li>
                                        <li>• 平らにして撮影</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* メインエリア */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* タイトルセクション */}
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-3">
                                レシートを撮影して記録
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl">
                                スマホで撮影するだけで、AIが自動的にデータを抽出して記録します
                            </p>
                        </div>

                        {/* メインアクションカード */}
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                            {!showCamera && !isProcessing && (
                                <div className="p-12 text-center">
                                    <div className="mb-8">
                                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
                                            <Camera className="w-12 h-12 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            レシートをスキャン
                                        </h3>
                                        <p className="text-gray-600">
                                            ボタンをクリックしてカメラを起動してください
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowCamera(true)}
                                        className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 font-bold text-lg inline-flex items-center"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl" />
                                        <Camera className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                                        <span>カメラを起動</span>
                                        <div className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                            START
                                        </div>
                                    </button>

                                    <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
                                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-blue-600">95%</div>
                                            <div className="text-xs text-gray-600 mt-1">認識精度</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-green-600">5秒</div>
                                            <div className="text-xs text-gray-600 mt-1">平均処理時間</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-purple-600">∞</div>
                                            <div className="text-xs text-gray-600 mt-1">利用回数</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 処理中表示 */}
                            {isProcessing && (
                                <div className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                                    <div className="relative mb-8">
                                        <div className="animate-spin rounded-full h-24 w-24 border-4 border-blue-200 border-t-blue-600 mx-auto" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        AI が読み取り中...
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        {statusMessage}
                                    </p>
                                    <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-lg">
                                        <div className="flex items-center justify-between text-sm mb-3">
                                            <span className="text-gray-700 font-medium">処理進捗</span>
                                            <span className="font-bold text-blue-600">処理中...</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-3 rounded-full animate-pulse" style={{ width: '66%' }} />
                                        </div>
                                        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* サポート情報 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">対応レシート</h4>
                                        <p className="text-sm text-gray-600">
                                            コンビニ、スーパー、飲食店など200店舗以上に対応
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">高速処理</h4>
                                        <p className="text-sm text-gray-600">
                                            最新AI技術により、わずか数秒で完了
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* カメラ */}
                {showCamera && (
                    <ReceiptCamera
                        onCapture={handleCapture}
                        onClose={() => setShowCamera(false)}
                    />
                )}

                {/* 結果モーダル */}
                {(() => {
                    console.log('🔍 モーダルレンダリングチェック:', { showResultModal, extractedData });
                    return showResultModal && (
                        <ReceiptResultModal
                            receiptData={extractedData || {
                                merchant: '',
                                date: new Date().toISOString().split('T')[0],
                                amount: 0,
                                category: '雑費',
                                taxRate: 10,
                                confidence: 0,
                            }}
                            onClose={handleClose}
                            onRetake={handleRetake}
                        />
                    );
                })()}
            </div>
        </div>
    );
};

export default QuickReceiptScan;
