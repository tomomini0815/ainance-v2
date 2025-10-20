import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../components/AuthProvider'
import { Calculator, FileText, BarChart3, MessageSquare, Zap, Shield, Clock, Users, CheckCircle, ArrowRight, Star, TrendingUp, Smartphone, Globe, ChevronRight, Mail, Lock, User } from 'lucide-react'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, signUp, signOut, user } = useAuthContext()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // ローカルストレージから保存された認証情報を読み込む
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true'
    
    if (savedRememberMe && savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // フォームバリデーション
      if (!email || !password) {
        throw new Error('メールアドレスとパスワードを入力してください')
      }
      
      // メールアドレスの形式をチェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('有効なメールアドレスを入力してください')
      }
      
      // パスワードの長さをチェック
      if (password.length < 6) {
        throw new Error('パスワードは6文字以上である必要があります')
      }
      
      // サインアップの場合、名前をチェック
      if (!isLogin && !name) {
        throw new Error('お名前を入力してください')
      }
      
      if (isLogin) {
        // ログイン処理
        console.log('ログイン処理開始:', { email, password })
        
        // Supabaseの認証処理
        await signIn(email, password)
        
        // 「ログイン情報を記憶」がチェックされている場合、メールアドレスを保存
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
          localStorage.setItem('rememberMe', 'true')
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberMe')
        }
        
        console.log('ログイン成功')
      } else {
        // サインアップ処理
        console.log('サインアップ処理開始:', { name, email, password })
        
        // Supabaseのユーザー登録処理
        await signUp(name, email, password)
        
        // 「ログイン情報を記憶」がチェックされている場合、メールアドレスを保存
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
          localStorage.setItem('rememberMe', 'true')
        }
        
        console.log('サインアップ成功')
      }
      
      // ダッシュボードにリダイレクト
      console.log('ダッシュボードにリダイレクト')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('認証エラー:', error)
      setError(error.message || '認証に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // ホームページにリダイレクト
      navigate('/')
    } catch (error: any) {
      console.error('ログアウトエラー:', error)
      setError(error.message || 'ログアウトに失敗しました。')
    }
  }

  const handleDashboardRedirect = () => {
    console.log('ダッシュボードボタンがクリックされました')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* 左側: テキストコンテンツ */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  AI搭載の次世代経理プラットフォーム
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  経理業務を
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    革命的に
                  </span>
                  効率化
                </h1>
                <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
                  AIがレシートを自動処理し、請求書作成から経営分析まで。
                  <br />
                  個人事業主から法人まで、あらゆる事業者の成長をサポートします。
                </p>
              </div>
              
              {/* 統計情報 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">10,000+</div>
                  <div className="text-xs sm:text-sm text-gray-600">利用者数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">500万+</div>
                  <div className="text-xs sm:text-sm text-gray-600">処理レシート数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">95%</div>
                  <div className="text-xs sm:text-sm text-gray-600">時間削減率</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-orange-600">99.9%</div>
                  <div className="text-xs sm:text-sm text-gray-600">アップタイム</div>
                </div>
              </div>
            </div>
            
            {/* 右側: 認証フォームまたはダッシュボードリンク */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user ? 'ダッシュボードへ' : (isLogin ? 'ログイン' : 'アカウント作成')}
                </h2>
                <p className="text-gray-600">
                  {user 
                    ? 'ダッシュボードにアクセスする' 
                    : (isLogin ? 'アカウントをお持ちの場合' : '新しいアカウントを作成')}
                </p>
              </div>
              
              {user ? (
                // ログイン済みの場合
                <div className="space-y-4">
                  <button
                    onClick={handleDashboardRedirect}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    ダッシュボードを開く
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    ログアウト
                  </button>
                </div>
              ) : (
                // 未ログインの場合
                <form onSubmit={handleAuth} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  {!isLogin && (
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        お名前
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="山田太郎"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      パスワード
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        ログイン情報を記憶
                      </label>
                    </div>
                    
                    {isLogin && (
                      <div className="text-sm">
                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                          パスワードを忘れた場合
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          処理中...
                        </>
                      ) : (
                        isLogin ? 'ログイン' : 'アカウント作成'
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {!user && (
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    {isLogin ? 'アカウントをお持ちでない場合 ' : '既にアカウントをお持ちの場合 '}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {isLogin ? 'サインアップ' : 'ログイン'}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* フィーチャーセクション */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              すべての経理業務を
              <span className="text-blue-600">一つのプラットフォーム</span>で
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              AIの力で経理業務を自動化し、事業の成長に集中できる環境を提供します
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
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
            ].map((feature, index) => (
              <div key={index} className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  {feature.benefit}
                </div>
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  詳しく見る
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お客様の声 */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">お客様の声</h2>
            <p className="text-base sm:text-xl text-gray-600">実際にAinanceをご利用いただいているお客様の声をご紹介します</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
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
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
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

      {/* CTA セクション */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            今すぐAinanceで経理業務を革新しませんか？
          </h2>
          <p className="text-base sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            14日間の無料トライアルで、AIがもたらす経理業務の効率化を実感してください。
            クレジットカードの登録は不要です。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
              無料トライアルを開始
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-medium rounded-xl hover:bg-white hover:text-blue-600 transition-colors">
              デモをリクエスト
              <Smartphone className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage