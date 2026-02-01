import React from 'react';

interface TransactionIconProps {
    item: string;
    category: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

const TransactionIcon: React.FC<TransactionIconProps> = ({ item, category, size = 'md' }) => {
    const sizeClass = {
        xs: 'w-4 h-4 text-[8px]',
        sm: 'w-5 h-5 text-[10px]',
        md: 'w-6 h-6 text-xs',
        lg: 'w-8 h-8 text-sm'
    }[size];

    const badgeClass = `inline-flex items-center justify-center rounded-full font-bold shrink-0 ${size === 'xs' ? 'mr-2' : 'mr-3'} ${sizeClass}`;

    // 項目名による特殊処理
    if (item.includes('売上') || item.includes('売掛')) {
        return <span className={`${badgeClass} bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]`}>売</span>;
    }
    if (item.includes('給与') || item.includes('給料') || item.includes('報酬') || item.includes('給与収入')) {
        return <span className={`${badgeClass} bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]`}>給</span>;
    }
    if (item.includes('ランチ') || item.includes('昼食') || item.includes('飲食') || item.includes('スタバ') || item.includes('カフェ')) {
        return <span className={`${badgeClass} bg-emerald-500/20 text-emerald-400`}>食</span>;
    }
    if (item.includes('贈答') || item.includes('プレゼント') || item.includes('土産') || item.includes('祝い') || item.includes('菓子')) {
        return <span className={`${badgeClass} bg-pink-500/20 text-pink-400`}>贈</span>;
    }
    if (item.includes('タクシー') || item.includes('電車') || item.includes('バス') || item.includes('Suica') || item.includes('PASMO') || item.includes('切符')) {
        return <span className={`${badgeClass} bg-blue-500/20 text-blue-400`}>交</span>;
    }
    if (item.includes('家賃') || item.includes('賃料') || item.includes('事務所')) {
        return <span className={`${badgeClass} bg-indigo-500/20 text-indigo-400`}>家</span>;
    }
    if (item.includes('PC') || item.includes('パソコン') || item.includes('事務用品') || item.includes('文房具')) {
        return <span className={`${badgeClass} bg-purple-500/20 text-purple-400`}>消</span>;
    }
    if (item.includes('燃料') || item.includes('ガソリン') || item.includes('軽油') || item.includes('給油')) {
        return <span className={`${badgeClass} bg-orange-500/20 text-orange-400`}>燃</span>;
    }

    // カテゴリによる汎用処理
    switch (category) {
        case '交通費':
        case '旅費交通費':
            return <span className={`${badgeClass} bg-blue-500/20 text-blue-400`}>交</span>;
        case '食費':
        case '接待交際費':
            return <span className={`${badgeClass} bg-emerald-500/20 text-emerald-400`}>食</span>;
        case '消耗品費':
            return <span className={`${badgeClass} bg-purple-500/20 text-purple-400`}>消</span>;
        case '通信費':
            return <span className={`${badgeClass} bg-amber-500/20 text-amber-400`}>通</span>;
        case '光熱費':
        case '水道光熱費':
            return <span className={`${badgeClass} bg-rose-500/20 text-rose-400`}>光</span>;
        case '燃料費':
            return <span className={`${badgeClass} bg-orange-500/20 text-orange-400`}>燃</span>;
        case '地代家賃':
            return <span className={`${badgeClass} bg-indigo-500/20 text-indigo-400`}>家</span>;
        case '売上':
        case '業務委託収入':
            return <span className={`${badgeClass} bg-emerald-500/20 text-emerald-500`}>売</span>;
        case '給与':
        case '給料':
        case '役員報酬':
            return <span className={`${badgeClass} bg-indigo-500/20 text-indigo-500`}>給</span>;
        default:
            return <span className={`${badgeClass} bg-slate-500/20 text-text-muted`}>他</span>;
    }
};

export default TransactionIcon;
