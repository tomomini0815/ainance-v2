import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    Download,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowLeft,
    Trash2,
    RefreshCw,
    FileSpreadsheet,
    ArrowRight,
} from 'lucide-react';
import {
    importCSVFile,
    downloadCSVTemplate,
    CSVRow,
    ImportResult,
    DEFAULT_COLUMN_MAPPING,
    convertToTransactions,
} from '../services/csvImportService';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';

type ImportStep = 'upload' | 'preview' | 'result';

const CSVImportPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<ImportStep>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [previewData, setPreviewData] = useState<CSVRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    // データ取得（エクスポート用）
    const { user } = useAuth();
    const { transactions } = useTransactions(user?.id);

    // CSVエクスポート機能
    const handleExport = useCallback(() => {
        if (!transactions || transactions.length === 0) {
            alert('エクスポートするデータがありません');
            return;
        }

        const headers = ['日付', '説明', '金額', 'カテゴリ', 'タイプ', 'ステータス'];
        const rows = transactions.map(t => [
            t.date,
            `"${t.description || t.item}"`,
            t.amount.toString(),
            `"${t.category}"`,
            t.type,
            t.approval_status || 'approved'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `取引データ_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [transactions]);

    // ファイルアップロード処理
    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setError(null);
        setFile(selectedFile);

        // ファイル形式チェック
        if (!selectedFile.name.endsWith('.csv')) {
            setError('CSVファイルのみアップロード可能です');
            return;
        }

        // ファイルサイズチェック（10MB以下）
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('ファイルサイズは10MB以下にしてください');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await importCSVFile(selectedFile, DEFAULT_COLUMN_MAPPING);
            setImportResult(result);
            setPreviewData(result.importedData);
            setStep('preview');
        } catch (err) {
            setError('ファイルの読み込みに失敗しました');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    // ドラッグ＆ドロップ処理
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    // ファイル選択ダイアログ
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    // インポート実行
    const handleImport = useCallback(async () => {
        if (!importResult || previewData.length === 0) return;

        setIsProcessing(true);
        try {
            // 取引データに変換
            const transactions = convertToTransactions(previewData);

            // ここで実際のデータベースに保存する処理を追加
            // 現時点ではローカルストレージに保存するデモ
            const existingData = localStorage.getItem('ainance_transactions');
            const existing = existingData ? JSON.parse(existingData) : [];
            const merged = [...existing, ...transactions];
            localStorage.setItem('ainance_transactions', JSON.stringify(merged));

            setStep('result');
        } catch (err) {
            setError('インポートに失敗しました');
        } finally {
            setIsProcessing(false);
        }
    }, [importResult, previewData]);

    // リセット
    const handleReset = useCallback(() => {
        setStep('upload');
        setFile(null);
        setImportResult(null);
        setPreviewData([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // プレビューから行を削除
    const handleRemoveRow = useCallback((index: number) => {
        setPreviewData(prev => prev.filter((_, i) => i !== index));
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="mr-4 p-2 hover:bg-surface rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-text-muted" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">CSVインポート・エクスポート</h1>
                            <p className="text-text-muted text-sm mt-1">
                                取引データのCSV入出力管理
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            <span>CSVエクスポート</span>
                        </button>
                        <button
                            onClick={() => downloadCSVTemplate()}
                            className="flex items-center px-4 py-2 bg-surface border border-border rounded-lg hover:bg-border/50 transition-colors"
                        >
                            <FileText className="w-5 h-5 mr-2 text-text-muted" />
                            <span className="text-text-main">テンプレート</span>
                        </button>
                    </div>
                </div>

                {/* ステッププログレス */}
                <div className="flex items-center justify-center mb-8">
                    {['upload', 'preview', 'result'].map((s, index) => (
                        <React.Fragment key={s}>
                            <div className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step === s
                                        ? 'bg-primary text-white'
                                        : index < ['upload', 'preview', 'result'].indexOf(step)
                                            ? 'bg-green-500 text-white'
                                            : 'bg-surface text-text-muted border border-border'
                                        }`}
                                >
                                    {index < ['upload', 'preview', 'result'].indexOf(step) ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className="ml-2 text-sm text-text-muted hidden sm:inline">
                                    {s === 'upload' && 'ファイル選択'}
                                    {s === 'preview' && 'プレビュー確認'}
                                    {s === 'result' && '完了'}
                                </span>
                            </div>
                            {index < 2 && (
                                <div className="w-16 sm:w-24 h-0.5 mx-2 bg-border" />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* メインコンテンツ */}
                <AnimatePresence mode="wait">
                    {/* ステップ1: ファイルアップロード */}
                    {step === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* ドロップゾーン */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 bg-surface'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDragging ? 'bg-primary/20' : 'bg-surface'
                                        }`}>
                                        <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-text-muted'}`} />
                                    </div>
                                    <p className="text-lg font-medium text-text-main mb-2">
                                        {isDragging ? 'ここにドロップ' : 'CSVファイルをドラッグ＆ドロップ'}
                                    </p>
                                    <p className="text-text-muted text-sm mb-4">
                                        または<span className="text-primary mx-1">クリック</span>してファイルを選択
                                    </p>
                                    <p className="text-text-muted text-xs">
                                        対応形式: CSV（UTF-8）、最大10MB
                                    </p>
                                </div>
                            </div>

                            {/* エラー表示 */}
                            {error && (
                                <div className="flex items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <XCircle className="w-5 h-5 text-red-500 mr-3" />
                                    <span className="text-red-500">{error}</span>
                                </div>
                            )}

                            {/* 処理中表示 */}
                            {isProcessing && (
                                <div className="flex items-center justify-center p-8">
                                    <RefreshCw className="w-8 h-8 text-primary animate-spin mr-4" />
                                    <span className="text-text-main">ファイルを解析中...</span>
                                </div>
                            )}

                            {/* 使い方ガイド */}
                            <div className="bg-surface rounded-xl border border-border p-6">
                                <h3 className="font-bold text-text-main mb-4 flex items-center">
                                    <FileSpreadsheet className="w-5 h-5 mr-2 text-primary" />
                                    CSVファイルの形式について
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-text-main mb-2">必須カラム</h4>
                                        <ul className="text-text-muted text-sm space-y-1">
                                            <li>• <strong>日付</strong>: YYYY/MM/DD または YYYY-MM-DD</li>
                                            <li>• <strong>摘要</strong>: 取引の説明</li>
                                            <li>• <strong>金額</strong>: 数値（カンマ区切り可）</li>
                                            <li>• <strong>種別</strong>: 収入 or 支出</li>
                                            <li>• <strong>勘定科目</strong>: 経費カテゴリ</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-text-main mb-2">オプションカラム</h4>
                                        <ul className="text-text-muted text-sm space-y-1">
                                            <li>• <strong>メモ</strong>: 補足情報</li>
                                            <li>• <strong>取引先</strong>: 取引先名</li>
                                        </ul>
                                        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                                            <p className="text-blue-400 text-sm">
                                                💡 テンプレートをダウンロードすると、正しい形式がわかります
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ステップ2: プレビュー */}
                    {step === 'preview' && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* サマリー */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-surface rounded-xl border border-border p-4">
                                    <p className="text-text-muted text-sm mb-1">総行数</p>
                                    <p className="text-2xl font-bold text-text-main">{importResult?.totalRows || 0}</p>
                                </div>
                                <div className="bg-surface rounded-xl border border-border p-4">
                                    <p className="text-text-muted text-sm mb-1">成功</p>
                                    <p className="text-2xl font-bold text-green-500">{previewData.length}</p>
                                </div>
                                <div className="bg-surface rounded-xl border border-border p-4">
                                    <p className="text-text-muted text-sm mb-1">エラー</p>
                                    <p className="text-2xl font-bold text-red-500">{importResult?.errorCount || 0}</p>
                                </div>
                                <div className="bg-surface rounded-xl border border-border p-4">
                                    <p className="text-text-muted text-sm mb-1">ファイル</p>
                                    <p className="text-sm font-medium text-text-main truncate">{file?.name}</p>
                                </div>
                            </div>

                            {/* エラー一覧 */}
                            {importResult && importResult.errors.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <h3 className="font-bold text-red-400 mb-3 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        バリデーションエラー ({importResult.errors.length}件)
                                    </h3>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {importResult.errors.slice(0, 10).map((err, index) => (
                                            <p key={index} className="text-red-300 text-sm">
                                                行 {err.row}: {err.message}
                                            </p>
                                        ))}
                                        {importResult.errors.length > 10 && (
                                            <p className="text-red-400 text-sm">
                                                他 {importResult.errors.length - 10} 件のエラー...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* プレビューテーブル */}
                            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                                <div className="p-4 border-b border-border flex justify-between items-center">
                                    <h3 className="font-bold text-text-main">
                                        インポートデータのプレビュー
                                    </h3>
                                    <span className="text-text-muted text-sm">
                                        {previewData.length}件のデータ
                                    </span>
                                </div>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="w-full text-sm">
                                        <thead className="bg-background sticky top-0">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-text-muted font-medium">日付</th>
                                                <th className="text-left px-4 py-3 text-text-muted font-medium">摘要</th>
                                                <th className="text-right px-4 py-3 text-text-muted font-medium">金額</th>
                                                <th className="text-center px-4 py-3 text-text-muted font-medium">種別</th>
                                                <th className="text-left px-4 py-3 text-text-muted font-medium">勘定科目</th>
                                                <th className="text-center px-4 py-3 text-text-muted font-medium">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {previewData.slice(0, 50).map((row, index) => (
                                                <tr key={index} className="hover:bg-background/50">
                                                    <td className="px-4 py-3 text-text-main">{row.date}</td>
                                                    <td className="px-4 py-3 text-text-main max-w-xs truncate">{row.description}</td>
                                                    <td className="px-4 py-3 text-right font-mono">
                                                        <span className="text-white">
                                                            {row.type === 'income' ? '+' : '-'}¥{row.amount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${row.type === 'income'
                                                            ? 'bg-green-500/10 text-green-500'
                                                            : 'bg-red-500/10 text-red-500'
                                                            }`}>
                                                            {row.type === 'income' ? '収入' : '支出'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-text-main">{row.category}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleRemoveRow(index)}
                                                            className="p-1 hover:bg-red-500/10 rounded text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {previewData.length > 50 && (
                                        <div className="p-4 text-center text-text-muted text-sm">
                                            他 {previewData.length - 50} 件のデータがあります...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* アクションボタン */}
                            <div className="flex justify-between">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center px-6 py-3 bg-surface border border-border rounded-xl hover:bg-border/50 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    やり直す
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={previewData.length === 0 || isProcessing}
                                    className="flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            インポート中...
                                        </>
                                    ) : (
                                        <>
                                            インポート実行
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ステップ3: 完了 */}
                    {step === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-12"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-main mb-4">
                                インポート完了
                            </h2>
                            <p className="text-text-muted mb-8">
                                {previewData.length}件の取引データを正常にインポートしました
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center px-6 py-3 bg-surface border border-border rounded-xl hover:bg-border/50 transition-colors"
                                >
                                    <Upload className="w-5 h-5 mr-2" />
                                    別のファイルをインポート
                                </button>
                                <button
                                    onClick={() => navigate('/transaction-history')}
                                    className="flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    取引履歴を確認
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default CSVImportPage;
