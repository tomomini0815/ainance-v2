import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart2, Camera, Mic, Link as LinkIcon, Sparkles } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: '音声で記録',
      description: '音声で取引を記録',
      icon: Mic,
      link: '/chat-to-book',
      color: 'bg-purple-500/20',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'レシート処理',
      description: 'レシートをスキャン',
      icon: Camera,
      link: '/receipt-processing',
      color: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: '請求書作成',
      description: '新しい請求書を作成',
      icon: FileText,
      link: '/invoice-creation',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/30'
    },
    {
      title: '取引履歴',
      description: 'すべての取引を確認',
      icon: BarChart2,
      link: '/transaction-history',
      color: 'bg-amber-500/20',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500/30'
    },
    {
      title: '補助金マッチング',
      description: 'AI補助金提案',
      icon: LinkIcon,
      link: '/subsidy-matching',
      color: 'bg-rose-500/20',
      iconColor: 'text-rose-500',
      borderColor: 'border-rose-500/30'
    },
    {
      title: '駆け込み確定申告',
      description: '1日で書類完成',
      icon: Sparkles,
      link: '/quick-tax-filing',
      color: 'bg-orange-500/20',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500/30'
    },
    {
      title: '確定申告サポート',
      description: 'AIで確定申告をサポート',
      icon: Sparkles,
      link: '/tax-filing-wizard',
      color: 'bg-indigo-500/20',
      iconColor: 'text-indigo-500',
      borderColor: 'border-indigo-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
      {actions.map((action, index) => (
        <Link
          key={index}
          to={action.link}
          className="bg-white dark:bg-surface rounded-xl p-4 hover:bg-surface-highlight transition-all duration-300 group border border-border hover:border-border-strong hover:-translate-y-1 shadow-sm hover:shadow-md"
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