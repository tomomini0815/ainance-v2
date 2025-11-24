import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { Home, Receipt, FileText, BarChart3, MessageSquare, Users, Settings } from 'lucide-react';

export interface SearchResultPage {
  title: string;
  path: string;
  icon: any;
  description: string;
}

export const useGlobalSearch = (query: string) => {
  const { currentBusinessType } = useBusinessTypeContext();
  const { transactions } = useTransactions(undefined, currentBusinessType?.business_type);

  const pages: SearchResultPage[] = [
    { title: 'ダッシュボード', path: '/dashboard', icon: Home, description: 'ホーム画面' },
    { title: '取引履歴', path: '/transaction-history', icon: FileText, description: 'すべての取引を確認' },
    { title: 'レシート処理', path: '/receipt-processing', icon: Receipt, description: 'レシートのスキャンと登録' },
    { title: '請求書作成', path: '/invoice-creation', icon: FileText, description: '請求書の作成と管理' },
    { title: '経営分析', path: '/business-analysis', icon: BarChart3, description: '売上・経費の分析' },
    { title: 'CHAT-TO-BOOK', path: '/chat-to-book', icon: MessageSquare, description: 'チャットで記帳' },
    { title: '申告サポート', path: '/business-conversion', icon: Users, description: '確定申告のサポート' },
    { title: '設定', path: '/integration-settings', icon: Settings, description: 'アプリの設定' },
  ];

  const filteredPages = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return pages.filter(page => 
      page.title.toLowerCase().includes(lowerQuery) || 
      page.description.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const filteredTransactions = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return transactions.filter(t => 
      t.item.toLowerCase().includes(lowerQuery) ||
      (t.description && t.description.toLowerCase().includes(lowerQuery)) ||
      t.category.toLowerCase().includes(lowerQuery) ||
      t.amount.toString().includes(lowerQuery)
    ).slice(0, 5); // Limit to 5 recent results
  }, [query, transactions]);

  return {
    pages: filteredPages,
    transactions: filteredTransactions
  };
};