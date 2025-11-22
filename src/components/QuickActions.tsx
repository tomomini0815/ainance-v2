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
      color: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'レシート処理',
      description: 'レシートをスキャン',
      icon: Camera,
      link: '/receipt-processing',
      color: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: '請求書作成',
      description: '新しい請求書を作成',
      icon: FileText,
      link: '/invoice-creation',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30'
    },
    {
      title: '取引履歴',
      description: 'すべての取引を確認',
      icon: BarChart2,
      link: '/transaction-history',
      color: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30'
    },
    {
      title: '申告サポート',
      description: '税務申告の準備',
      icon: BookOpen,
      link: '/tax-filing-support',
      color: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/30'
    },
    {
      title: '連携設定',
      description: '外部サービス連携',
      icon: LinkIcon,
      link: '/integration-settings',
      color: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {actions.map((action, index) => (
        <Link
          key={index}
          to={action.link}
          className="glass-card rounded-xl p-4 hover:bg-surface-highlight transition-all duration-300 group border border-white/5 hover:border-white/10 hover:-translate-y-1"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border ${action.borderColor}`}>
              <action.icon className={`w-6 h-6 ${action.iconColor}`} />
            </div>
            <h3 className="font-medium text-text-main mb-1 text-sm">{action.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;