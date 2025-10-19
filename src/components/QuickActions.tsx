import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart2, Camera, Calculator, BookOpen, Link as LinkIcon } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'CHAT-TO-BOOK',
      description: '音声で取引を記録',
      icon: Calculator,
      link: '/chat-to-book',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'レシート処理',
      description: 'レシートをスキャンして処理',
      icon: Camera,
      link: '/receipt-processing',
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: '請求書作成',
      description: '新しい請求書を作成',
      icon: FileText,
      link: '/invoice-creation',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: '取引履歴',
      description: 'すべての取引を確認',
      icon: BarChart2,
      link: '/transaction-history',
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: '申告サポート',
      description: '税務申告の準備をサポート',
      icon: BookOpen,
      link: '/tax-filing-support',
      color: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      title: '連携設定',
      description: '外部サービスとの連携を設定',
      icon: LinkIcon,
      link: '/integration-settings',
      color: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {actions.map((action, index) => (
        <Link
          key={index}
          to={action.link}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
              <action.icon className={`w-6 h-6 ${action.iconColor}`} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;