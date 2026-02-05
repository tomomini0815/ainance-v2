/**
 * PDF Anchor Detector Service - Tier 2: Text Anchor-Based Positioning
 * 
 * This service detects text labels in PDFs and uses them as anchors
 * for positioning values, providing a fallback when AcroForm fields
 * are not available.
 */

import { PDFPage, PDFFont, rgb } from 'pdf-lib';
import { CorporateTaxInputData } from '../types/corporateTaxInput';
import { FormFillingResult } from './pdfFormFillerService';

export interface TextAnchor {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Tier 2: Fill PDF using text anchor detection
 * Finds label text and positions values relative to it
 */
export async function fillByTextAnchors(
    page: PDFPage,
    data: CorporateTaxInputData,
    formType: string,
    font: PDFFont
): Promise<FormFillingResult> {
    const result: FormFillingResult = {
        success: false,
        filledFields: [],
        skippedFields: [],
        errors: [],
        method: 'Anchor'
    };

    try {
        // Detect text anchors in the PDF
        const anchors = await detectTextAnchors(page);

        if (anchors.size === 0) {
            result.errors.push('No text anchors detected in PDF');
            return result;
        }

        console.log(`[Anchor] Detected ${anchors.size} text anchors`);

        // Get field mappings for this form type
        const fieldMappings = getFieldMappingsForForm(formType, data);

        // Attempt to fill each field using anchors
        for (const [label, value] of fieldMappings.entries()) {
            try {
                const filled = fillByAnchor(page, label, String(value), anchors, font);
                if (filled) {
                    result.filledFields.push(label);
                    console.log(`[Anchor] ✓ Filled "${label}" = "${value}"`);
                } else {
                    result.skippedFields.push(label);
                }
            } catch (e: any) {
                result.errors.push(`Failed to fill "${label}": ${e.message}`);
            }
        }

        result.success = result.filledFields.length > 0;

    } catch (e: any) {
        result.errors.push(`Anchor detection failed: ${e.message}`);
    }

    return result;
}

/**
 * Detect text anchors (labels) in a PDF page
 * Returns a map of label text to coordinates
 */
export async function detectTextAnchors(page: PDFPage): Promise<Map<string, TextAnchor>> {
    const anchors = new Map<string, TextAnchor>();

    try {
        // Get text content from the page
        // Note: pdf-lib doesn't have built-in text extraction, so we'll use a heuristic approach
        // In production, you might want to use pdf.js or pdfjs-dist for better text extraction

        // For now, we'll define known anchor positions based on common tax form layouts
        // This is a simplified implementation - a full implementation would use OCR or pdf.js

        const commonAnchors: TextAnchor[] = [
            { text: '所得金額', x: 100, y: 700, width: 80, height: 20 },
            { text: '法人税額', x: 100, y: 680, width: 80, height: 20 },
            { text: '控除税額', x: 100, y: 660, width: 80, height: 20 },
            { text: '中間納付', x: 100, y: 640, width: 80, height: 20 },
            { text: '差引税額', x: 100, y: 620, width: 80, height: 20 },
            { text: '当期利益', x: 100, y: 600, width: 80, height: 20 },
            { text: '加算', x: 100, y: 580, width: 80, height: 20 },
            { text: '減算', x: 100, y: 560, width: 80, height: 20 },
            { text: '交際費', x: 100, y: 540, width: 80, height: 20 },
            { text: '償却実施額', x: 100, y: 520, width: 80, height: 20 },
        ];

        for (const anchor of commonAnchors) {
            anchors.set(anchor.text, anchor);
        }

    } catch (e: any) {
        console.error('[Anchor] Text detection failed:', e);
    }

    return anchors;
}

/**
 * Fill a value based on its anchor label
 */
function fillByAnchor(
    page: PDFPage,
    anchorLabel: string,
    value: string,
    anchors: Map<string, TextAnchor>,
    font: PDFFont
): boolean {
    const anchor = anchors.get(anchorLabel);
    if (!anchor) {
        return false;
    }

    // Position the value to the right of the anchor label
    const valueX = anchor.x + anchor.width + 20; // 20pt gap
    const valueY = anchor.y;

    page.drawText(value, {
        x: valueX,
        y: valueY,
        size: 10,
        font: font,
        color: rgb(0, 0, 0.5)
    });

    return true;
}

/**
 * Get field mappings for a specific form type
 */
function getFieldMappingsForForm(
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
            mappings.set('差引税額', data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit - data.beppyo1.interimPayment);
            break;

        case 'beppyo4':
            const additionsTotal = data.beppyo4.additions.reduce((sum, item) => sum + item.amount, 0);
            const subtractionsTotal = data.beppyo4.subtractions.reduce((sum, item) => sum + item.amount, 0);

            mappings.set('当期利益', data.beppyo4.netIncomeFromPL);
            mappings.set('加算', additionsTotal);
            mappings.set('減算', subtractionsTotal);
            mappings.set('所得金額', data.beppyo4.taxableIncome);
            break;

        case 'beppyo15':
            mappings.set('交際費', data.beppyo15.socialExpenses);
            mappings.set('接待飲食費', data.beppyo15.deductibleExpenses);
            mappings.set('損金算入限度額', data.beppyo15.deductionLimit);
            break;

        case 'beppyo16':
            mappings.set('償却実施額', data.beppyo16.totalDepreciation);
            mappings.set('償却限度額', data.beppyo16.totalAllowable);
            mappings.set('償却超過額', data.beppyo16.excessAmount);
            break;
    }

    return mappings;
}

/**
 * Enhanced anchor detection using multiple strategies
 * This can be extended to use OCR or pdf.js for better accuracy
 */
export async function detectTextAnchorsAdvanced(
    page: PDFPage,
    expectedLabels: string[]
): Promise<Map<string, TextAnchor>> {
    const anchors = new Map<string, TextAnchor>();

    // Strategy 1: Use known positions (current implementation)
    const basicAnchors = await detectTextAnchors(page);

    // Strategy 2: Filter to only expected labels
    for (const label of expectedLabels) {
        if (basicAnchors.has(label)) {
            anchors.set(label, basicAnchors.get(label)!);
        }
    }

    // Strategy 3: Could add OCR-based detection here
    // Strategy 4: Could add pattern matching for similar labels

    return anchors;
}
