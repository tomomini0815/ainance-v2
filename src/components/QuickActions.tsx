import React from 'react'
import { Link } from 'react-router-dom'
import {Receipt, FileText, BarChart3, MessageSquare, Users, Settings, Zap, TrendingUp} from 'lucide-react'

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Receipt,
      title: 'レシート処理',
      subtitle: '画像から自動仕訳',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      link: '/receipt-processing'
    },
    {
      icon: FileText,
      title: '請求書作成',
      subtitle: 'テンプレートで簡単作成',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      link: '/invoice-creation'
    },
    {
      icon: BarChart3,
      title: '経営分析',
      subtitle: 'AIが分析レポート作成',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      link: '/business-analysis'
    },
    {
      icon: MessageSquare,
      title: 'Chat-to-Book',
      subtitle: 'チャットで会計処理',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      link: '/chat-to-book'
    },
    {
      icon: Users,
      title: '事業変換',
      subtitle: '個人⇔法人の切り替え',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
      link: '/business-conversion'
    },
    {
      icon: Settings,
      title: '連携設定',
      subtitle: '銀行・クレジット連携',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
      link: '/integration-settings'
    }
  ]

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">クイックアクション</h2>
        <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          すべて表示
          <TrendingUp className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 block transform hover:-translate-y-1 transition-transform duration-200"
            >
              <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                <IconComponent className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <h3 className="font-medium text-gray-900 text-sm text-center mb-1">{action.title}</h3>
              <p className="text-xs text-gray-500 text-center">{action.subtitle}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default QuickActions