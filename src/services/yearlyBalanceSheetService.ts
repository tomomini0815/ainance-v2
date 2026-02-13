import { supabase } from '../lib/supabaseClient';

export interface YearlyBalanceSheet {
    id: string;
    user_id: string;
    business_type: 'individual' | 'corporation';
    year: number;

    // 資産の部
    assets_current_cash: number;
    assets_current_total: number;
    assets_total: number;

    // 負債の部
    liabilities_total: number;

    // 純資産の部
    net_assets_capital: number;
    net_assets_retained_earnings: number;
    net_assets_retained_earnings_total: number;
    net_assets_shareholders_equity: number;
    net_assets_total: number;

    // 負債及び純資産の部
    liabilities_and_net_assets_total: number;

    metadata: any;
    created_at?: string;
    updated_at?: string;
}

export const yearlyBalanceSheetService = {
    /**
     * 指定した年度のBSデータを取得
     */
    async getByYear(userId: string, businessType: 'individual' | 'corporation', year: number): Promise<YearlyBalanceSheet | null> {
        const { data, error } = await supabase
            .from('yearly_balance_sheets')
            .select('*')
            .eq('user_id', userId)
            .eq('business_type', businessType)
            .eq('year', year)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('getYearlyBalanceSheet Error:', error);
            throw error;
        }

        return data;
    },

    /**
     * 全BSデータを取得
     */
    async getAllByBusinessType(userId: string, businessType: 'individual' | 'corporation'): Promise<YearlyBalanceSheet[]> {
        const { data, error } = await supabase
            .from('yearly_balance_sheets')
            .select('*')
            .eq('user_id', userId)
            .eq('business_type', businessType)
            .order('year', { ascending: false });

        if (error) {
            console.error('getAllYearlyBalanceSheets Error:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * データの保存
     */
    async save(bsData: Omit<YearlyBalanceSheet, 'id' | 'created_at' | 'updated_at'>): Promise<YearlyBalanceSheet> {
        const { data, error } = await supabase
            .from('yearly_balance_sheets')
            .upsert({
                ...bsData,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id, business_type, year'
            })
            .select()
            .single();

        if (error) {
            console.error('saveYearlyBalanceSheet Error:', error);
            throw error;
        }

        return data;
    },

    /**
     * AI解析結果をBSデータ形式に変換（堅牢なマッピング）
     */
    mapAiResultToBS(
        aiResult: any,
        userId: string,
        businessType: 'individual' | 'corporation',
        metadata: any = {}
    ): Omit<YearlyBalanceSheet, 'id' | 'created_at' | 'updated_at'> {
        console.log('--- BS Result Mapping Start ---');

        const parseNum = (val: any): number => {
            if (val === null || val === undefined || val === '') return 0;
            if (typeof val === 'number') return val;
            let str = String(val).replace(/[$,¥円\s,()]/g, '');
            let isNegative = false;
            if (str.startsWith('△') || str.startsWith('▲') || str.startsWith('-')) {
                isNegative = true;
                str = str.substring(1);
            }
            let multiplier = 1;
            if (str.includes('千万')) multiplier = 10000000;
            else if (str.includes('百万')) multiplier = 1000000;
            else if (str.includes('千')) multiplier = 1000;
            else if (str.includes('万')) multiplier = 10000;

            const num = parseFloat(str.replace(/[千万万円]/g, ''));
            const absoluteValue = isNaN(num) ? 0 : num * multiplier;
            return Math.floor(isNegative ? -absoluteValue : absoluteValue);
        };

        const findVal = (keys: string[]): any => {
            if (!aiResult || typeof aiResult !== 'object') return undefined;
            for (const key of keys) {
                if (aiResult[key] !== undefined && aiResult[key] !== null) return aiResult[key];
                const lowerKey = key.toLowerCase();
                const foundKey = Object.keys(aiResult).find(k => k.toLowerCase() === lowerKey);
                if (foundKey) return aiResult[foundKey];
            }
            return undefined;
        };

        const result = {
            user_id: userId,
            business_type: businessType,
            year: parseNum(findVal(['year', '年度', '決算年度'])) || new Date().getFullYear() - 1,
            assets_current_cash: parseNum(findVal(['assets_current_cash', '現金及び預金', '現金預金'])),
            assets_current_total: parseNum(findVal(['assets_current_total', '流動資産合計'])),
            assets_total: parseNum(findVal(['assets_total', '資産の部合計', '資産合計'])),
            liabilities_total: parseNum(findVal(['liabilities_total', '負債の部合計', '負債合計'])),
            net_assets_capital: parseNum(findVal(['net_assets_capital', '資本金'])),
            net_assets_retained_earnings: parseNum(findVal(['net_assets_retained_earnings', '繰越利益剰余金'])),
            net_assets_retained_earnings_total: parseNum(findVal(['net_assets_retained_earnings_total', '利益剰余金合計', 'その他利益剰余金合計'])),
            net_assets_shareholders_equity: parseNum(findVal(['net_assets_shareholders_equity', '株主資本合計'])),
            net_assets_total: parseNum(findVal(['net_assets_total', '純資産の部合計', '純資産合計'])),
            liabilities_and_net_assets_total: parseNum(findVal(['liabilities_and_net_assets_total', '負債及び純資産の部合計', '負債純資産合計'])),
            metadata: {
                ...metadata,
                confidence: aiResult.confidence
            }
        };

        console.log('Mapped BS Data:', result);
        return result;
    }
};
