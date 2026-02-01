import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart2, Camera, Mic, Link as LinkIcon, Sparkles, PieChart, FileSpreadsheet } from 'lucide-react';
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
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: 'レシート処理',
      description: 'レシートをスキャン',
      icon: Camera,
      link: '/receipt-processing',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: '取引履歴',
      description: 'すべての取引を確認',
      icon: BarChart2,
      link: '/transaction-history',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: '請求書作成',
      description: '新しい請求書を作成',
      icon: FileText,
      link: '/invoice-creation',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: 'CSV入出力管理',
      description: 'データの一括取込・出力',
      icon: FileSpreadsheet,
      link: '/csv-import',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: '経営分析',
      description: '事業の状況を分析',
      icon: PieChart,
      link: '/business-analysis',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: '補助金マッチング',
      description: 'AI補助金提案',
      icon: LinkIcon,
      link: '/subsidy-matching',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: isCorporation ? '即日法人税申告' : '即日確定申告',
      description: 'ご自身で既にデータがある方向け',
      icon: Sparkles,
      link: '/quick-tax-filing',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: isCorporation ? '法人税申告サポート' : '確定申告サポート',
      description: 'Ainanceのデータで書類作成',
      icon: Sparkles,
      link: isCorporation ? '/corporate-tax' : '/tax-filing-wizard',
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    }
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4 mb-8">
      {actions.map((action, index) => (
        <Link
          key={index}
          to={action.link}
          className="bg-white dark:bg-surface rounded-xl p-2.5 hover:bg-surface-highlight transition-all duration-300 group border border-border hover:border-border-strong hover:-translate-y-1 shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
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