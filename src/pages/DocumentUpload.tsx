import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, File, X, Eye } from 'lucide-react';

const DocumentUpload: React.FC = () => {
  const location = useLocation();
  const { document } = location.state || {};

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ダミーデータ
  const documentDetails = {
    id: document?.id || 1,
    name: document?.name || '確定申告書A',
    type: document?.type || 'individual',
    year: '2024'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('アップロードするファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // シミュレートされたアップロード処理
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // アップロード処理のシミュレーション
    setTimeout(() => {
      clearInterval(interval);
      setIsUploading(false);

      // アップロードされたファイルの情報を保存
      const newUploadedFiles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      }));

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      setFiles([]);

      alert('ファイルが正常にアップロードされました。');
    }, 2500);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/tax-filing-support" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <h1 className="text-2xl font-bold text-text-main">{documentDetails.name} アップロード</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
              <h2 className="text-lg font-medium text-text-main mb-4">ファイルアップロード</h2>

              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-text-muted" />
                <div className="mt-4">
                  <p className="text-lg font-medium text-text-main">ファイルをドラッグ＆ドロップ</p>
                  <p className="text-sm text-text-muted mt-2">またはクリックしてファイルを選択</p>
                  <p className="text-xs text-text-muted mt-1">PDF、JPG、PNG形式に対応（最大10MB）</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-text-main mb-3">選択されたファイル</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-surface-highlight rounded-md">
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-text-muted mr-2" />
                          <div>
                            <p className="text-sm font-medium text-text-main">{file.name}</p>
                            <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-text-muted hover:text-text-main"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-text-main mb-3">アップロード中...</h3>
                  <div className="w-full bg-surface-highlight rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-text-muted mt-2 text-center">{uploadProgress}% 完了</p>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={files.length === 0 || isUploading}
                  className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${files.length === 0 || isUploading
                      ? 'bg-surface-highlight text-text-muted cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90'
                    }`}
                >
                  {isUploading ? 'アップロード中...' : 'ファイルをアップロード'}
                </button>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
                <h2 className="text-lg font-medium text-text-main mb-4">アップロード済みファイル</h2>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-text-muted mr-2" />
                        <div>
                          <p className="text-sm font-medium text-text-main">{file.name}</p>
                          <p className="text-xs text-text-muted">
                            {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-primary hover:text-primary/80 text-sm font-medium">
                        <Eye className="h-4 w-4 inline mr-1" />
                        プレビュー
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
              <h2 className="text-lg font-medium text-text-main mb-4">書類情報</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-text-muted">書類名</dt>
                  <dd className="text-sm text-text-main">{documentDetails.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-text-muted">業態</dt>
                  <dd className="text-sm text-text-main">
                    {documentDetails.type === 'individual' ? '個人事業主' : '法人'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-text-muted">年度</dt>
                  <dd className="text-sm text-text-main">{documentDetails.year}年分</dd>
                </div>
              </dl>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-medium text-text-main mb-4">アップロードガイド</h2>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>書類はスキャンまたは写真でアップロードしてください</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>画像は明るく、文字がはっきりと読めるようにしてください</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>ファイルサイズは10MB以内にしてください</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>PDF形式でのアップロードを推奨します</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>複数ページある場合は1つのPDFにまとめてください</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentUpload;