/**
 * 取引の重複をチェックするためのユーティリティ
 */

interface TransactionLike {
  id: string;
  amount: number;
  date: string;
  item?: string;
  description?: string;
  approval_status?: string;
}

/**
 * 文字列の類似度を簡易的にチェックする（トークンの重複）
 */
const isNameSimilar = (name1: string = '', name2: string = ''): boolean => {
  const normalize = (s: string) => s.toLowerCase().replace(/[\s　]+/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);

  if (!n1 || !n2) return false;
  
  // 完全に一致
  if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;

  // 2つ以上の共通キーワード（2文字以上）があるかチェック
  const getTokens = (s: string) => {
    // 漢字、カタカナ、ひらがな、英数字の連続をトークン化（簡易）
    return s.match(/[a-zA-Z0-9]{2,}|[\u4E00-\u9FFF]{2,}|[\u3040-\u309F]{2,}|[\u30A0-\u30FF]{2,}/g) || [];
  };

  const tokens1: string[] = getTokens(name1);
  const tokens2: string[] = getTokens(name2);

  return tokens1.some(t => tokens2.includes(t));
};

/**
 * 対象の取引が、既存の取引リストの中に重複している可能性があるものを探す
 * 条件: 
 * 1. 金額が完全に一致している
 * 2. 日付が前後3日以内である
 * 3. 項目名/説明が類似している
 * 4. 自分自身（IDが一致するもの）は除外する
 */
export const findPotentialDuplicates = (
  candidate: TransactionLike,
  existingList: TransactionLike[]
): TransactionLike[] => {
  if (!candidate.amount || !candidate.date) return [];

  const candidateDate = new Date(candidate.date);
  const candidateName = candidate.item || candidate.description || '';
  
  return (existingList || []).filter(item => {
    // 自分自身はスキップ
    if (item.id === candidate.id) return false;
    
    // 金額が一致するかチェック
    const isAmountMatch = Math.abs(Number(item.amount)) === Math.abs(Number(candidate.amount));
    if (!isAmountMatch) return false;

    // 日付が±3日以内かチェック
    const itemDate = new Date(item.date);
    const diffTime = Math.abs(candidateDate.getTime() - itemDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 3) return false;

    // 項目名の類似度チェック
    const itemName = item.item || item.description || '';
    return isNameSimilar(candidateName, itemName);
  });
};
