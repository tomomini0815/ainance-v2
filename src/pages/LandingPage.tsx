
import React from 'react'
import { Link } from 'react-router-dom'
import {Calculator, FileText, BarChart3, MessageSquare, Zap, Shield, Clock, Users, CheckCircle, ArrowRight, Star, TrendingUp, Smartphone, Globe, ChevronRight} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const LandingPage: React.FC = () => {
  const { isAuthenticated, signIn } = useAuth()

  const features = [
    {
      icon: <Calculator className="w-8 h-8 text-blue-600" />,
      title: 'スマートレシート処理',
      description: 'AIが自動でレシートを読み取り、経費を分類。手作業の時間を90%削減。',
      benefit: '時間削減'
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: 'プロ級請求書作成',
      description: '美しいテンプレートで請求書を瞬時に作成。自動送信・リマインダー機能付き。',
      benefit: '効率化'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: 'リアルタイム経営分析',
      description: 'キャッシュフローや収益性を視覚的に分析。データドリブンな意思決定をサポート。',
      benefit: '洞察力'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-orange-600" />,
      title: 'CHAT-TO-BOOK',
      description: 'チャットで帳簿作成。複雑な仕訳も自然言語で簡単入力。',
      benefit: '簡単操作'
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: '事業変換支援',
      description: '個人事業主から法人化まで、事業形態の変更をスムーズにサポート。',
      benefit: '成長支援'
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: 'セキュア統合',
      description: '銀行・会計ソフトとの安全な連携。エンタープライズ級のセキュリティ。',
      benefit: '安全性'
    }
  ]

  const testimonials = [
    {
      name: '田中太郎',
      company: 'デザイン事務所経営',
      content: 'レシート処理が劇的に楽になりました。月末の経理作業が1日から2時間に短縮！',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: '佐藤花子',
      company: 'フリーランス講師',
      content: 'CHAT-TO-BOOKが革命的。複雑な仕訳も「今日の交通費3000円」って入力するだけ。',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: '鈴木一郎',
      company: 'IT系スタートアップCEO',
      description: '法人化の手続きが想像以上にスムーズでした。Ainanceのサポートは本当に頼りになります。',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ]

  const pricingPlans = [
    {
      name: 'スターター',
      price: '¥980',
      period: '/月',
      description: '個人事業主・フリーランス向け',
      features: [
        'レシート処理 月50件',
        '請求書作成 月10件',
        '基本的な経営分析',
        'CHAT-TO-BOOK',
        'メールサポート'
      ],
      popular: false,
      cta: '14日間無料トライアル'
    },
    {
      name: 'プロフェッショナル',
      price: '¥2,980',
      period: '/月',
      description: '中小企業・成長中の事業者向け',
      features: [
        'レシート処理 無制限',
        '請求書作成 無制限',
        '高度な経営分析',
        'CHAT-TO-BOOK',
        '事業変換支援',
        '銀行連携',
        '優先サポート'
      ],
      popular: true,
      cta: '14日間無料トライアル'
    },
    {
      name: 'エンタープライズ',
      price: 'お見積り',
      period: '',
      description: '大企業・複数拠点向け',
      features: [
        'すべての機能',
        '専用サポート',
        'カスタム統合',
        'オンサイト導入支援',
        'SLA保証',
        '専任コンサルタント'
      ],
      popular: false,
      cta: 'お問い合わせ'
    }
  ]

  const stats = [
    { number: '10,000+', label: '利用者数' },
    { number: '500万+', label: '処理レシート数' },
    { number: '95%', label: '時間削減率' },
    { number: '99.9%', label: 'アップタイム' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Ainance</h1>
              <span className="ml-2 text-sm text-gray-500">AI経理プラットフォーム</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">機能</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">料金</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">お客様の声</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">お問い合わせ</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link 
                  to="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  ダッシュボードへ
                </Link>
              ) : (
                <button
                  onClick={signIn}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  ログイン
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4 mr-2" />
                  AI搭載の次世代経理プラットフォーム
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  経理業務を
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    革命的に
                  </span>
                  効率化
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  AIがレシートを自動処理し、請求書作成から経営分析まで。
                  <br />
                  個人事業主から法人まで、あらゆる事業者の成長をサポートします。
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    ダッシュボードを開く
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <button
                    onClick={signIn}
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    無料で始める
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                )}
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors">
                  デモを見る
                  <Globe className="w-5 h-5 ml-2" />
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  14日間無料トライアル
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  クレジットカード不要
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">今月の収支</h3>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">売上</span>
                      <span className="font-bold text-green-600">¥1,250,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">経費</span>
                      <span className="font-bold text-red-600">¥380,000</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-semibold">純利益</span>
                        <span className="font-bold text-blue-600 text-xl">¥870,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium transform rotate-12">
                AI自動計算
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              すべての経理業務を
              <span className="text-blue-600">一つのプラットフォーム</span>で
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AIの力で経理業務を自動化し、事業の成長に集中できる環境を提供します
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  {feature.benefit}
                </div>
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  詳しく見る
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お客様の声 */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">お客様の声</h2>
            <p className="text-xl text-gray-600">実際にAinanceをご利用いただいているお客様の声をご紹介します</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">シンプルで透明な料金</h2>
            <p className="text-xl text-gray-600">事業規模に合わせて選べる料金プランをご用意しています</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    人気プラン
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={signIn}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            今すぐAinanceで経理業務を革新しませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            14日間の無料トライアルで、AIがもたらす経理業務の効率化を実感してください。
            クレジットカードの登録は不要です。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={signIn}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
            >
              無料トライアルを開始
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-medium rounded-xl hover:bg-white hover:text-blue-600 transition-colors">
              デモをリクエスト
              <Smartphone className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Ainance</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                AI搭載の次世代経理プラットフォーム。
                個人事業主から法人まで、あらゆる事業者の成長をサポートします。
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">製品</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">レシート処理</a></li>
                <li><a href="#" className="hover:text-white transition-colors">請求書作成</a></li>
                <li><a href="#" className="hover:text-white transition-colors">経営分析</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CHAT-TO-BOOK</a></li>
                <li><a href="#" className="hover:text-white transition-colors">事業変換支援</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">ヘルプセンター</a></li>
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API ドキュメント</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ステータス</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Ainance. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">プライバシーポリシー</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">利用規約</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie設定</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
