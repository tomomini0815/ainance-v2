import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface Subsidy {
  id: string;
  name: string;
  description: string;
  eligibilityCriteria: {
    businessTypes: string[];
    minRevenue?: number;
    maxRevenue?: number;
    employeeCount?: { min?: number; max?: number };
    industries?: string[];
    regions?: string[];
  };
  amountRange: {
    min: number;
    max: number;
    type: 'fixed' | 'percentage' | 'variable';
  };
  deadline: string;
  category: string;
  applicationUrl: string;
  requiredDocuments: string[];
  processingTime: string;
  successRate?: number;
}

export interface BusinessProfile {
  businessType: 'sole_proprietor' | 'corporation';
  industry: string;
  revenue: number;
  employeeCount: number;
  region: string;
  establishedYear: number;
}

export interface SubsidyMatch {
  subsidy: Subsidy;
  matchScore: number;
  matchReasons: string[];
  estimatedAmount: number;
  applicationDifficulty: 'easy' | 'medium' | 'hard';
  adoptionProbability: number;
}

export interface ApplicationDraft {
  subsidyId: string;
  subsidyName: string;
  sections: Array<{
    title: string;
    content: string;
    tips: string[];
  }>;
  checklist: string[];
  estimatedCompletionTime: string;
}

/**
 * サンプル補助金データ（実際にはSupabaseから取得）
 */
const SAMPLE_SUBSIDIES: Subsidy[] = [
  {
    id: '1',
    name: 'ものづくり補助金',
    description: '中小企業・小規模事業者等が今後複数年にわたり相次いで直面する制度変更等に対応するため、中小企業・小規模事業者等が取り組む革新的サービス開発・試作品開発・生産プロセスの改善を行うための設備投資等を支援',
    eligibilityCriteria: {
      businessTypes: ['corporation', 'sole_proprietor'],
      maxRevenue: 1000000000,
      employeeCount: { max: 300 },
      industries: ['製造業', 'IT', 'サービス業'],
    },
    amountRange: {
      min: 1000000,
      max: 50000000,
      type: 'variable',
    },
    deadline: '2026-03-31',
    category: '設備投資',
    applicationUrl: 'https://portal.monodukuri-hojo.jp/',
    requiredDocuments: ['事業計画書', '経費明細書', '決算書'],
    processingTime: '約6ヶ月',
    successRate: 45,
  },
  {
    id: '2',
    name: 'IT導入補助金',
    description: '中小企業・小規模事業者等のITツール導入による業務効率化・売上アップをサポート',
    eligibilityCriteria: {
      businessTypes: ['corporation', 'sole_proprietor'],
      maxRevenue: 500000000,
      employeeCount: { max: 100 },
    },
    amountRange: {
      min: 500000,
      max: 4500000,
      type: 'percentage',
    },
    deadline: '2026-02-28',
    category: 'IT・デジタル化',
    applicationUrl: 'https://www.it-hojo.jp/',
    requiredDocuments: ['ITツール導入計画書', '見積書'],
    processingTime: '約3ヶ月',
    successRate: 65,
  },
  {
    id: '3',
    name: '小規模事業者持続化補助金',
    description: '小規模事業者が経営計画を作成し、販路開拓等に取り組む費用を支援',
    eligibilityCriteria: {
      businessTypes: ['sole_proprietor', 'corporation'],
      employeeCount: { max: 20 },
    },
    amountRange: {
      min: 500000,
      max: 2000000,
      type: 'fixed',
    },
    deadline: '2026-01-31',
    category: '販路開拓',
    applicationUrl: 'https://r3.jizokukahojokin.info/',
    requiredDocuments: ['経営計画書', '補助事業計画書'],
    processingTime: '約4ヶ月',
    successRate: 70,
  },
  {
    id: '4',
    name: '事業再構築補助金',
    description: 'ポストコロナ・ウィズコロナ時代の経済社会の変化に対応するため、中小企業等の思い切った事業再構築を支援',
    eligibilityCriteria: {
      businessTypes: ['corporation'],
      minRevenue: 10000000,
      employeeCount: { max: 500 },
    },
    amountRange: {
      min: 1000000,
      max: 100000000,
      type: 'variable',
    },
    deadline: '2026-04-30',
    category: '事業転換',
    applicationUrl: 'https://jigyou-saikouchiku.go.jp/',
    requiredDocuments: ['事業計画書', '決算書（3期分）', '認定支援機関の確認書'],
    processingTime: '約8ヶ月',
    successRate: 40,
  },
  {
    id: '5',
    name: '創業補助金',
    description: '新たに創業する者に対して、創業等に要する経費の一部を助成',
    eligibilityCriteria: {
      businessTypes: ['sole_proprietor', 'corporation'],
      industries: ['全業種'],
    },
    amountRange: {
      min: 500000,
      max: 3000000,
      type: 'percentage',
    },
    deadline: '2026-06-30',
    category: '創業支援',
    applicationUrl: 'https://www.chusho.meti.go.jp/keiei/sogyo/',
    requiredDocuments: ['創業計画書', '資金計画書'],
    processingTime: '約5ヶ月',
    successRate: 55,
  },
];

/**
 * 補助金一覧を取得（実際にはSupabaseから取得）
 */
export const fetchSubsidies = async (): Promise<Subsidy[]> => {
  // TODO: Supabaseから取得
  return SAMPLE_SUBSIDIES;
};

/**
 * 事業プロフィールと補助金のマッチング
 */
export const matchSubsidies = async (
  profile: BusinessProfile,
  subsidies: Subsidy[]
): Promise<SubsidyMatch[]> => {
  const matches: SubsidyMatch[] = [];

  for (const subsidy of subsidies) {
    let matchScore = 0;
    const matchReasons: string[] = [];

    // 事業形態のチェック
    if (subsidy.eligibilityCriteria.businessTypes.includes(profile.businessType)) {
      matchScore += 20;
      matchReasons.push('事業形態が適合しています');
    } else {
      continue; // 事業形態が合わない場合はスキップ
    }

    // 売上のチェック
    if (subsidy.eligibilityCriteria.minRevenue && profile.revenue < subsidy.eligibilityCriteria.minRevenue) {
      continue;
    }
    if (subsidy.eligibilityCriteria.maxRevenue && profile.revenue > subsidy.eligibilityCriteria.maxRevenue) {
      continue;
    }
    if (subsidy.eligibilityCriteria.minRevenue || subsidy.eligibilityCriteria.maxRevenue) {
      matchScore += 20;
      matchReasons.push('売上規模が適合しています');
    }

    // 従業員数のチェック
    const empCriteria = subsidy.eligibilityCriteria.employeeCount;
    if (empCriteria) {
      if (empCriteria.min && profile.employeeCount < empCriteria.min) {
        continue;
      }
      if (empCriteria.max && profile.employeeCount > empCriteria.max) {
        continue;
      }
      matchScore += 15;
      matchReasons.push('従業員数が適合しています');
    }

    // 業種のチェック
    if (subsidy.eligibilityCriteria.industries) {
      if (subsidy.eligibilityCriteria.industries.includes(profile.industry) ||
          subsidy.eligibilityCriteria.industries.includes('全業種')) {
        matchScore += 25;
        matchReasons.push('業種が適合しています');
      } else {
        matchScore -= 10;
      }
    }

    // 地域のチェック
    if (subsidy.eligibilityCriteria.regions) {
      if (subsidy.eligibilityCriteria.regions.includes(profile.region)) {
        matchScore += 10;
        matchReasons.push('対象地域に該当します');
      }
    }

    // 設立年数による加点
    const yearsInBusiness = new Date().getFullYear() - profile.establishedYear;
    if (subsidy.category === '創業支援' && yearsInBusiness <= 3) {
      matchScore += 20;
      matchReasons.push('創業間もない企業向けの補助金です');
    }

    // 推定金額の計算
    let estimatedAmount = subsidy.amountRange.min;
    if (subsidy.amountRange.type === 'percentage') {
      // 売上の一定割合と仮定
      estimatedAmount = Math.min(profile.revenue * 0.1, subsidy.amountRange.max);
    } else if (subsidy.amountRange.type === 'variable') {
      // 中間値を使用
      estimatedAmount = (subsidy.amountRange.min + subsidy.amountRange.max) / 2;
    }

    // 申請難易度の判定
    let applicationDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (subsidy.requiredDocuments.length <= 2) {
      applicationDifficulty = 'easy';
    } else if (subsidy.requiredDocuments.length >= 4) {
      applicationDifficulty = 'hard';
    }

    // 採択確率の計算（成功率とマッチスコアを考慮）
    const adoptionProbability = Math.min(
      100,
      (subsidy.successRate || 50) * (matchScore / 100)
    );

    matches.push({
      subsidy,
      matchScore: Math.max(0, Math.min(100, matchScore)),
      matchReasons,
      estimatedAmount,
      applicationDifficulty,
      adoptionProbability,
    });
  }

  // マッチスコアでソート
  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * AIを使って申請書類の下書きを生成
 */
export const generateApplicationDraft = async (
  subsidy: Subsidy,
  profile: BusinessProfile
): Promise<ApplicationDraft> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
あなたは日本の補助金申請の専門家です。以下の情報を基に、補助金申請書類の下書きを作成してください。

【補助金情報】
- 名称: ${subsidy.name}
- 説明: ${subsidy.description}
- カテゴリ: ${subsidy.category}
- 必要書類: ${subsidy.requiredDocuments.join(', ')}

【事業者情報】
- 事業形態: ${profile.businessType === 'sole_proprietor' ? '個人事業主' : '法人'}
- 業種: ${profile.industry}
- 年間売上: ¥${profile.revenue.toLocaleString()}
- 従業員数: ${profile.employeeCount}名
- 設立年: ${profile.establishedYear}年

【タスク】
申請書類の各セクションについて、具体的な記載例と記入のコツを提供してください。

以下のJSON形式で回答してください：
{
  "sections": [
    {
      "title": "セクション名",
      "content": "記載例（具体的な文章）",
      "tips": ["記入のコツ1", "記入のコツ2"]
    }
  ],
  "checklist": ["確認事項1", "確認事項2"],
  "estimatedCompletionTime": "所要時間の目安"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        subsidyId: subsidy.id,
        subsidyName: subsidy.name,
        ...parsed,
      };
    }

    // フォールバック
    return generateFallbackDraft(subsidy, profile);
  } catch (error) {
    console.error('申請書類下書き生成エラー:', error);
    return generateFallbackDraft(subsidy, profile);
  }
};

/**
 * フォールバック: 基本的な申請書類下書き
 */
const generateFallbackDraft = (
  subsidy: Subsidy,
  profile: BusinessProfile
): ApplicationDraft => {
  return {
    subsidyId: subsidy.id,
    subsidyName: subsidy.name,
    sections: [
      {
        title: '事業概要',
        content: `当社は${profile.industry}を主な事業としており、${new Date().getFullYear() - profile.establishedYear}年の実績があります。年間売上は約${(profile.revenue / 10000).toFixed(0)}万円、従業員${profile.employeeCount}名で事業を展開しております。`,
        tips: [
          '事業の特徴や強みを具体的に記載してください',
          '数値データを用いて客観性を持たせましょう',
        ],
      },
      {
        title: '補助事業の目的',
        content: `本補助金を活用し、${subsidy.category}に取り組むことで、事業の競争力強化と持続的な成長を実現します。`,
        tips: [
          '補助金の趣旨に沿った目的を明確に記載してください',
          '具体的な成果目標を数値で示すと効果的です',
        ],
      },
      {
        title: '事業計画',
        content: '【記載例】\n1. 現状分析\n2. 課題の特定\n3. 解決策の提案\n4. 実施スケジュール\n5. 期待される効果',
        tips: [
          '実現可能性の高い計画を立ててください',
          'スケジュールは具体的な日程で記載しましょう',
        ],
      },
    ],
    checklist: [
      '必要書類がすべて揃っているか確認',
      '数値データに誤りがないか確認',
      '申請期限を確認',
      '認定支援機関の確認書（必要な場合）',
    ],
    estimatedCompletionTime: '約3-5時間',
  };
};

/**
 * 採択確率をAIで予測
 */
export const predictAdoptionProbability = async (
  subsidy: Subsidy,
  profile: BusinessProfile,
  applicationDraft: ApplicationDraft
): Promise<{
  probability: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
あなたは補助金審査の専門家です。以下の情報を基に、この申請が採択される確率を予測してください。

【補助金情報】
- 名称: ${subsidy.name}
- 平均採択率: ${subsidy.successRate}%

【事業者情報】
- 事業形態: ${profile.businessType === 'sole_proprietor' ? '個人事業主' : '法人'}
- 業種: ${profile.industry}
- 年間売上: ¥${profile.revenue.toLocaleString()}

【申請書類の内容】
${applicationDraft.sections.map(s => `${s.title}: ${s.content.substring(0, 100)}...`).join('\n')}

以下のJSON形式で回答してください：
{
  "probability": 採択確率（0-100）,
  "strengths": ["強み1", "強み2"],
  "weaknesses": ["弱み1", "弱み2"],
  "improvements": ["改善提案1", "改善提案2"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // フォールバック
    return {
      probability: subsidy.successRate || 50,
      strengths: ['事業計画が明確'],
      weaknesses: ['実績データが不足'],
      improvements: ['具体的な数値目標を追加してください'],
    };
  } catch (error) {
    console.error('採択確率予測エラー:', error);
    return {
      probability: subsidy.successRate || 50,
      strengths: ['事業計画が明確'],
      weaknesses: ['実績データが不足'],
      improvements: ['具体的な数値目標を追加してください'],
    };
  }
};

/**
 * 申請期限までの日数を計算
 */
export const getDaysUntilDeadline = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * 申請期限の緊急度を判定
 */
export const getDeadlineUrgency = (deadline: string): 'urgent' | 'soon' | 'normal' => {
  const days = getDaysUntilDeadline(deadline);
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'normal';
};
