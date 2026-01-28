import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart2, Camera, Mic, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';

const QuickActions: React.FC = () => {
  const { currentBusinessType } = useBusinessTypeContext();
  const isCorporation = currentBusinessType?.business_type === 'corporation';

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
      title: isCorporation ? '法人税申告サポート' : '確定申告サポート',
      description: 'Ainanceのデータで書類作成',
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
          className="bg-white dark:bg-surface rounded-xl p-2.5 hover:bg-surface-highlight transition-all duration-300 group border border-border hover:border-border-strong hover:-translate-y-1 shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 border ${action.borderColor}`}>
              <action.icon className={`w-5 h-5 ${action.iconColor}`} />
            </div>
            <h3 className="font-medium text-text-main mb-1 text-xs">{action.title}</h3>
            <p className="text-[10px] text-text-muted leading-tight">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;