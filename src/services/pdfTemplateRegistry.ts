/**
 * PDF Template Registry - Tier 3: Fixed Coordinate Mappings
 * 
 * This service provides template-specific coordinate mappings as a last resort
 * when AcroForm fields and text anchors are not available.
 */

import { CorporateTaxInputData } from '../types/corporateTaxInput';

export interface FieldCoordinate {
    x: number;
    y: number;
    width?: number;
    align?: 'left' | 'right' | 'center';
}

export interface TemplateCoordinates {
    templateId: string;
    templateHash?: string;
    description: string;
    pageWidth: number;
    pageHeight: number;
    fields: Map<string, FieldCoordinate>;
}

/**
 * Registry of known template coordinates
 * These are verified coordinates for specific PDF templates
 */
export const TEMPLATE_REGISTRY: TemplateCoordinates[] = [
    // 別表一（一） - 令和5年版
    {
        templateId: 'beppyo1_r05',
        description: '別表一（一）各事業年度の所得に係る申告書 令和5年版',
        pageWidth: 595.28,
        pageHeight: 841.89,
        fields: new Map([
            ['所得金額', { x: 245, y: 580, align: 'right' }],
            ['法人税額', { x: 245, y: 560, align: 'right' }],
            ['控除税額', { x: 245, y: 540, align: 'right' }],
            ['中間納付', { x: 245, y: 520, align: 'right' }],
            ['差引税額', { x: 245, y: 500, align: 'right' }],
        ])
    },

    // 別表四 - 令和5年版
    {
        templateId: 'beppyo4_r05',
        description: '別表四 所得の金額の計算に関する明細書 令和5年版',
        pageWidth: 595.28,
        pageHeight: 841.89,
        fields: new Map([
            ['当期利益', { x: 430, y: 680, align: 'right' }],
            ['加算合計', { x: 430, y: 600, align: 'right' }],
            ['減算合計', { x: 430, y: 520, align: 'right' }],
            ['所得金額', { x: 430, y: 440, align: 'right' }],
        ])
    },

    // 別表五（一） - 令和5年版
    {
        templateId: 'beppyo5_1_r05',
        description: '別表五（一）利益積立金額及び資本金等の額の計算に関する明細書',
        pageWidth: 595.28,
        pageHeight: 841.89,
        fields: new Map([
            ['期首残高', { x: 350, y: 700, align: 'right' }],
            ['当期変動', { x: 430, y: 700, align: 'right' }],
            ['期末残高', { x: 510, y: 700, align: 'right' }],
        ])
    },

    // 別表十五 - 令和5年版
    {
        templateId: 'beppyo15_r05',
        description: '別表十五 交際費等の損金算入に関する明細書',
        pageWidth: 595.28,
        pageHeight: 841.89,
        fields: new Map([
            ['交際費支出額', { x: 430, y: 680, align: 'right' }],
            ['接待飲食費', { x: 430, y: 640, align: 'right' }],
            ['損金算入限度額', { x: 430, y: 600, align: 'right' }],
            ['損金不算入額', { x: 430, y: 560, align: 'right' }],
        ])
    },

    // 別表十六 - 令和5年版
    {
        templateId: 'beppyo16_r05',
        description: '別表十六 減価償却資産の償却額の計算に関する明細書',
        pageWidth: 595.28,
        pageHeight: 841.89,
        fields: new Map([
            ['償却実施額計', { x: 430, y: 680, align: 'right' }],
            ['償却限度額計', { x: 430, y: 640, align: 'right' }],
            ['償却超過額', { x: 430, y: 600, align: 'right' }],
        ])
    },
];

/**
 * Get template coordinates for a specific form type
 * Returns null if template is not found
 */
export function getTemplateCoordinates(formType: string): TemplateCoordinates | null {
    // Try to find exact match first
    const exactMatch = TEMPLATE_REGISTRY.find(t => t.templateId.startsWith(formType));
    if (exactMatch) {
        return exactMatch;
    }

    // Try to find by description
    const descMatch = TEMPLATE_REGISTRY.find(t =>
        t.description.toLowerCase().includes(formType.toLowerCase())
    );

    return descMatch || null;
}

/**
 * Get field mappings for a specific form type
 */
export function getFieldMappingsForTemplate(
    formType: string,
    data: CorporateTaxInputData
): Map<string, number | string> {
    const mappings = new Map<string, number | string>();

    switch (formType) {
        case 'beppyo1':
            mappings.set('所得金額', data.beppyo4.taxableIncome);
            mappings.set('法人税額', data.beppyo1.corporateTaxAmount);
            mappings.set('控除税額', data.beppyo1.specialTaxCredit);
            mappings.set('中間納付', data.beppyo1.interimPayment);
            mappings.set('差引税額',
                data.beppyo1.corporateTaxAmount -
                data.beppyo1.specialTaxCredit -
                data.beppyo1.interimPayment
            );
            break;

        case 'beppyo4':
            const additionsTotal = data.beppyo4.additions.reduce((sum, item) => sum + item.amount, 0);
            const subtractionsTotal = data.beppyo4.subtractions.reduce((sum, item) => sum + item.amount, 0);

            mappings.set('当期利益', data.beppyo4.netIncomeFromPL);
            mappings.set('加算合計', additionsTotal);
            mappings.set('減算合計', subtractionsTotal);
            mappings.set('所得金額', data.beppyo4.taxableIncome);
            break;

        case 'beppyo5_1':
            mappings.set('期首残高', data.beppyo5.retainedEarningsBegin);
            mappings.set('当期変動', data.beppyo5.currentIncrease - data.beppyo5.currentDecrease);
            mappings.set('期末残高', data.beppyo5.retainedEarningsEnd);
            break;

        case 'beppyo15':
            mappings.set('交際費支出額', data.beppyo15.socialExpenses);
            mappings.set('接待飲食費', data.beppyo15.deductibleExpenses);
            mappings.set('損金算入限度額', data.beppyo15.deductionLimit);
            mappings.set('損金不算入額', data.beppyo15.excessAmount);
            break;

        case 'beppyo16':
            mappings.set('償却実施額計', data.beppyo16.totalDepreciation);
            mappings.set('償却限度額計', data.beppyo16.totalAllowable);
            mappings.set('償却超過額', data.beppyo16.excessAmount);
            break;
    }

    return mappings;
}

/**
 * Calculate PDF hash for template identification
 * This can be used to verify we're using the correct template
 */
export async function calculatePdfHash(pdfBytes: Uint8Array): Promise<string> {
    // Simple hash based on file size and first/last bytes
    // In production, you might want to use a proper hash function
    const size = pdfBytes.length;
    const first = pdfBytes.slice(0, 100);
    const last = pdfBytes.slice(-100);

    const combined = new Uint8Array(first.length + last.length + 4);
    combined.set(first, 0);
    combined.set(last, first.length);

    // Add size as 4 bytes
    const sizeView = new DataView(combined.buffer, first.length + last.length);
    sizeView.setUint32(0, size, true);

    // Convert to hex string
    return Array.from(combined)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Verify if a PDF matches a known template
 */
export async function verifyTemplate(
    pdfBytes: Uint8Array,
    templateId: string
): Promise<boolean> {
    const template = TEMPLATE_REGISTRY.find(t => t.templateId === templateId);
    if (!template || !template.templateHash) {
        return false;
    }

    const hash = await calculatePdfHash(pdfBytes);
    return hash === template.templateHash;
}
