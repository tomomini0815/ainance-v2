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
  strategicSummary?: string;
  strategicAdvice?: string[];
  checklist: string[];
  estimatedCompletionTime: string;
}

export interface WizardStep {
  id: string;
  title: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    description?: string;
    suggestedContent?: string;
  }>;
  allowCustom?: boolean;
  sectionTitle?: string; // 生成されるセクションのタイトル
}

/**
 * サンプル補助金データ（実際にはSupabaseから取得）
 */
const SAMPLE_SUBSIDIES: Subsidy[] = [
  {
    id: '1',
    name: 'ものづくり補助金',
    description: '中小企業・小規模事業者等が取り組む革新的サービス開発・試作品開発・生産プロセスの改善を行うための設備投資等を支援。',
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
    name: 'IT導入補助金（通常枠）',
    description: '中小企業・小規模事業者等のITツール導入による業務効率化・売上アップを支援。ソフトウェアやクラウド利用料が対象。',
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
    requiredDocuments: ['ITツール導入計画書', '見積書', '納税証明書'],
    processingTime: '約3ヶ月',
    successRate: 65,
  },
  {
    id: '3',
    name: '小規模事業者持続化補助金（一般枠）',
    description: '販路開拓や業務効率化に取り組む小規模事業者を支援。個人事業主の採択実績が非常に豊富。',
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
    description: '新分野展開、業態転換、事業・業種転換など、思い切った事業の再構築を支援（大規模投資向け）。',
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
    name: '東京都 創業助成金',
    description: '都内で創業予定または創業後5年未満の方を対象。賃借料、広告費、人件費等を幅広く支援。',
    eligibilityCriteria: {
      businessTypes: ['sole_proprietor', 'corporation'],
      regions: ['東京都'],
    },
    amountRange: {
      min: 1000000,
      max: 4000000,
      type: 'percentage',
    },
    deadline: '2026-06-30',
    category: '創業支援',
    applicationUrl: 'https://www.startup-station.jp/',
    requiredDocuments: ['創業計画書', '資金計画書', '履歴事項全部証明書'],
    processingTime: '約5ヶ月',
    successRate: 55,
  },
  {
    id: '6',
    name: 'フリーランス・個人事業主活動支援給付',
    description: 'デジタルスキルの習得や機材導入を行う個人事業主・フリーランスを支援。申請が非常に簡略化されています。',
    eligibilityCriteria: {
      businessTypes: ['sole_proprietor'],
      maxRevenue: 10000000,
    },
    amountRange: {
      min: 100000,
      max: 500000,
      type: 'fixed',
    },
    deadline: '2026-05-15',
    category: '活動支援',
    applicationUrl: 'https://www.example.go.jp/freelance-support',
    requiredDocuments: ['活動報告書', '身分証明書'],
    processingTime: '約1ヶ月',
    successRate: 85,
  }
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
      matchScore += 30;
      if (profile.businessType === 'sole_proprietor') {
        matchReasons.push('個人事業主でも申請可能な枠です');
      } else {
        matchReasons.push('法人格を活かした申請が可能です');
      }
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
      matchScore += 15;
      matchReasons.push('売上規模が要件に適合しています');
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
      matchReasons.push('従業員数が規模に適合しています');
    }

    // 業種のチェック
    if (subsidy.eligibilityCriteria.industries) {
      if (subsidy.eligibilityCriteria.industries.includes(profile.industry) ||
          subsidy.eligibilityCriteria.industries.includes('全業種') ||
          subsidy.eligibilityCriteria.industries.includes('IT')) {
        matchScore += 25;
        matchReasons.push('業種が重点対象に該当します');
      }
    } else {
      matchScore += 10;
    }

    // 地域のチェック
    if (subsidy.eligibilityCriteria.regions) {
      if (subsidy.eligibilityCriteria.regions.includes(profile.region)) {
        matchScore += 15;
        matchReasons.push('対象地域（' + profile.region + '）の公募です');
      }
    }

    // 設立年数による加点
    const yearsInBusiness = new Date().getFullYear() - profile.establishedYear;
    if (subsidy.category === '創業支援' && yearsInBusiness <= 5) {
      matchScore += 20;
      matchReasons.push('創業初期の支援が手厚い補助金です');
    }

    // 推定金額の計算
    let estimatedAmount = subsidy.amountRange.min;
    if (subsidy.amountRange.type === 'percentage') {
      estimatedAmount = Math.min(profile.revenue * 0.15, subsidy.amountRange.max);
    } else if (subsidy.amountRange.type === 'variable') {
      estimatedAmount = (subsidy.amountRange.min + subsidy.amountRange.max) / 3;
    }

    // 申請難易度の判定
    let applicationDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (subsidy.requiredDocuments.length <= 2) {
      applicationDifficulty = 'easy';
    } else if (subsidy.requiredDocuments.length >= 5) {
      applicationDifficulty = 'hard';
    }

    // 採択確率の計算（成功率とマッチスコアを考慮）
    const adoptionProbability = Math.min(
      95,
      (subsidy.successRate || 50) * (matchScore / 80)
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
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          subsidyId: subsidy.id,
          subsidyName: subsidy.name,
          ...parsed,
        };
      } catch (err) {
        console.error('Draft generation JSON error:', err);
      }
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
/**
 * ウィザードの各ステップ（質問と選択肢）を生成
 */
// フォールバック用のステップ定義
const FALLBACK_STEPS: WizardStep[] = [
  {
    id: 'step1',
    title: '事業計画の骨子',
    sectionTitle: '１．事業計画の概要と目的',
    question: '今回の補助事業で解決したい具体的な経営課題と、達成したい数値目標は何ですか？',
    options: [
      { id: '1', label: '生産性向上（労働時間削減）', description: 'IT導入によるルーチン業務の自動化' },
      { id: '2', label: '新市場開拓（売上成長）', description: 'ECサイト展開による全国への販路拡大' },
      { id: '3', label: 'コスト最適化', description: '新設備導入による原材料ロスの低減' },
    ],
    allowCustom: true,
  },
  {
    id: 'step2',
    title: '市場のニーズと強み',
    sectionTitle: '２．市場の状況と自社の優位性',
    question: 'ターゲットとする市場のニーズと、競合他社に対する貴社の独自の強みは何ですか？',
    options: [
      { id: '1', label: '独自の技術力・ノウハウ', description: '長年培った専門的な製造技術' },
      { id: '2', label: '地域密着のネットワーク', description: '既存顧客との強い信頼関係' },
      { id: '3', label: '高品質・高付加価値', description: '他社にはない独自のデザインや機能' },
    ],
    allowCustom: true,
  },
  {
    id: 'step3',
    title: '期待される成果',
    sectionTitle: '３．補助事業の成果と波及効果',
    question: '事業実施後、3〜5年でどのような定量的な成果（利益率、付加価値額など）を見込んでいますか？',
    options: [
      { id: '1', label: '付加価値額の年率3%以上向上', description: '生産性アップによる収益性改善' },
      { id: '2', label: '新規顧客数の大幅増加', description: '認知度向上による継続的な集客' },
      { id: '3', label: '地域雇用の創出', description: '事業拡大に伴う新規採用の計画' },
    ],
    allowCustom: true,
  }
];

export const generateWizardSteps = async (
  subsidy: Subsidy,
  profile: BusinessProfile
): Promise<WizardStep[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
あなたは日本国内の補助金申請（再構築補助金、ものづくり補助金、IT導入補助金、持続化補助金など）の採択を熟知した専門家です。
「${subsidy.name}」への申請を検討している事業者（${profile.industry}、売上¥${profile.revenue.toLocaleString()}）に対して、
採択率を最大化するための申請書類を作成するための「戦略的な質問」を3つ作成してください。

質問を作成する際の重要ポイント：
1. 定量的な目標（KPI）: 「売上○%アップ」「コスト○時間削減」などを引き出す質問。
2. 政策目的への合致: この補助金の趣旨（例：デジタルトランスフォーメーション、地域活性化など）を意識させる質問。
3. 競合優位性: なぜ「自社」でなければならないのか、独自の強みを具体化する質問。

以下のJSON形式で回答してください：
[
  {
    "id": "step1",
    "title": "事業計画の骨子",
    "sectionTitle": "１．補助事業の目的と具体的な課題",
    "question": "（ここに戦略的な質問：例 解決したい課題と具体的な数値目標は何ですか？）",
    "options": [
      { "id": "opt1", "label": "...", "description": "...", "suggestedContent": "..." }
    ],
    "allowCustom": true
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const steps = JSON.parse(jsonMatch[0]);
      if (Array.isArray(steps) && steps.length > 0) {
        return steps;
      }
    }

    console.warn('ウィザード生成: JSONパース失敗または空配列のためフォールバックを使用します');
    return FALLBACK_STEPS;
  } catch (error) {
    console.error('ウィザードステップ生成エラー:', error);
    return FALLBACK_STEPS;
  }
};

/**
 * 特定のセクションの下書きを生成
 */
export const generateSectionDraft = async (
  subsidy: Subsidy,
  profile: BusinessProfile,
  step: WizardStep,
  answer: string
): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `
あなたは補助金採択の審査員を納得させる申請書作成のプロフェッショナルです。
補助金「${subsidy.name}」の「${step.sectionTitle}」セクションを、以下のユーザー回答に基づき「採択されるレベル」まで昇華させて作成してください。

【制約条件】
1. Before/Afterの明確化: 現状の課題と、実施後の改善効果を対比させてください。
2. 数値的根拠: 可能な限り「労働時間20%削減」「売上15%向上」といった具体的な数値を含めてください。
3. 説得力のある文体: 専門用語は適切に使いつつ、第三者が読んでも分かりやすい論理的な文章（です・ます調）にしてください。
4. 政策 alignment: 地域経済への波及効果や、業界全体のDX推進など、社会的な意義にも触れてください。

【事業者情報】
業種: ${profile.industry}
売上: ${profile.revenue}円

【質問】
${step.question}

【ユーザー回答】
${answer}

出力は作成した文章のみを返してください。挨拶や説明は不要です。
        `;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.trim();
    } catch (error: any) {
        // APIキーが無効な場合などはモックを使用する（デモ用）
        if (error.message?.includes('API key not valid') || error.message?.includes('400')) {
            console.warn('APIキーが無効なため、モックデータを使用します');
            return generateMockSectionDraft(step, answer);
        }

        console.error('セクション下書き生成エラー詳細:', {
            message: error.message,
            code: error.code,
            details: error.details,
            stepId: step.id,
            sectionTitle: step.sectionTitle
        });
        return `（${step.sectionTitle}の生成に失敗しました。詳細を手動で入力してください。）\n\n【エラー原因】\n${error.message || '不明なエラー'}\n\n【元の回答】\n${answer}`;
    }
}

/**
 * モックデータを生成する（APIキー無効時など用）
 */
const generateMockSectionDraft = (step: WizardStep, answer: string): string => {
    switch (step.id) {
        case 'step1':
            return `【現状と目的】\n現在、${answer}という課題に直面しており、業務効率の停滞が顕著となっています。本事業を実施することで、IT導入により手作業を自動化し、月間労働時間を約25%削減（推定15時間）することを目指します。これにより、付加価値の高い業務へリソースを集中させ、持続的な成長基盤を構築します。`;
        case 'step2':
            return `【市場分析と独自性】\n市場環境を分析した結果、${answer}に対する需要が高まっています。近隣他社との差別化要因として、当社の強みである専門的ノウハウを最大限活用し、独自のサービス提供モデルを確立します。これは顧客満足度の向上と、リピート率10%改善に直結する戦略的な取り組みです。`;
        case 'step3':
            return `【事業成果の見込み】\n本事業の実施により、${answer}という具体的な波及効果を期待しています。3年後には営業利益率を現在の水準から5%ポイント向上させる計画であり、これは地域経済への雇用創出や、業界におけるデジタルトランスフォーメーションのモデルケースとなることを確信しております。`;
        default:
            return `${answer}に関する具体的な実行計画を策定します。現状の課題解決、目標数値の達成、そして将来の事業拡大という一貫したストーリーに基づき、実効性の高いプロジェクトを推進いたします。`;
    }
}

/**
 * ウィザードでの選択結果から最終的な下書きを生成（後方互換性のため残すまたは統合）
 */
export const generateDraftFromWizard = async (
  subsidy: Subsidy,
  profile: BusinessProfile,
  answers: Record<string, string>,
  sectionsContent?: Record<string, {title: string, content: string}>
): Promise<ApplicationDraft> => {
    // すでにセクションごとのコンテンツがある場合はそれを使用
    if (sectionsContent) {
        return {
            subsidyId: subsidy.id,
            subsidyName: subsidy.name,
            sections: Object.values(sectionsContent).map(s => ({
                title: s.title,
                content: s.content,
                tips: ['採択率を高めるために、具体的な数値目標が含まれていることを確認してください']
            })),
            strategicSummary: '本計画は「生産性の向上」と「市場優位性の確立」に重点を置いて構成されています。Before/Afterの数値対比により、審査員に事業の実効性を強くアピールします。',
            strategicAdvice: [
                '数値目標の根拠（見積書や市場データ）を準備しておきましょう',
                '地域経済への貢献（雇用創出など）を追記するとさらなる加点が期待できます',
                '既存事業とのシナジー（相乗効果）を強調してください'
            ],
            checklist: ['誤字脱字がないか確認', '具体的な数値が入っているか確認'],
            estimatedCompletionTime: '作成済み'
        };
    }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
補助金「${subsidy.name}」の申請書類を、以下のユーザーの回答に基づいて作成してください。

【ユーザーの回答】
${Object.entries(answers).map(([stepId, answer]) => `- ${stepId}: ${answer}`).join('\n')}

【事業者情報】
- 業種: ${profile.industry}
- 規模: 従業員${profile.employeeCount}名

以下のJSON形式で回答してください：
{
  "sections": [
    {
      "title": "セクション名",
      "content": "回答を反映した具体的な文章",
      "tips": ["コツ"]
    }
  ],
  "checklist": ["確認事項"],
  "estimatedCompletionTime": "約X時間",
  "strategicSummary": "全体的な戦略の要約（採択のポイント）",
  "strategicAdvice": ["改善のための具体的なアドバイス1", "アドバイス2"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          subsidyId: subsidy.id,
          subsidyName: subsidy.name,
          ...parsed,
        };
      } catch (err) {
        console.error('Wizard draft generation JSON error:', err);
      }
    }

    return generateFallbackDraft(subsidy, profile);
  } catch (error) {
    console.error('ウィザードからの下書き生成エラー:', error);
    return generateFallbackDraft(subsidy, profile);
  }
};
