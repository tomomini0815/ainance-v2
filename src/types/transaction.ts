export interface Transaction {
  id: string;
  item: string;
  amount: number | string;
  date: string;
  category: string;
  type: 'income' | 'expense';
  description?: string;
  approval_status?: string;
  receipt_path?: string;
  tag?: string;
  tags?: string[];
  ai_parsed?: boolean;
}
