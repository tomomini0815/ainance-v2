import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    Calendar,
    FileText,
    Calculator,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    ClipboardList,
    Banknote,
    BookOpen,
    HelpCircle,
    ArrowRight,
    Clock,
    Users,
    Lightbulb,
    CheckSquare,
    CircleDot,
} from 'lucide-react';

// FAQアイテムの型
interface FAQItem {
    question: string;
    answer: string;
}

const CorporateTaxGuidePage: React.FC = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [openStep, setOpenStep] = useState<number | null>(0);

    // ステップバイステップガイド
    const stepByStepGuide = [
        {
            step: 1,
            title: '決算整理を行う',
            duration: '決算日の1ヶ月前〜決算日',
            description: '決算日が近づいたら、会計データの整理と確認を行います。',
            details: [
                {
                    task: '売掛金・買掛金の確認',
                    explanation: '未回収の売掛金、未払いの買掛金を洗い出し、正確な金額を把握します。',
                    tip: 'Ainanceの取引履歴から売掛金・買掛金を確認できます。',
                },
                {
                    task: '棚卸資産（在庫）の確認',
                    explanation: '商品や原材料の在庫数と金額を確認します。期末の棚卸表を作成します。',
                    tip: '在庫がある場合は、実際に数えて金額を計算してください。',
                },
                {
                    task: '減価償却費の計算',
                    explanation: 'パソコン、車両、備品などの固定資産について、減価償却費を計算します。',
                    tip: '10万円未満の備品は消耗品費として一括計上できます。',
                },
                {
                    task: '未払費用・前払費用の計上',
                    explanation: '当期に発生した費用で未払いのもの、来期分を前払いしたものを整理します。',
                    tip: '例：決算月の電気代は翌月請求ですが、当期の費用として計上します。',
                },
            ],
        },
        {
            step: 2,
            title: '決算書を作成する',
            duration: '決算日後1〜2週間',
            description: '会計データをもとに、決算書（財務諸表）を作成します。',
            details: [
                {
                    task: '損益計算書（P/L）の作成',
                    explanation: '1年間の収益と費用をまとめ、最終的な利益（または損失）を計算します。',
                    tip: 'Ainanceの法人税申告サポートで自動作成できます。',
                },
                {
                    task: '貸借対照表（B/S）の作成',
                    explanation: '会社の資産、負債、純資産の状況をまとめます。',
                    tip: '資産合計 ＝ 負債合計 ＋ 純資産 となれば正しいです。',
                },
                {
                    task: '株主資本等変動計算書の作成',
                    explanation: '純資産（資本金、利益剰余金など）の変動を記載します。',
                    tip: '配当を行っていない場合は、当期純利益の増減のみで簡単です。',
                },
                {
                    task: '勘定科目内訳明細書の作成',
                    explanation: '主要な勘定科目の内訳を記載した書類です。売掛金、買掛金、借入金などの相手先と金額を記載します。',
                    tip: '取引先ごとの残高を一覧にします。',
                },
            ],
        },
        {
            step: 3,
            title: '法人税申告書を作成する',
            duration: '決算書作成後〜申告期限の1週間前',
            description: '決算書をもとに、法人税申告書（別表）を作成します。',
            details: [
                {
                    task: '別表一（法人税額の計算）',
                    explanation: '法人税額を計算する最も重要な書類です。所得金額と税額を記載します。',
                    tip: '所得金額 × 税率 ＝ 法人税額 の計算を行います。',
                },
                {
                    task: '別表四（所得の金額の計算）',
                    explanation: '会計上の利益を税務上の所得に調整する書類です。',
                    tip: '交際費の損金不算入などの調整を行います。',
                },
                {
                    task: '別表五（一）（利益積立金額の計算）',
                    explanation: '過去からの利益の積み立て状況を記載します。',
                    tip: '前期の申告書を参照して作成します。',
                },
                {
                    task: '別表十五（交際費等の損金算入額の計算）',
                    explanation: '交際費がある場合に必要です。中小法人は年800万円まで損金算入可能です。',
                    tip: '飲食費は1人5,000円以下なら会議費として全額損金算入できます。',
                },
            ],
        },
        {
            step: 4,
            title: '地方税申告書を作成する',
            duration: '法人税申告書と同時',
            description: '法人住民税と法人事業税の申告書を作成します。',
            details: [
                {
                    task: '法人都道府県民税申告書',
                    explanation: '都道府県に納める法人住民税の申告書です。法人税割と均等割があります。',
                    tip: '法人税割は法人税額をもとに計算します。均等割は資本金と従業員数で決まります。',
                },
                {
                    task: '法人市町村民税申告書',
                    explanation: '市区町村に納める法人住民税の申告書です。',
                    tip: '東京23区は特別区なので、都民税に一括で申告します。',
                },
                {
                    task: '法人事業税申告書',
                    explanation: '事業を行っている都道府県に納める税金です。所得に応じて税率が異なります。',
                    tip: '事業税は翌期に損金算入できます。',
                },
            ],
        },
        {
            step: 5,
            title: '申告書を提出する',
            duration: '申告期限まで',
            description: '作成した申告書を税務署・都道府県・市区町村に提出します。',
            details: [
                {
                    task: '提出方法を選ぶ',
                    explanation: '①e-Tax（電子申告）、②郵送、③窓口持参 の3つの方法があります。',
                    tip: 'e-Taxが最も便利です。控えがすぐに取得でき、郵送費もかかりません。',
                },
                {
                    task: '提出先を確認',
                    explanation: '本店所在地を管轄する税務署に提出します。地方税は都道府県・市区町村へ。',
                    tip: '複数の都道府県に事業所がある場合は、それぞれに申告が必要です。',
                },
                {
                    task: '控えを保管する',
                    explanation: '提出した申告書の控えは必ず保管します。7年間の保存義務があります。',
                    tip: '電子申告の場合は、受信通知（受付番号）も保存してください。',
                },
            ],
        },
        {
            step: 6,
            title: '税金を納付する',
            duration: '申告期限と同日まで',
            description: '計算した税金を納付します。申告と納付の期限は同じです。',
            details: [
                {
                    task: '納付方法を選ぶ',
                    explanation: '①電子納税（ダイレクト納付）、②インターネットバンキング、③銀行窓口、④コンビニ の方法があります。',
                    tip: 'ダイレクト納付を設定しておくと、申告時に自動引落しできて便利です。',
                },
                {
                    task: '納付期限を厳守',
                    explanation: '期限を過ぎると延滞税がかかります。1日でも遅れると延滞税が発生します。',
                    tip: '資金繰りが厳しい場合は、事前に税務署に相談して分割納付の申請ができます。',
                },
                {
                    task: '納付した証拠を保管',
                    explanation: '納付書の領収証書や電子納税の記録を保管します。',
                    tip: '通帳のコピーも証拠になります。',
                },
            ],
        },
    ];

    // 申告スケジュール（具体例）
    const scheduleExample = {
        fiscalEnd: '3月31日',
        taxDeadline: '5月31日',
        timeline: [
            { date: '4月上旬', task: '決算整理仕訳の入力（減価償却費、未払費用など）' },
            { date: '4月中旬', task: '決算書（P/L、B/S）の作成' },
            { date: '4月下旬', task: '法人税申告書（別表）の作成' },
            { date: '5月上旬', task: '地方税申告書の作成' },
            { date: '5月中旬', task: '最終確認・修正' },
            { date: '5月31日まで', task: '申告書提出・税金納付' },
        ],
    };

    // 初心者向けチェックリスト
    const beginnerChecklist = [
        { item: '会計ソフト（Ainance）に1年間の取引を入力済み', critical: true },
        { item: '銀行口座の残高と会計データが一致している', critical: true },
        { item: '固定資産（10万円以上の備品等）のリストがある', critical: false },
        { item: '棚卸資産（在庫）の期末残高を把握している', critical: false },
        { item: '未払いの費用（電気代、保険料など）を確認済み', critical: false },
        { item: '前期の申告書の控えがある（2期目以降）', critical: true },
        { item: 'e-Taxの利用者識別番号を取得済み', critical: false },
        { item: '決算日から2ヶ月以内の日程を確保済み', critical: true },
    ];

    // 費用目安
    const costEstimates = [
        {
            method: '自分で申告する場合',
            cost: '0円〜数千円',
            description: '会計ソフト代と印刷代程度',
            pros: ['費用が安い', '会社の数字を深く理解できる'],
            cons: ['時間がかかる', '専門知識が必要', 'ミスのリスク'],
        },
        {
            method: '税理士に依頼する場合',
            cost: '年間15万円〜50万円',
            description: '記帳代行込みの顧問契約の場合',
            pros: ['正確な申告', '節税アドバイス', '税務調査の対応'],
            cons: ['費用がかかる', '丸投げすると数字がわからなくなる'],
        },
        {
            method: 'Ainance + 税理士の確認',
            cost: '決算のみ5万円〜15万円',
            description: 'Ainanceで作成したデータを税理士に確認してもらう',
            pros: ['費用を抑えられる', '自社で数字を把握できる', '専門家のチェックで安心'],
            cons: ['年間を通じたアドバイスは受けにくい'],
        },
    ];

    // FAQ
    const faqs: FAQItem[] = [
        {
            question: '法人設立1年目で赤字ですが、申告は必要ですか？',
            answer: 'はい、必ず申告が必要です。赤字（欠損金）がある場合でも申告することで、①その赤字を最大10年間繰り越して将来の黒字と相殺できます（青色申告の場合）、②法人住民税の均等割（最低7万円程度）を納付する必要があります。申告しないと繰越欠損金の恩恵を受けられず、無申告加算税のペナルティも課される可能性があります。',
        },
        {
            question: '決算日から2ヶ月以内に間に合わない場合はどうすればいいですか？',
            answer: 'まず、事前に「申告期限の延長の特例の申請書」を提出していれば、法人税の申告期限を1ヶ月延長できます（消費税は延長不可）。ただし、納付期限は延長されないため、見込み額を先に納付する必要があります。届出なしで期限を過ぎると、無申告加算税（15%〜20%）と延滞税（年2.4%〜8.7%）がかかります。どうしても間に合わない場合は、期限内に「とりあえずの申告」を行い、後日修正申告することも一つの方法です。',
        },
        {
            question: '別表は全部で何枚作成する必要がありますか？',
            answer: '会社の状況により異なりますが、最低限必要なのは4〜6枚程度です。【必須】別表一（法人税額の計算）、別表四（所得金額の計算）、別表五（一）（利益積立金額）、別表五（二）（租税公課の納付状況）【該当する場合】別表十五（交際費）、別表十六（減価償却）、別表七（欠損金の繰越）など。Ainanceの法人税申告サポートで必要な別表を自動判定しています。',
        },
        {
            question: '消費税の申告も必要ですか？',
            answer: '基準期間（原則として前々事業年度）の課税売上高が1,000万円を超える場合、消費税の課税事業者となり申告が必要です。設立1・2期目は原則として免税ですが、資本金1,000万円以上で設立した場合や、特定期間の売上高が1,000万円を超えた場合は課税事業者になります。また、インボイス発行事業者として登録した場合も課税事業者となります。',
        },
        {
            question: '税理士に依頼せず自分で申告しても大丈夫ですか？',
            answer: '法律上は問題ありません。ただし、法人税申告は個人の確定申告より複雑で、別表の作成には専門知識が必要です。【自分で申告に向いているケース】取引がシンプルで売上1,000万円未満、Ainanceで正確に記帳できている、時間に余裕がある。【税理士に依頼した方が良いケース】売上が大きい、取引が複雑、節税対策をしたい、税務調査が心配。迷った場合は、まずAinanceで作成したデータを税理士に見せて相談することをおすすめします。',
        },
        {
            question: 'e-Tax（電子申告）で申告するにはどうすればいいですか？',
            answer: '【事前準備】①e-Taxの利用者識別番号を取得（開始届出をオンラインで提出）、②電子証明書を準備（マイナンバーカードまたは法人の電子証明書）、③e-Taxソフトをインストールまたはe-Tax（WEB版）を利用。【申告手順】①申告書データを作成、②電子署名を付与、③送信、④受信通知を確認・保存。初めてでも国税庁のマニュアルを見ながら30分〜1時間で送信できます。',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* ヘッダー */}
                <div className="flex items-center mb-8">
                    <Link to="/corporate-tax" className="mr-4 p-2 rounded-lg hover:bg-surface-highlight transition-colors">
                        <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                            <BookOpen className="w-7 h-7 text-primary" />
                            法人税申告ガイド
                        </h1>
                        <p className="text-text-muted mt-1">初めてでもわかる法人税申告の完全ガイド</p>
                    </div>
                </div>

                {/* 初心者向けメッセージ */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main mb-2">初めて法人税申告をされる方へ</h2>
                            <p className="text-text-secondary leading-relaxed">
                                法人税申告は難しそうに見えますが、順番に進めれば必ず完了できます。
                                このガイドでは、決算から申告・納付まで、<strong className="text-text-main">6つのステップ</strong>に分けて具体的に解説します。
                                Ainanceの法人税申告サポートと組み合わせることで、より簡単に申告書を作成できます。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 申告スケジュール例 */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary" />
                        申告スケジュール例（{scheduleExample.fiscalEnd}決算の場合）
                    </h2>
                    <div className="bg-surface border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                            <Clock className="w-5 h-5 text-error" />
                            <span className="font-bold text-text-main">申告・納付期限：</span>
                            <span className="text-error font-bold">{scheduleExample.taxDeadline}</span>
                        </div>
                        <div className="space-y-3">
                            {scheduleExample.timeline.map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-24 text-sm font-medium text-primary flex-shrink-0">{item.date}</div>
                                    <ArrowRight className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
                                    <div className="text-text-main">{item.task}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ステップバイステップガイド */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-primary" />
                        ステップバイステップガイド
                    </h2>
                    <div className="space-y-4">
                        {stepByStepGuide.map((step, index) => (
                            <div key={index} className="bg-surface border border-border rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenStep(openStep === index ? null : index)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-highlight transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                            {step.step}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-main">{step.title}</p>
                                            <p className="text-sm text-text-muted">{step.duration}</p>
                                        </div>
                                    </div>
                                    {openStep === index ? (
                                        <ChevronUp className="w-5 h-5 text-text-muted flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
                                    )}
                                </button>
                                {openStep === index && (
                                    <div className="px-5 pb-5 pt-0 border-t border-border">
                                        <p className="text-text-secondary mt-4 mb-4">{step.description}</p>
                                        <div className="space-y-4">
                                            {step.details.map((detail, i) => (
                                                <div key={i} className="bg-surface-highlight rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <CircleDot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-text-main">{detail.task}</p>
                                                            <p className="text-sm text-text-secondary mt-1">{detail.explanation}</p>
                                                            <div className="flex items-start gap-2 mt-2 bg-surface border border-border rounded-md p-2">
                                                                <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                                <p className="text-sm text-text-secondary">{detail.tip}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 初心者チェックリスト */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-primary" />
                        申告前チェックリスト
                    </h2>
                    <div className="bg-surface border border-border rounded-xl p-5">
                        <div className="space-y-3">
                            {beginnerChecklist.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${item.critical ? 'border-error' : 'border-border'
                                        }`}>
                                        <CheckCircle className={`w-4 h-4 ${item.critical ? 'text-error' : 'text-text-muted'}`} />
                                    </div>
                                    <span className="text-text-main">{item.item}</span>
                                    {item.critical && (
                                        <span className="text-xs bg-error-light text-error px-2 py-0.5 rounded font-medium">必須</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 費用の目安 */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-primary" />
                        費用の目安
                    </h2>
                    <div className="grid gap-4">
                        {costEstimates.map((estimate, index) => (
                            <div key={index} className="bg-surface border border-border rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-text-main">{estimate.method}</h3>
                                    <span className="text-primary font-bold text-lg">{estimate.cost}</span>
                                </div>
                                <p className="text-sm text-text-secondary mb-3">{estimate.description}</p>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-primary font-medium mb-1">メリット</p>
                                        <ul className="space-y-1">
                                            {estimate.pros.map((pro, i) => (
                                                <li key={i} className="text-sm text-text-secondary flex items-start gap-1">
                                                    <span className="text-primary">✓</span>
                                                    {pro}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium mb-1">デメリット</p>
                                        <ul className="space-y-1">
                                            {estimate.cons.map((con, i) => (
                                                <li key={i} className="text-sm text-text-secondary flex items-start gap-1">
                                                    <span className="text-text-muted">×</span>
                                                    {con}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 法人税率表 */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-primary" />
                        法人税率（2024/2025年度）
                    </h2>
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        <div className="bg-surface-highlight px-5 py-3 border-b border-border">
                            <h3 className="font-bold text-text-main">中小法人（資本金1億円以下）※ほとんどの会社はこちら</h3>
                        </div>
                        <div className="divide-y divide-border">
                            <div className="flex items-center justify-between px-5 py-3">
                                <span className="text-text-secondary">年800万円以下の部分</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-primary text-lg">15%</span>
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">軽減税率</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-5 py-3">
                                <span className="text-text-secondary">年800万円を超える部分</span>
                                <span className="font-bold text-text-main text-lg">23.2%</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-text-secondary">
                            <p><strong className="text-text-main">計算例：</strong>所得金額が1,000万円の場合</p>
                            <p className="mt-1">
                                800万円 × 15% ＝ 120万円<br />
                                200万円 × 23.2% ＝ 46.4万円<br />
                                <strong className="text-primary">法人税額 ＝ 166.4万円</strong>
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-primary" />
                        よくある質問
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-surface border border-border rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-highlight transition-colors"
                                >
                                    <span className="font-medium text-text-main pr-4">{faq.question}</span>
                                    {openFAQ === index ? (
                                        <ChevronUp className="w-5 h-5 text-text-muted flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
                                    )}
                                </button>
                                {openFAQ === index && (
                                    <div className="px-4 pb-4 pt-0">
                                        <p className="text-text-secondary leading-relaxed border-t border-border pt-4 whitespace-pre-line">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 外部リンク */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-text-main mb-4">関連リンク</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <a
                            href="https://www.e-tax.nta.go.jp/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-primary transition-colors group"
                        >
                            <div>
                                <p className="font-medium text-text-main group-hover:text-primary">e-Taxポータル</p>
                                <p className="text-sm text-text-muted">電子申告・納税システム</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-text-muted group-hover:text-primary" />
                        </a>
                        <a
                            href="https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/hojin/mokuji.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-primary transition-colors group"
                        >
                            <div>
                                <p className="font-medium text-text-main group-hover:text-primary">国税庁 法人税関係</p>
                                <p className="text-sm text-text-muted">申告書・届出書の様式</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-text-muted group-hover:text-primary" />
                        </a>
                        <a
                            href="https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/hojin.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-primary transition-colors group"
                        >
                            <div>
                                <p className="font-medium text-text-main group-hover:text-primary">法人税について調べる</p>
                                <p className="text-sm text-text-muted">国税庁の解説ページ</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-text-muted group-hover:text-primary" />
                        </a>
                        <a
                            href="https://www.eltax.lta.go.jp/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-primary transition-colors group"
                        >
                            <div>
                                <p className="font-medium text-text-main group-hover:text-primary">eLTAX（地方税ポータル）</p>
                                <p className="text-sm text-text-muted">地方税の電子申告</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-text-muted group-hover:text-primary" />
                        </a>
                    </div>
                </section>

                {/* CTAボタン */}
                <div className="text-center space-y-4">
                    <Link
                        to="/corporate-tax"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        <Calculator className="w-5 h-5 mr-2" />
                        法人税申告サポートを始める
                    </Link>
                    <p className="text-sm text-text-muted">
                        Ainanceで日々の取引を記録していれば、決算書と申告書の作成がスムーズです。
                    </p>
                </div>
            </main>
        </div>
    );
};

export default CorporateTaxGuidePage;
