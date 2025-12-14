import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Calculator, BookOpen, CheckCircle, Download, Plus, Edit3, Save, Trash2, Upload, Send, Eye, Printer, Share2 } from 'lucide-react';

interface BusinessType {
  _id: string;
  business_type: 'individual' | 'corporation';
  company_name: string;
}

interface TaxDocument {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'not_started' | 'in_progress' | 'completed';
  required: boolean;
  template_url?: string; // テンプレートファイルのURL
  data_imported?: boolean; // データがインポートされたかどうか
  content?: string; // 書類の内容
  versions?: DocumentVersion[]; // バージョン管理
  tags?: string[]; // タグ
  comments?: DocumentComment[]; // コメント
}

interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface DocumentComment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

// 業態別に必要な書類テンプレートを定義
const INDIVIDUAL_TEMPLATES = [
  {
    id: '1',
    title: '確定申告書',
    description: '年次確定申告書（個人事業主用）',
    deadline: '2024-03-15',
    required: true,
    template_url: '/templates/individual/kakutei_shinkoku.pdf'
  },
  {
    id: '2',
    title: '青色申告決算書',
    description: '青色申告専用の決算書類',
    deadline: '2024-03-15',
    required: true,
    template_url: '/templates/individual/seiroku_kessan.pdf'
  },
  {
    id: '3',
    title: '給与所得者の扶養控除等申告書',
    description: '従業員が提出する扶養控除申告書',
    deadline: '2024-01-31',
    required: false,
    template_url: '/templates/individual/fuyou_koujo.pdf'
  }
];

const CORPORATION_TEMPLATES = [
  {
    id: '1',
    title: '法人税申告書',
    description: '法人税申告書（第1号様式）',
    deadline: '2024-03-15',
    required: true,
    template_url: '/templates/corporation/houjinzei_shinkoku.pdf'
  },
  {
    id: '2',
    title: '貸借対照表',
    description: '決算書類（貸借対照表）',
    deadline: '2024-03-15',
    required: true,
    template_url: '/templates/corporation/kashikari_tai.pdf'
  },
  {
    id: '3',
    title: '損益計算書',
    description: '決算書類（損益計算書）',
    deadline: '2024-03-15',
    required: true,
    template_url: '/templates/corporation/sonneki_keisan.pdf'
  },
  {
    id: '4',
    title: '第2会社設立登記申請書',
    description: '第2会社の設立登記申請書',
    deadline: '2024-06-30',
    required: true,
    template_url: '/templates/corporation/dainikai_setsuritsu.pdf'
  }
];

const BusinessConversion: React.FC = () => {
  // ダミーの業態形態データ
  const [currentBusinessType, setCurrentBusinessType] = useState<BusinessType>({
    _id: '1',
    business_type: 'individual', // 'individual' または 'corporation'
    company_name: '個人事業主'
  });

  // 申告書類のダミーデータ
  const [taxDocuments, setTaxDocuments] = useState<TaxDocument[]>(INDIVIDUAL_TEMPLATES.map(template => ({
    ...template,
    status: 'not_started',
    data_imported: false,
    versions: [
      {
        id: '1',
        version: 1,
        content: '初期バージョン',
        createdAt: new Date().toISOString(),
        createdBy: 'ユーザー1'
      }
    ],
    tags: [],
    comments: []
  })));

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<TaxDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // 検索ワード
  const [filterStatus, setFilterStatus] = useState<'all' | TaxDocument['status']>('all'); // ステータスフィルター
  const [filterTag, setFilterTag] = useState('all'); // タグフィルター
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false); // インポートメニューの開閉状態

  // 利用可能なタグを取得
  const availableTags = Array.from(new Set(taxDocuments.flatMap(doc => doc.tags || [])));

  // 業態形態の変更を処理する関数（ダミー）
  const handleBusinessTypeChange = (businessType: BusinessType) => {
    setCurrentBusinessType(businessType);

    // 業態に応じてテンプレートを更新
    if (businessType.business_type === 'individual') {
      setTaxDocuments(INDIVIDUAL_TEMPLATES.map(template => ({
        ...template,
        status: 'not_started',
        data_imported: false
      })));
    } else {
      setTaxDocuments(CORPORATION_TEMPLATES.map(template => ({
        ...template,
        status: 'not_started',
        data_imported: false
      })));
    }
  };

  // 申告書類のステータスを更新する関数
  const updateDocumentStatus = (id: string, status: TaxDocument['status']) => {
    setTaxDocuments(prev => prev.map(doc =>
      doc.id === id ? { ...doc, status } : doc
    ));
  };

  // 申告書類を削除する関数
  const deleteDocument = (id: string) => {
    setTaxDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // 新しい申告書類を追加する関数
  const addDocument = () => {
    const newDocument: TaxDocument = {
      id: Date.now().toString(),
      title: '新しい申告書類',
      description: '説明を入力してください',
      deadline: new Date().toISOString().split('T')[0],
      status: 'not_started',
      required: false,
      data_imported: false,
      content: '',
      versions: [
        {
          id: '1',
          version: 1,
          content: '初期バージョン',
          createdAt: new Date().toISOString(),
          createdBy: 'ユーザー1'
        }
      ],
      tags: [],
      comments: []
    };
    setTaxDocuments(prev => [newDocument, ...prev]);
  };

  // 申告書類を編集する関数
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TaxDocument>>({});

  const startEditing = (document: TaxDocument) => {
    setEditingId(document.id);
    setEditData(document);
  };

  const saveEdit = () => {
    if (editingId && editData) {
      setTaxDocuments(prev => prev.map(doc =>
        doc.id === editingId ? { ...doc, ...editData } as TaxDocument : doc
      ));
      setEditingId(null);
      setEditData({});
    }
  };

  // 個人事業主用の申告手順
  const individualSteps = [
    {
      id: 1,
      title: '売上・経費の集計',
      description: '取引履歴から売上と経費を分類して集計します',
      icon: Calculator
    },
    {
      id: 2,
      title: '青色申告決算書の作成',
      description: '集計したデータをもとに決算書を作成します',
      icon: FileText
    },
    {
      id: 3,
      title: '確定申告書の作成',
      description: '決算書のデータをもとに確定申告書を作成します',
      icon: BookOpen
    },
    {
      id: 4,
      title: '電子申告または郵送',
      description: 'e-Taxで電子申告するか、郵送で提出します',
      icon: Download
    }
  ];

  // 法人用の申告手順（2社目を作るシミュレーション）
  const corporationSteps = [
    {
      id: 1,
      title: '第2会社の設立手続き',
      description: '新しい会社の設立登記と税務登記を行います',
      icon: Plus
    },
    {
      id: 2,
      title: '取引の分離と記録',
      description: '第1会社と第2会社の取引を明確に分離して記録します',
      icon: Calculator
    },
    {
      id: 3,
      title: '各社の決算書作成',
      description: '各会社ごとに決算書を作成します',
      icon: FileText
    },
    {
      id: 4,
      title: '法人税申告書の作成',
      description: '各会社の決算データをもとに法人税申告書を作成します',
      icon: BookOpen
    },
    {
      id: 5,
      title: '電子申告または郵送',
      description: 'e-Taxで電子申告するか、郵送で提出します',
      icon: Download
    }
  ];

  // 現在の業態形態に応じた手順を取得
  const currentSteps = currentBusinessType.business_type === 'individual' ? individualSteps : corporationSteps;

  // テンプレートをダウンロードする関数
  const downloadTemplate = (taxDocument: TaxDocument) => {
    // 実際のアプリケーションでは、taxDocument.template_urlを使用してファイルをダウンロードします
    // ここではダミーのダウンロード処理を実装
    const linkElement = document.createElement('a');
    linkElement.href = taxDocument.template_url || '#';
    linkElement.download = `${taxDocument.title}.pdf`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    // ダウンロード状態を更新
    updateDocumentStatus(taxDocument.id, 'in_progress');
  };

  // データをインポートする関数
  const importData = (documentId: string) => {
    // 実際のアプリケーションでは、取引データを書類にインポートする処理を実装します
    // ここではダミーの処理を実装
    setTaxDocuments(prev => prev.map(doc =>
      doc.id === documentId ? { ...doc, data_imported: true } : doc
    ));

    // インポート後、ステータスを更新
    updateDocumentStatus(documentId, 'in_progress');
  };

  // 書類を提出する関数
  const submitDocument = (documentId: string) => {
    // 実際のアプリケーションでは、書類を提出する処理を実装します
    // ここではダミーの処理を実装
    updateDocumentStatus(documentId, 'completed');
  };

  // 書類をプレビューする関数
  const previewDocumentContent = (document: TaxDocument) => {
    setPreviewDocument(document);
    setIsPreviewOpen(true);
  };

  // 書類内容を更新する関数
  const updateDocumentContent = (id: string, content: string) => {
    setTaxDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        // 新しいバージョンを作成
        const newVersion: DocumentVersion = {
          id: Date.now().toString(),
          version: (doc.versions?.length || 0) + 1,
          content,
          createdAt: new Date().toISOString(),
          createdBy: 'ユーザー1'
        };

        return {
          ...doc,
          content,
          versions: [...(doc.versions || []), newVersion]
        };
      }
      return doc;
    }));
  };

  // コメントを追加する関数
  const addComment = (documentId: string, commentContent: string) => {
    setTaxDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const newComment: DocumentComment = {
          id: Date.now().toString(),
          content: commentContent,
          createdAt: new Date().toISOString(),
          createdBy: 'ユーザー1'
        };

        return {
          ...doc,
          comments: [...(doc.comments || []), newComment]
        };
      }
      return doc;
    }));
  };

  // タグを追加する関数
  const addTag = (documentId: string, tag: string) => {
    setTaxDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const newTags = doc.tags ? [...doc.tags, tag] : [tag];
        return {
          ...doc,
          tags: newTags
        };
      }
      return doc;
    }));
  };

  // タグを削除する関数
  const removeTag = (documentId: string, tag: string) => {
    setTaxDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const newTags = doc.tags?.filter(t => t !== tag) || [];
        return {
          ...doc,
          tags: newTags
        };
      }
      return doc;
    }));
  };

  // フィルターされた書類を取得
  const filteredDocuments = taxDocuments.filter(document => {
    // 検索ワードフィルター
    const matchesSearch =
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.content && document.content.toLowerCase().includes(searchTerm.toLowerCase()));

    // ステータスフィルター
    const matchesStatus = filterStatus === 'all' || document.status === filterStatus;

    // タグフィルター
    const matchesTag = filterTag === 'all' || (document.tags && document.tags.includes(filterTag));

    return matchesSearch && matchesStatus && matchesTag;
  });

  // 書類を保存する関数
  const saveDocument = (documentId: string) => {
    // 実際のアプリケーションでは、書類を保存する処理を実装します
    // ここではダミーの処理を実装
    console.log(`Document ${documentId} saved`);
    // 保存状態を更新
    updateDocumentStatus(documentId, 'in_progress');
  };

  // 書類をPDFとしてエクスポートする関数
  const exportToPDF = (taxDocument: TaxDocument) => {
    // 実際のアプリケーションでは、書類をPDFとしてエクスポートする処理を実装します
    // ここではダミーの処理を実装
    const linkElement = document.createElement('a');
    linkElement.href = '#';
    linkElement.download = `${taxDocument.title}.pdf`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  // 書類を印刷する関数
  const printDocument = (document: TaxDocument) => {
    // 実際のアプリケーションでは、書類を印刷する処理を実装します
    // ここではダミーの処理を実装
    window.print();
  };

  // 書類を共有する関数
  const shareDocument = (document: TaxDocument) => {
    // 実際のアプリケーションでは、書類を共有する処理を実装します
    // ここではダミーの処理を実装
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: document.description,
        url: window.location.href
      }).catch((error) => console.log('共有エラー:', error));
    } else {
      // Web Share APIがサポートされていない場合のフォールバック
      alert('このブラウザでは共有機能がサポートされていません');
    }
  };

  // 政府の公式ウェブサイトからテンプレートをダウンロードする関数
  const downloadTemplateFromGovernment = () => {
    // 国税庁の公式ダウンロードページURL
    const governmentUrls = {
      individual: {
        name: '確定申告書等作成コーナー',
        url: 'https://www.keisan.nta.go.jp/kyoutu/ky/smsp/top',
        description: '個人事業主向け確定申告書を作成できます'
      },
      corporation: {
        name: '法人税申告書等ダウンロード',
        url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/mokuji.htm',
        description: '法人税の各種申告書様式をダウンロードできます'
      },
      etax: {
        name: 'e-Tax（電子申告）',
        url: 'https://www.e-tax.nta.go.jp/',
        description: '電子申告・納税システム'
      }
    };

    const businessType = currentBusinessType.business_type === 'individual' ? 'individual' : 'corporation';
    const targetUrl = governmentUrls[businessType];

    // 確認ダイアログを表示
    const confirmed = window.confirm(
      `国税庁の公式ウェブサイトを開きます。\n\n` +
      `📄 ${targetUrl.name}\n` +
      `${targetUrl.description}\n\n` +
      `「OK」をクリックすると新しいタブで開きます。`
    );

    if (confirmed) {
      // 新しいタブで国税庁のページを開く
      window.open(targetUrl.url, '_blank', 'noopener,noreferrer');

      // 書類リストにリンク情報を追加
      const newTemplate: TaxDocument = {
        id: Date.now().toString(),
        title: `${targetUrl.name}`,
        description: targetUrl.description,
        deadline: new Date().toISOString().split('T')[0],
        status: 'not_started',
        required: false,
        data_imported: false,
        template_url: targetUrl.url,
        content: `国税庁公式サイト: ${targetUrl.url}`,
        versions: [
          {
            id: '1',
            version: 1,
            content: `リンク: ${targetUrl.url}`,
            createdAt: new Date().toISOString(),
            createdBy: '国税庁'
          }
        ],
        tags: ['政府', 'テンプレート', '公式'],
        comments: []
      };

      setTaxDocuments(prev => [newTemplate, ...prev]);
    }
  };

  // HTMLコンテンツからPDFリンクを抽出する関数
  const extractPDFFromHTML = (htmlContent: string): string[] => {
    const pdfLinks: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // PDFリンクを抽出
    const links = doc.querySelectorAll('a[href$=".pdf"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        // 絶対URLに変換
        try {
          const absoluteUrl = new URL(href, 'https://www.nta.go.jp').href;
          pdfLinks.push(absoluteUrl);
        } catch (e) {
          // 無効なURLはスキップ
          console.warn('無効なPDFリンクをスキップしました:', href);
        }
      }
    });

    return pdfLinks;
  };

  // クラウドストレージサービスから書類をインポートする関数
  const importFromCloudStorage = async () => {
    try {
      // 実際のアプリケーションでは、Google DriveやDropboxのAPIを使用します
      // ここではファイル選択ダイアログを使用した簡易実装

      // ファイル選択ダイアログを作成
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
      input.multiple = true;

      // ファイル選択時の処理
      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const importedDocuments: TaxDocument[] = [];

          // 各ファイルを処理
          for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // ファイルを読み込んでBase64に変換
            const base64Content = await fileToBase64(file);

            // 書類オブジェクトを作成
            const newDocument: TaxDocument = {
              id: `${Date.now()}_${i}`,
              title: file.name,
              description: `クラウドストレージからインポートした書類: ${file.name}`,
              deadline: new Date().toISOString().split('T')[0],
              status: 'not_started',
              required: false,
              data_imported: true,
              content: base64Content,
              versions: [
                {
                  id: '1',
                  version: 1,
                  content: base64Content,
                  createdAt: new Date().toISOString(),
                  createdBy: 'クラウドストレージ'
                }
              ],
              tags: ['クラウド', 'インポート'],
              comments: []
            };

            importedDocuments.push(newDocument);
          }

          // 書類リストに追加
          setTaxDocuments(prev => [...importedDocuments, ...prev]);

          alert(`${files.length}件の書類をクラウドストレージからインポートしました`);
        }
      };

      // ファイル選択ダイアログを開く
      input.click();
    } catch (error) {
      console.error('クラウドストレージからのインポートエラー:', error);
      alert(`書類のインポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  // ファイルをBase64に変換する関数
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // メールで送られてきた書類を直接アプリに取り込む関数
  const importFromEmail = async () => {
    try {
      // 実際のアプリケーションでは、メールAPI（Gmail API、Outlook APIなど）を使用します
      // ここではファイル選択ダイアログを使用した簡易実装

      // ファイル選択ダイアログを作成
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.eml,.msg';
      input.multiple = true;

      // ファイル選択時の処理
      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const importedDocuments: TaxDocument[] = [];

          // 各ファイルを処理
          for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // ファイルを読み込んでBase64に変換
            const base64Content = await fileToBase64(file);

            // 書類オブジェクトを作成
            const newDocument: TaxDocument = {
              id: `${Date.now()}_${i}`,
              title: file.name,
              description: `メールから取り込んだ書類: ${file.name}`,
              deadline: new Date().toISOString().split('T')[0],
              status: 'not_started',
              required: false,
              data_imported: true,
              content: base64Content,
              versions: [
                {
                  id: '1',
                  version: 1,
                  content: base64Content,
                  createdAt: new Date().toISOString(),
                  createdBy: 'メール'
                }
              ],
              tags: ['メール', 'インポート'],
              comments: []
            };

            importedDocuments.push(newDocument);
          }

          // 書類リストに追加
          setTaxDocuments(prev => [...importedDocuments, ...prev]);

          alert(`${files.length}件の書類をメールから取り込みました`);
        }
      };

      // ファイル選択ダイアログを開く
      input.click();
    } catch (error) {
      console.error('メールからの取り込みエラー:', error);
      alert(`書類の取り込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  // スキャナーで読み取った書類をアプリに取り込む関数
  const importFromScanner = async () => {
    try {
      // 実際のアプリケーションでは、スキャナーAPIまたはカメラAPIを使用します
      // ここではファイル選択ダイアログを使用した簡易実装

      // ファイル選択ダイアログを作成
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,.pdf';
      input.multiple = true;
      input.capture = 'environment'; // モバイルデバイスの場合は背面カメラを使用

      // ファイル選択時の処理
      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const importedDocuments: TaxDocument[] = [];

          // 各ファイルを処理
          for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // ファイルを読み込んでBase64に変換
            const base64Content = await fileToBase64(file);

            // 書類オブジェクトを作成
            const newDocument: TaxDocument = {
              id: `${Date.now()}_${i}`,
              title: file.name,
              description: `スキャナーから取り込んだ書類: ${file.name}`,
              deadline: new Date().toISOString().split('T')[0],
              status: 'not_started',
              required: false,
              data_imported: true,
              content: base64Content,
              versions: [
                {
                  id: '1',
                  version: 1,
                  content: base64Content,
                  createdAt: new Date().toISOString(),
                  createdBy: 'スキャナー'
                }
              ],
              tags: ['スキャナー', 'インポート'],
              comments: []
            };

            importedDocuments.push(newDocument);
          }

          // 書類リストに追加
          setTaxDocuments(prev => [...importedDocuments, ...prev]);

          alert(`${files.length}件の書類をスキャナーから取り込みました`);
        }
      };

      // ファイル選択ダイアログを開く
      input.click();
    } catch (error) {
      console.error('スキャナーからの取り込みエラー:', error);
      alert(`書類の取り込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HeaderコンポーネントはApp.tsxでレンダリングされるため、ここでは削除 */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-text-main mb-2">業態変換</h1>
          <p className="text-text-muted">個人事業主から法人（2社目）への変換手順をシミュレーションします</p>
        </div>

        {/* 業態変換ガイド */}
        <div className="bg-surface rounded-lg shadow-md p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold text-text-main mb-4">変換手順</h2>
          <div className="space-y-4">
            {currentSteps.map((step) => (
              <div key={step.id} className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-text-main">{step.title}</h3>
                  <p className="text-text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 必要な書類テンプレート */}
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-text-main">必要な書類テンプレート</h2>
            <div className="flex space-x-2">
              <button
                onClick={addDocument}
                className="flex items-center btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                新しい書類
              </button>
              <button
                onClick={downloadTemplateFromGovernment}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                政府テンプレート
              </button>
            </div>
          </div>

          {/* 検索とフィルター */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="書類を検索..."
                className="w-full px-4 py-2 bg-background border border-border rounded-md text-text-main focus:ring-2 focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 bg-background border border-border rounded-md text-text-main focus:ring-2 focus:ring-primary focus:border-primary"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | TaxDocument['status'])}
              >
                <option value="all">すべてのステータス</option>
                <option value="not_started">未開始</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
              </select>
              <select
                className="px-4 py-2 bg-background border border-border rounded-md text-text-main focus:ring-2 focus:ring-primary focus:border-primary"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              >
                <option value="all">すべてのタグ</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 書類リスト */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                {editingId === document.id ? (
                  // 編集モード
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-main focus:ring-2 focus:ring-primary focus:border-primary"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="タイトル"
                    />
                    <textarea
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-main focus:ring-2 focus:ring-primary focus:border-primary"
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      placeholder="説明"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                        }}
                        className="px-3 py-1 text-text-muted hover:text-text-main"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-text-main">{document.title}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => startEditing(document)}
                          className="p-1 text-text-muted hover:text-primary"
                          title="編集"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(document.id)}
                          className="p-1 text-text-muted hover:text-red-600"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-text-muted text-sm mb-3">{document.description}</p>

                    {/* タグ */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {document.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      <button
                        onClick={() => {
                          const newTag = prompt('新しいタグを入力してください:');
                          if (newTag) {
                            addTag(document.id, newTag);
                          }
                        }}
                        className="px-2 py-1 bg-surface-highlight text-text-main text-xs rounded-full hover:bg-border"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center text-sm text-text-muted mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>期限: {document.deadline}</span>
                    </div>

                    {/* ステータスとアクションボタン */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${document.status === 'not_started' ? 'bg-surface-highlight text-text-muted' :
                          document.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-green-500/10 text-green-600'
                          }`}>
                          {document.status === 'not_started' ? '未開始' :
                            document.status === 'in_progress' ? '進行中' : '完了'}
                        </span>
                        {document.data_imported && (
                          <span className="ml-2 px-2 py-1 bg-purple-500/10 text-purple-600 text-xs rounded-full">
                            データインポート済み
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {document.template_url && (
                          <button
                            onClick={() => downloadTemplate(document)}
                            className="p-2 text-text-muted hover:text-primary"
                            title="テンプレートダウンロード"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => importData(document.id)}
                          className="p-2 text-text-muted hover:text-green-600"
                          title="データインポート"
                          disabled={document.data_imported}
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => previewDocumentContent(document)}
                          className="p-2 text-text-muted hover:text-purple-600"
                          title="プレビュー"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (document.status === 'completed') {
                              alert('この書類はすでに提出されています');
                            } else {
                              submitDocument(document.id);
                            }
                          }}
                          className="p-2 text-text-muted hover:text-green-600"
                          title="提出"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ドキュメントプレビューモーダル */}
      {isPreviewOpen && previewDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-border">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-main">{previewDocument.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => printDocument(previewDocument)}
                  className="p-2 text-text-muted hover:text-text-main"
                  title="印刷"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button
                  onClick={() => shareDocument(previewDocument)}
                  className="p-2 text-text-muted hover:text-text-main"
                  title="共有"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-text-muted hover:text-text-main"
                  title="閉じる"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)] bg-surface">
              {previewDocument.content ? (
                <div className="prose max-w-none text-text-main">
                  <p>{previewDocument.content}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">プレビューするコンテンツがありません</p>
                  <p className="text-text-muted text-sm mt-2">データをインポートするか、コンテンツを追加してください</p>
                </div>
              )}

              {/* バージョン履歴 */}
              {previewDocument.versions && previewDocument.versions.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-md font-semibold text-text-main mb-3">バージョン履歴</h4>
                  <div className="space-y-2">
                    {previewDocument.versions.map(version => (
                      <div key={version.id} className="flex items-center justify-between p-2 bg-surface-highlight rounded">
                        <div>
                          <span className="font-medium text-text-main">バージョン {version.version}</span>
                          <span className="text-text-muted text-sm ml-2">
                            {new Date(version.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-text-muted text-sm">{version.createdBy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* コメントセクション */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-text-main mb-3">コメント</h4>
                {previewDocument.comments && previewDocument.comments.length > 0 ? (
                  <div className="space-y-3">
                    {previewDocument.comments.map(comment => (
                      <div key={comment.id} className="p-3 bg-surface-highlight rounded">
                        <div className="flex justify-between">
                          <span className="font-medium text-text-main">{comment.createdBy}</span>
                          <span className="text-text-muted text-sm">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-text-main">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-center py-4">コメントはありません</p>
                )}

                {/* コメント追加フォーム */}
                <div className="mt-4">
                  <textarea
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-main focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="コメントを追加..."
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => {
                        const textarea = document.querySelector('textarea[placeholder="コメントを追加..."]') as HTMLTextAreaElement;
                        if (textarea && textarea.value.trim() !== '') {
                          addComment(previewDocument.id, textarea.value);
                          textarea.value = '';
                        }
                      }}
                      className="btn-primary"
                    >
                      コメントを追加
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-border">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-surface-highlight text-text-main rounded-md hover:bg-border"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessConversion;