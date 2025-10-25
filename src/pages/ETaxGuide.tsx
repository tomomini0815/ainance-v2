import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, Lock, User, CheckCircle } from 'lucide-react';

const ETaxGuide: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: '利用者登録',
      description: 'e-Taxを利用するには、事前に利用者登録が必要です。',
      details: [
        '国税庁のe-Taxポータルサイトにアクセス',
        '「利用者登録」を選択',
        '必要な情報を入力し、本人確認手続きを実施',
        '登録完了メールを受信'
      ]
    },
    {
      id: 2,
      title: '電子証明書の取得',
      description: '電子申告には電子証明書が必要です。',
      details: [
        'JPKI利用者支援窓口に申請',
        '本人確認書類を準備',
        '申請手続きを実施',
        '電子証明書を取得'
      ]
    },
    {
      id: 3,
      title: '環境設定',
      description: '電子申告に必要な環境を整えます。',
      details: [
        '指定のブラウザをインストール',
        '電子証明書をコンピュータにインストール',
        'e-Taxアプリケーションをダウンロード',
        '動作確認テストを実施'
      ]
    },
    {
      id: 4,
      title: '申告書の作成と提出',
      description: '電子申告システムで申告書を作成・提出します。',
      details: [
        'e-Taxにログイン',
        '「申告書作成」を選択',
        '必要な情報を入力',
        '電子署名を実施',
        '申告書を提出'
      ]
    }
  ];

  const faqs = [
    {
      question: '電子証明書の有効期限はどれくらいですか？',
      answer: '電子証明書の有効期限は通常3年です。期限が切れる前に更新手続きが必要です。'
    },
    {
      question: 'ID・パスワード認証を利用できますか？',
      answer: 'はい、電子証明書の代わりにID・パスワード認証を利用することもできますが、電子証明書の方がセキュリティレベルが高いです。'
    },
    {
      question: '電子申告の利用時間は？',
      answer: 'e-Taxは24時間365日利用できますが、システムメンテナンス時間はご利用いただけません。'
    },
    {
      question: '当アプリから直接e-Taxにデータを送信できますか？',
      answer: 'いいえ、当アプリはe-Taxへの直接的なデータ送信機能は提供していません。作成したデータをe-Taxで入力する際にご利用ください。'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/tax-filing-support" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">電子申告システム(e-Tax)利用ガイド</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <ExternalLink className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">e-Taxとは</h2>
          </div>
          <p className="text-gray-600 mb-4">
            電子申告(e-Tax)は、国税庁が提供するインターネット申告・納税サービスです。
            このサービスを利用することで、各種申告書をオンラインで提出し、税金を納めることができます。
          </p>
          <a
            href="https://www.e-tax.nta.go.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            e-Taxポータルサイトへ
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">利用までの流れ</h2>
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.id} className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {step.id}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">よくある質問</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            セキュリティに関する注意事項
          </h2>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>電子証明書やID・パスワードは第三者に知られないように厳重に保管してください</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>公共のコンピュータやネットカフェ等の共有コンピュータではe-Taxを利用しないでください</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>不審なメールやリンクをクリックしないでください</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>当アプリはe-Taxへのデータ送信機能は提供していません。e-Taxへの入力はユーザー自身で行ってください</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ETaxGuide;