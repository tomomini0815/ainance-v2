import { supabase } from '../lib/supabaseClient';


export interface YearlySettlement {
    id: string;
    user_id: string;
    business_type: 'individual' | 'corporation';
    year: number;
    revenue: number;
    cost_of_sales: number;
    operating_expenses: number;
    non_operating_income: number;
    non_operating_expenses: number;
    extraordinary_income: number;
    extraordinary_loss: number;
    income_before_tax: number;
    net_income: number;
    category_breakdown: {
        category: string;
        amount: number;
    }[];
    metadata: any;
    document_path?: string;
    status: 'draft' | 'confirmed';
    balance_sheet?: {
        cash?: number;
        receivable?: number;
        inventory?: number;
        fixed_assets?: number;
        short_term_loans?: number;
        long_term_loans?: number;
        retained_earnings?: number;
        capital?: number;
    };
    created_at?: string;
    updated_at?: string;
}

export const yearlySettlementService = {
    /**
     * ユーザー・業態・年度を指定して決算データを取得
     */
    async getByYear(userId: string, businessType: 'individual' | 'corporation', year: number): Promise<YearlySettlement | null> {
        const { data, error } = await supabase
            .from('yearly_settlements')
            .select('*')
            .eq('user_id', userId)
            .eq('business_type', businessType)
            .eq('year', year)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // データなし
            console.error('getYearlySettlement Error:', error);
            throw error;
        }

        return data;
    },

    /**
     * 指定したビジネスタイプの全決算データを取得
     */
    async getAllByBusinessType(userId: string, businessType: 'individual' | 'corporation'): Promise<YearlySettlement[]> {
        const { data, error } = await supabase
            .from('yearly_settlements')
            .select('*')
            .eq('user_id', userId)
            .eq('business_type', businessType)
            .order('year', { ascending: false });

        if (error) {
            console.error('getAllYearlySettlements Error:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * 最新の決算データを1件取得
     */
    async getLatest(userId: string, businessType: 'individual' | 'corporation'): Promise<YearlySettlement | null> {
        const { data, error } = await supabase
            .from('yearly_settlements')
            .select('*')
            .eq('user_id', userId)
            .eq('business_type', businessType)
            .order('year', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('getLatestYearlySettlement Error:', error);
            throw error;
        }

        return data;
    },


    /**
     * 決算データを保存（新規作成または更新）
     */
    async save(settlement: Omit<YearlySettlement, 'id' | 'created_at' | 'updated_at'>): Promise<YearlySettlement> {
        console.log('--- yearlySettlementService.save Start ---', settlement);
        const { data, error } = await supabase
            .from('yearly_settlements')
            .upsert({
                ...settlement,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,business_type,year'
            })
            .select()
            .single();

        if (error) {
            console.error('saveYearlySettlement Error Full:', error);
            console.error('Error Details:', error.details);
            console.error('Error Hint:', error.hint);
            console.error('Error Code:', error.code);
            throw error;
        }

        console.log('saveYearlySettlement Success:', data);
        return data;
    },

    /**
     * AI解析結果を決算データ形式に変換
     */
    mapAiResultToSettlement(
        aiResult: any,
        userId: string,
        businessType: 'individual' | 'corporation',
        metadata: any = {}
    ): Omit<YearlySettlement, 'id' | 'created_at' | 'updated_at'> {
        console.log('--- AI Result Mapping Start ---');
        console.log('Raw AI Result:', JSON.stringify(aiResult, null, 2));

        const parseNum = (val: any): number => {
            if (val === null || val === undefined || val === '') return 0;
            if (typeof val === 'number') return val;

            const originalVal = val;
            // 文字列の場合のクリーンアップ（カンマ、¥、円、空白、括弧の処理）
            let str = String(val).replace(/[$,¥円\s,()]/g, '');

            // 負の数表記（△100、▲100、-100など）への対応
            let isNegative = false;
            if (str.startsWith('△') || str.startsWith('▲') || str.startsWith('-')) {
                isNegative = true;
                str = str.substring(1);
            }

            // 単位対応（千万、百万、千、万）
            let multiplier = 1;
            if (str.includes('千万')) {
                multiplier = 10000000;
                str = str.replace('千万', '');
            } else if (str.includes('百万')) {
                multiplier = 1000000;
                str = str.replace('百万', '');
            } else if (str.includes('千')) {
                multiplier = 1000;
                str = str.replace('千', '');
            } else if (str.includes('万')) {
                multiplier = 10000;
                str = str.replace('万', '');
            }

            const num = parseFloat(str);
            const absoluteValue = isNaN(num) ? 0 : num * multiplier;
            const finalValue = isNegative ? -absoluteValue : absoluteValue;
            
            if (isNaN(num)) {
                console.warn(`parseNum: Could not parse "${originalVal}" as number`);
            }
            
            return Math.floor(finalValue);
        };

        // 指定された複数のキーから値を探すヘルパー
        const findVal = (keys: string[]): any => {
            if (!aiResult || typeof aiResult !== 'object') return undefined;

            for (const key of keys) {
                if (aiResult[key] !== undefined && aiResult[key] !== null) return aiResult[key];

                // 大文字小文字や日本語の揺れを考慮
                const lowerKey = key.toLowerCase();
                const foundKey = Object.keys(aiResult).find(k => k.toLowerCase() === lowerKey);
                if (foundKey) return aiResult[foundKey];
            }
            return undefined;
        };

        // カテゴリ内訳の正規化
        const normalizeBreakdown = (items: any[]): { category: string, amount: number }[] => {
            if (!Array.isArray(items)) return [];
            return items.map(item => ({
                category: String(item.category || item.name || item.項目 || item.科目 || 'その他').trim(),
                amount: parseNum(item.amount || item.value || item.price || item.金額)
            })).filter(item => item.category && item.amount !== 0);
        };

        const settlementData = {
            user_id: userId,
            business_type: businessType,
            year: parseNum(findVal(['year', '年度', '決算年度', 'target_year'])) || new Date().getFullYear() - 1,
            revenue: parseNum(findVal(['revenue', 'sales', 'total_revenue', '売上', '売上高', '収入金額', '営業収益'])),
            cost_of_sales: parseNum(findVal(['cost_of_sales', 'purchases', '売上原価', '仕入', '仕入高', '当期商品仕入高'])),
            operating_expenses: parseNum(findVal(['operating_expenses', 'expenses', 'sga_expenses', '販管費', '販売費及び一般管理費', '経費合計', '営業費用'])),
            non_operating_income: parseNum(findVal(['non_operating_income', '営業外収益'])),
            non_operating_expenses: parseNum(findVal(['non_operating_expenses', '営業外費用', '営業外支出'])),
            extraordinary_income: parseNum(findVal(['extraordinary_income', '特別利益', '特別収益'])),
            extraordinary_loss: parseNum(findVal(['extraordinary_loss', '特別損失', '特別支出'])),
            income_before_tax: parseNum(findVal(['income_before_tax', '税引前当期純利益', '税金等調整前当期純利益'])),
            net_income: parseNum(findVal(['net_income', 'profit', 'net_profit', '当期純利益', '利益'])),
            balance_sheet: {
                retained_earnings: parseNum(findVal(['retained_earnings', '利益剰余金', '繰越利益剰余金', '利益積立金'])),
                capital: parseNum(findVal(['capital', '資本金', '資本金等の額'])),
                cash: parseNum(findVal(['cash', 'cash_and_equivalents', '現金預金', '現預金'])),
                receivable: parseNum(findVal(['receivable', 'accounts_receivable', '売掛金'])),
                inventory: parseNum(findVal(['inventory', '棚卸資産', '商品'])),
                fixed_assets: parseNum(findVal(['fixed_assets', 'tangible_fixed_assets', '有形固定資産'])),
                short_term_loans: parseNum(findVal(['short_term_loans', '短期借入金'])),
                long_term_loans: parseNum(findVal(['long_term_loans', '長期借入金'])),
            },
            net_assets_total: parseNum(findVal(['net_assets_total', '純資産の部合計', '純資産合計'])),
            liabilities_and_net_assets_total: parseNum(findVal(['liabilities_and_net_assets_total', '負債及び純資産の部合計', '負債純資産合計'])),
            category_breakdown: normalizeBreakdown(aiResult.category_breakdown || aiResult.items || aiResult.内訳 || aiResult.項目別 || []),
            status: 'draft' as const,
            metadata: {
                ...metadata,
                confidence: aiResult.confidence
            }
        };

        console.log('Mapped Settlement Data:', settlementData);
        console.log('--- AI Result Mapping End ---');
        return settlementData;
    },

    /**
     * 決算データを削除
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('yearly_settlements')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('deleteYearlySettlement Error:', error);
            throw error;
        }
    },

    /**
     * ステータスを更新
     */
    async updateStatus(id: string, status: 'draft' | 'confirmed'): Promise<void> {
        const { error } = await supabase
            .from('yearly_settlements')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('updateStatus Settlement Error:', error);
            throw error;
        }
    }
};

