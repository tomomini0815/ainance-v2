import React from 'react';

// 共通の色とスタイルの設定
const STROKE_COLOR = '#818cf8';      // インディゴ (indigo-400)
const LIGHT_BLUE = '#38bdf8';        // 水色 (sky-400)
const YELLOW_ACCENT = '#fbbf24';     // 黄色 (amber-400)
const BG_COLOR = '#0f172a';          // ダークカード背景色 (slate-900)

interface IllustrationProps {
  className?: string;
}

export const TaxReturnIllustration: React.FC<IllustrationProps> = ({ className }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* 後景：帳簿・スプレッドシート */}
    <rect x="70" y="20" width="50" height="70" rx="2" stroke={STROKE_COLOR} strokeWidth="2" fill={BG_COLOR} />
    <rect x="70" y="35" width="50" height="55" stroke={STROKE_COLOR} strokeWidth="2" fill={BG_COLOR} />
    <line x1="95" y1="35" x2="95" y2="90" stroke={STROKE_COLOR} strokeWidth="2" />
    <line x1="70" y1="50" x2="120" y2="50" stroke={STROKE_COLOR} strokeWidth="2" />
    <line x1="70" y1="65" x2="120" y2="65" stroke={STROKE_COLOR} strokeWidth="2" />
    <line x1="70" y1="80" x2="120" y2="80" stroke={STROKE_COLOR} strokeWidth="2" />
    {/* 前景：人物 */}
    <circle cx="50" cy="80" r="22" stroke={STROKE_COLOR} strokeWidth="2" fill={BG_COLOR} />
    <path d="M50 90C40 90 32 97 30 102H70C68 97 60 90 50 90Z" fill={YELLOW_ACCENT} stroke={STROKE_COLOR} strokeWidth="2" />
    <circle cx="50" cy="72" r="10" stroke={STROKE_COLOR} strokeWidth="2" fill={BG_COLOR} />
    {/* 髪など */}
    <path d="M40 70C40 65 45 60 50 60C55 60 60 65 60 70C60 67 55 65 50 65C45 65 40 67 40 70Z" fill={STROKE_COLOR} />
    {/* 点（目など） */}
    <circle cx="46" cy="71" r="1.5" fill={STROKE_COLOR} />
    <circle cx="54" cy="71" r="1.5" fill={STROKE_COLOR} />
  </svg>
);

export const CorporateAccountingIllustration: React.FC<IllustrationProps> = ({ className }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* ノートPC */}
    <rect x="30" y="30" width="100" height="65" rx="3" stroke={STROKE_COLOR} strokeWidth="2" fill={BG_COLOR} />
    <rect x="40" y="40" width="80" height="45" stroke={STROKE_COLOR} strokeWidth="2" fill={LIGHT_BLUE} fillOpacity="0.2" />
    <path d="M15 95C15 95 15 100 20 100H140C145 100 145 95 145 95H15Z" stroke={STROKE_COLOR} strokeWidth="2" fill={BG_COLOR} />
    {/* パネル内のUI */}
    <rect x="55" y="50" width="50" height="25" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
    <rect x="65" y="65" width="20" height="6" fill={LIGHT_BLUE} />
    <circle cx="95" cy="68" r="4" fill={YELLOW_ACCENT} />
    <circle cx="65" cy="56" r="1.5" fill={STROKE_COLOR} />
    <circle cx="70" cy="56" r="1.5" fill={STROKE_COLOR} />
    <circle cx="75" cy="56" r="1.5" fill={STROKE_COLOR} />
    {/* クラウド */}
    <path d="M100 40C100 30 110 25 120 25C130 25 130 30 135 30C145 30 145 40 140 45C140 50 120 50 120 50H100V40Z" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const ExpenseSettlementIllustration: React.FC<IllustrationProps> = ({ className }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* 右側：画面パネル */}
    <rect x="55" y="40" width="80" height="50" rx="2" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
    <rect x="65" y="55" width="60" height="25" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
    <rect x="75" y="65" width="20" height="6" fill={LIGHT_BLUE} />
    <circle cx="110" cy="68" r="4" fill={YELLOW_ACCENT} />
    <circle cx="72" cy="60" r="1.5" fill={STROKE_COLOR} />
    <circle cx="78" cy="60" r="1.5" fill={STROKE_COLOR} />
    <circle cx="84" cy="60" r="1.5" fill={STROKE_COLOR} />
    {/* 左側：レシート */}
    <path d="M30 30H60V90L55 85L50 90L45 85L40 90L35 85L30 90V30Z" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" strokeLinejoin="round" />
    {/* レシートの中身 */}
    <circle cx="45" cy="40" r="2" fill={STROKE_COLOR} />
    <circle cx="52" cy="40" r="2" fill={STROKE_COLOR} />
    <circle cx="38" cy="40" r="2" fill={STROKE_COLOR} />
    <line x1="38" y1="50" x2="52" y2="50" stroke={LIGHT_BLUE} strokeWidth="2" />
    <line x1="38" y1="58" x2="52" y2="58" stroke={LIGHT_BLUE} strokeWidth="2" />
    <line x1="38" y1="66" x2="52" y2="66" stroke={STROKE_COLOR} strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="38" y1="74" x2="52" y2="74" stroke={STROKE_COLOR} strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);

export const InvoiceIllustration: React.FC<IllustrationProps> = ({ className }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* 背面：書類 */}
    <path d="M65 25H105L120 40V80H65V25Z" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" strokeLinejoin="round" />
    <path d="M105 25V40H120" stroke={STROKE_COLOR} strokeWidth="2" strokeLinejoin="round" fill="none" />
    <line x1="75" y1="45" x2="100" y2="45" stroke={STROKE_COLOR} strokeWidth="1.5" />
    <line x1="75" y1="52" x2="110" y2="52" stroke={STROKE_COLOR} strokeWidth="1.5" />
    
    {/* メイン：封筒型の請求書フォルダー */}
    <rect x="40" y="60" width="70" height="40" rx="2" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
    <path d="M40 60C40 60 55 70 75 70C95 70 110 60 110 60" stroke={STROKE_COLOR} strokeWidth="2" fill={LIGHT_BLUE} fillOpacity="0.2" />
    <rect x="95" y="75" width="8" height="15" rx="1" fill={YELLOW_ACCENT} stroke={STROKE_COLOR} strokeWidth="2" />
    <line x1="50" y1="80" x2="70" y2="80" stroke={LIGHT_BLUE} strokeWidth="2" />
    <line x1="50" y1="88" x2="65" y2="88" stroke={LIGHT_BLUE} strokeWidth="2" />
    <circle cx="55" cy="72" r="3" fill={STROKE_COLOR} />
    
    {/* 右側：紙飛行機 */}
    <path d="M105 75L140 60L125 95L120 75L105 75Z" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" strokeLinejoin="round" />
    <line x1="120" y1="75" x2="140" y2="60" stroke={STROKE_COLOR} strokeWidth="2" />
  </svg>
);

export const DashboardIllustration: React.FC<IllustrationProps> = ({ className }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* メインパネル */}
    <rect x="30" y="25" width="100" height="70" rx="3" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
    <line x1="30" y1="40" x2="130" y2="40" stroke={STROKE_COLOR} strokeWidth="2" />
    {/* UIドット */}
    <circle cx="40" cy="32" r="2" fill={STROKE_COLOR} />
    <circle cx="47" cy="32" r="2" fill={STROKE_COLOR} />
    <circle cx="54" cy="32" r="2" fill={STROKE_COLOR} />
    {/* グラフ部分 */}
    <path d="M45 85V50H55V85H45Z" fill={YELLOW_ACCENT} stroke={STROKE_COLOR} strokeWidth="2" />
    <path d="M65 85V60H75V85H65Z" fill={LIGHT_BLUE} fillOpacity="0.5" stroke={STROKE_COLOR} strokeWidth="2" />
    <path d="M85 85V45H95V85H85Z" fill={STROKE_COLOR} />
    <path d="M105 85V70H115V85H105Z" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
    {/* トレンド線 */}
    <path d="M40 70L60 55L80 65L110 35L120 40" stroke={YELLOW_ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SubsidyIllustration: React.FC<IllustrationProps> = ({ className }) => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* ノード間ネットワーク */}
    <line x1="50" y1="50" x2="110" y2="40" stroke={LIGHT_BLUE} strokeWidth="2" strokeDasharray="3 3" />
    <line x1="110" y1="40" x2="90" y2="90" stroke={LIGHT_BLUE} strokeWidth="2" strokeDasharray="3 3" />
    <line x1="50" y1="50" x2="90" y2="90" stroke={LIGHT_BLUE} strokeWidth="2" strokeDasharray="3 3" />
    
    {/* 要素1 */}
    <rect x="30" y="30" width="40" height="40" rx="2" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
    <rect x="40" y="45" width="20" height="10" fill={YELLOW_ACCENT} />
    
    {/* 要素2 */}
    <circle cx="110" cy="40" r="15" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
    
    {/* キラキラAI */}
    <path d="M125 75L132 85L142 80L135 90L145 100L132 95L125 105L122 92L112 88L122 82L125 75Z" fill={YELLOW_ACCENT} stroke={STROKE_COLOR} strokeWidth="2" strokeLinejoin="round" />
    
    {/* 要素3 */}
    <polygon points="90,75 105,90 90,105 75,90" fill={BG_COLOR} stroke={STROKE_COLOR} strokeWidth="2" />
  </svg>
);
