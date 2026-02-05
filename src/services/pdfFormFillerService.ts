/**
 * PDF Form Filler Service - Tier 1: AcroForm Field Detection & Filling
 * 
 * This service provides reliable PDF form filling using a 3-tier approach:
 * 1. AcroForm fields (most reliable)
 * 2. Text anchor detection (fallback)
 * 3. Fixed coordinates (last resort)
 */

import { PDFDocument } from 'pdf-lib';
import { CorporateTaxInputData } from '../types/corporateTaxInput';

export interface FormFillingResult {
    success: boolean;
    filledFields: string[];
    skippedFields: string[];
    errors: string[];
    method: 'AcroForm' | 'Anchor' | 'FixedCoord' | 'Failed';
}

export interface ComprehensiveFillingReport {
    tier1Success: number;  // AcroForm successes
    tier2Success: number;  // Anchor-based successes
    tier3Success: number;  // Fixed coordinate successes
    totalFields: number;
    failures: string[];
    formResults: Map<string, FormFillingResult>;
}

/**
 * Tier 1: Fill PDF using AcroForm fields
 * This is the most reliable method as it uses the PDF's built-in form structure
 */
export async function fillAcroFormFields(
    pdfDoc: PDFDocument,
    data: CorporateTaxInputData,
    formType: string
): Promise<FormFillingResult> {
    const result: FormFillingResult = {
        success: false,
        filledFields: [],
        skippedFields: [],
        errors: [],
        method: 'AcroForm'
    };

    try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        if (fields.length === 0) {
            result.errors.push('No AcroForm fields found in PDF');
            return result;
        }

        console.log(`[AcroForm] Found ${fields.length} fields in ${formType}`);

        // Get all field names for debugging
        const fieldNames = fields.map(f => f.getName());
        console.log('[AcroForm] Available fields:', fieldNames);

        // Attempt to fill each field
        for (const field of fields) {
            const fieldName = field.getName();
            const value = getValueForField(fieldName, data, formType);

            if (value === null || value === undefined) {
                result.skippedFields.push(fieldName);
                continue;
            }

            try {
                // Try to fill as text field
                const textField = form.getTextField(fieldName);
                const formattedValue = typeof value === 'number'
                    ? formatTaxNumber(value)
                    : String(value);

                textField.setText(formattedValue);
                textField.enableReadOnly(); // Prevent further editing
                result.filledFields.push(fieldName);

                console.log(`[AcroForm] ✓ Filled "${fieldName}" = "${formattedValue}"`);
            } catch (e: any) {
                // Field might not be a text field, or other error
                result.errors.push(`Failed to fill "${fieldName}": ${e.message}`);
            }
        }

        result.success = result.filledFields.length > 0;

        // Try to flatten the form to prevent further editing
        try {
            form.flatten();
            console.log('[AcroForm] Form flattened successfully');
        } catch (e) {
            console.warn('[AcroForm] Could not flatten form:', e);
        }

    } catch (e: any) {
        result.errors.push(`AcroForm processing failed: ${e.message}`);
    }

    return result;
}

/**
 * Get the appropriate value from CorporateTaxInputData for a given field name
 * This function maps PDF field names to data properties
 */
function getValueForField(
    fieldName: string,
    data: CorporateTaxInputData,
    formType: string
): string | number | null {
    // Normalize field name for matching
    const normalizedName = fieldName.toLowerCase().replace(/[_\s]/g, '');

    // Beppyo 1 (別表一) - Corporate Tax Return
    if (formType === 'beppyo1') {
        const mappings: { [key: string]: number | string } = {
            '所得金額': data.beppyo4.taxableIncome,
            '課税標準': data.beppyo1.taxableIncome,
            '法人税額': data.beppyo1.corporateTaxAmount,
            '控除税額': data.beppyo1.specialTaxCredit,
            '中間納付': data.beppyo1.interimPayment,
            '差引税額': data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit - data.beppyo1.interimPayment,
        };

        for (const [key, value] of Object.entries(mappings)) {
            if (normalizedName.includes(key.replace(/[_\s]/g, ''))) {
                return value;
            }
        }
    }

    // Beppyo 4 (別表四) - Income Calculation
    if (formType === 'beppyo4') {
        const additionsTotal = data.beppyo4.additions.reduce((sum, item) => sum + item.amount, 0);
        const subtractionsTotal = data.beppyo4.subtractions.reduce((sum, item) => sum + item.amount, 0);

        const mappings: { [key: string]: number } = {
            '当期利益': data.beppyo4.netIncomeFromPL,
            '加算': additionsTotal,
            '減算': subtractionsTotal,
            '所得金額': data.beppyo4.taxableIncome,
        };

        for (const [key, value] of Object.entries(mappings)) {
            if (normalizedName.includes(key.replace(/[_\s]/g, ''))) {
                return value;
            }
        }
    }

    // Beppyo 5-1 (別表五一) - Retained Earnings
    if (formType === 'beppyo5_1') {
        const mappings: { [key: string]: number } = {
            '期首残高': data.beppyo5.retainedEarningsBegin,
            '当期変動': data.beppyo5.currentIncrease - data.beppyo5.currentDecrease,
            '期末残高': data.beppyo5.retainedEarningsEnd,
            '利益準備金': data.beppyo5.retainedEarningsEnd, // Simplified
        };

        for (const [key, value] of Object.entries(mappings)) {
            if (normalizedName.includes(key.replace(/[_\s]/g, ''))) {
                return value;
            }
        }
    }

    // Beppyo 15 (別表十五) - Entertainment Expenses
    if (formType === 'beppyo15') {
        const mappings: { [key: string]: number } = {
            '交際費': data.beppyo15.socialExpenses,
            '接待飲食費': data.beppyo15.deductibleExpenses,
            '損金算入限度額': data.beppyo15.deductionLimit,
            '損金不算入額': data.beppyo15.excessAmount,
        };

        for (const [key, value] of Object.entries(mappings)) {
            if (normalizedName.includes(key.replace(/[_\s]/g, ''))) {
                return value;
            }
        }
    }

    // Beppyo 16 (別表十六) - Depreciation
    if (formType === 'beppyo16') {
        const mappings: { [key: string]: number } = {
            '償却実施額': data.beppyo16.totalDepreciation,
            '償却限度額': data.beppyo16.totalAllowable,
            '償却超過額': data.beppyo16.excessAmount,
        };

        for (const [key, value] of Object.entries(mappings)) {
            if (normalizedName.includes(key.replace(/[_\s]/g, ''))) {
                return value;
            }
        }
    }

    return null;
}

/**
 * Format a number for Japanese tax documents
 * - Adds comma separators for thousands
 * - Right-aligns in fields
 * - Handles negative numbers with parentheses (optional)
 */
export function formatTaxNumber(value: number, useParenthesesForNegative: boolean = false): string {
    if (value === 0) return '0';

    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('ja-JP', {
        maximumFractionDigits: 0,
        useGrouping: true
    });

    if (value < 0) {
        return useParenthesesForNegative ? `(${formatted})` : `-${formatted}`;
    }

    return formatted;
}

/**
 * Detect if a PDF has AcroForm fields
 */
export function hasAcroFormFields(pdfDoc: PDFDocument): boolean {
    try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        return fields.length > 0;
    } catch (e) {
        return false;
    }
}

/**
 * Get diagnostic information about a PDF's form structure
 */
export function getPdfFormDiagnostics(pdfDoc: PDFDocument): {
    hasForm: boolean;
    fieldCount: number;
    fieldNames: string[];
    fieldTypes: Map<string, string>;
} {
    const diagnostics = {
        hasForm: false,
        fieldCount: 0,
        fieldNames: [] as string[],
        fieldTypes: new Map<string, string>()
    };

    try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        diagnostics.hasForm = true;
        diagnostics.fieldCount = fields.length;

        for (const field of fields) {
            const name = field.getName();
            diagnostics.fieldNames.push(name);

            // Determine field type
            let fieldType = 'Unknown';
            try {
                form.getTextField(name);
                fieldType = 'Text';
            } catch {
                try {
                    form.getCheckBox(name);
                    fieldType = 'CheckBox';
                } catch {
                    try {
                        form.getDropdown(name);
                        fieldType = 'Dropdown';
                    } catch {
                        try {
                            form.getRadioGroup(name);
                            fieldType = 'RadioGroup';
                        } catch {
                            fieldType = 'Other';
                        }
                    }
                }
            }

            diagnostics.fieldTypes.set(name, fieldType);
        }
    } catch (e) {
        diagnostics.hasForm = false;
    }

    return diagnostics;
}
