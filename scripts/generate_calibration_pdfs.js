/**
 * Calibration PDF Generator
 * 
 * Generates calibration overlay PDFs for all corporate tax form templates.
 * Each output PDF shows:
 *  - Red dots at current anchorX/anchorY positions
 *  - Red labeled text near each dot
 *  - A ruler grid for precise measurement
 *
 * Usage: node scripts/generate_calibration_pdfs.js
 * Output: public/calibration_*.pdf
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// ===== ALL COORDINATE DEFINITIONS (mirrored from pdfDigitBoxService.ts) =====

const BEPPYO1_PAGE1_FIELDS = {
    'r1_shotoku': { x: 292.7, y: 568.6 },
    'r2_hojinzei': { x: 293.3, y: 549.9 },
    'r3_tokubetsu': { x: 293.3, y: 533.3 },
    'r4_zeigaku': { x: 293.3, y: 514.6 },
    'r5_rishizei': { x: 292, y: 496.6 },
    'r6_kojozei': { x: 292.7, y: 479.3 },
    'r7_ryuhokin': { x: 292.7, y: 460.6 },
    'r8_dojoze': { x: 292, y: 441.9 },
    'r9_keisho1': { x: 294.7, y: 407.3 },
    'r10': { x: 294, y: 386.6 },
    'r11': { x: 293.3, y: 368.6 },
    'r12': { x: 292.7, y: 351.3 },
    'r13_sabiki': { x: 292.7, y: 333.9 },
    'r14_chuukan': { x: 294.7, y: 316.8 },
    'r15': { x: 293.3, y: 295.3 },
    'r28_keisho': { x: 293.3, y: 276.1 },
    'R16_right': { x: 560, y: 565.3 },
    'R17': { x: 560, y: 547.3 },
    'R18_shotoku': { x: 560, y: 527.3 },
    'R19': { x: 559.3, y: 509.9 },
    'R20': { x: 560, y: 492.1 },
    'R21': { x: 559.3, y: 470.8 },
    'R22': { x: 560, y: 447.5 },
    'R23': { x: 560, y: 421.5 },
    'R24': { x: 560, y: 394.1 },
    'R25': { x: 558.7, y: 340.1 },
    'R26': { x: 558.7, y: 316.8 },
    'R27': { x: 560, y: 295.5 },
};

const BEPPYO1_PAGE1_TEXT = {
    'TaxOffice': { x: 114, y: 781.5 },
    'CorpName': { x: 85.3, y: 716.1 },
    'CorpNum': { x: 83.3, y: 695.3 },
    'Address': { x: 84, y: 752.1 },
    'Phone': { x: 170, y: 745.5 },
    'RepName': { x: 85.3, y: 665.9 },
    'FY_Y_from': { x: 420.7, y: 772.6 },
    'FY_M_from': { x: 461.3, y: 772.6 },
    'FY_D_from': { x: 489.3, y: 772.6 },
    'FY_Y_to': { x: 508.7, y: 772.6 },
    'FY_M_to': { x: 541.3, y: 772.6 },
    'FY_D_to': { x: 572.7, y: 772.6 },
};

const BEPPYO4_PAGE1_FIELDS = {
    'r1_toki': { x: 327.3, y: 719.3 },
    'r2_hojinzei': { x: 326.7, y: 703.9 },
    'r3_juuminzei': { x: 326, y: 689.3 },
    'r4_kousaihi': { x: 325.3, y: 621.9 },
    'r5_genkashokyaku': { x: 325.3, y: 525.9 },
    'r33_kanpukin': { x: 326, y: 348.6 },
    'r34_jigyozei': { x: 325.3, y: 207.3 },
    'r52_shotoku': { x: 321.3, y: 68.6 },
};

const BEPPYO4_PAGE1_TEXT = {
    'CorpName': { x: 434.7, y: 788.6 },
};

const BEPPYO5_PAGE1_FIELDS = {
    'I1_C1': { x: 287.3, y: 709.3 },
    'I1_C2': { x: 366, y: 708.6 },
    'I1_C3': { x: 445.3, y: 708.6 },
    'I1_C4': { x: 525.3, y: 708.6 },
    'I31_C1': { x: 294.7, y: 219.9 },
    'I31_C2': { x: 373.3, y: 220.6 },
    'I31_C3': { x: 452.7, y: 219.9 },
    'I31_C4': { x: 532, y: 219.3 },
    'I32_C1': { x: 286.7, y: 146.6 },
    'I32_C2': { x: 366.7, y: 147.9 },
    'I32_C3': { x: 442.7, y: 147.3 },
    'I32_C4': { x: 522.7, y: 147.3 },
    'I33_C1': { x: 295.3, y: 132.6 },
    'I33_C4': { x: 532, y: 132.6 },
};

const BEPPYO5_PAGE1_TEXT = {
    'CorpName': { x: 100, y: 780 },
};

const BEPPYO5_2_PAGE1_FIELDS = {
    'Corp1': { x: 252, y: 657.9 },
    'Corp2': { x: 305.3, y: 659.3 },
    'Corp3': { x: 357.3, y: 659.3 },
    'Corp4': { x: 410, y: 658.6 },
    'Inh1': { x: 250.7, y: 585.3 },
    'Inh2': { x: 304.7, y: 584.6 },
    'Inh3': { x: 356.7, y: 583.9 },
    'Inh4': { x: 410.7, y: 584.6 },
    'Ent1': { x: 252, y: 450.6 },
    'Ent2': { x: 304.7, y: 451.9 },
    'Ent3': { x: 356.7, y: 452.6 },
    'Ent4': { x: 412, y: 451.9 },
    'NZJ_in': { x: 304, y: 233.9 },
    'NZJ_out': { x: 304.7, y: 219.3 },
};

const BEPPYO5_2_PAGE1_TEXT = {
    'CorpName': { x: 418, y: 788.6 },
};

const BEPPYO15_PAGE1_FIELDS = {
    'I1_C1': { x: 450, y: 650 },
    'I2_C1': { x: 450, y: 600 },
    'I17_C1': { x: 450, y: 300 },
    'I18_C1': { x: 450, y: 250 },
};

const BEPPYO15_PAGE1_TEXT = {
    'CorpName': { x: 100, y: 780 },
};

const BEPPYO16_1_PAGE1_FIELDS = {
    'R1C1': { x: 249.3, y: 725.3 },
    'R1C2': { x: 280, y: 700 },
    'R1C3': { x: 360, y: 700 },
    'R1C4': { x: 440, y: 700 },
    'R1C5': { x: 520, y: 700 },
};

const BEPPYO16_1_PAGE1_TEXT = {
    'R1Name': { x: 100, y: 700 },
    'CorpName': { x: 409.3, y: 788.6 },
};

const ALL_TEMPLATES = [
    {
        name: 'beppyo1',
        file: 'beppyo1_official.pdf',
        digitFields: BEPPYO1_PAGE1_FIELDS,
        textFields: BEPPYO1_PAGE1_TEXT,
    },
    {
        name: 'beppyo4',
        file: 'beppyo4_official.pdf',
        digitFields: BEPPYO4_PAGE1_FIELDS,
        textFields: BEPPYO4_PAGE1_TEXT,
    },
    {
        name: 'beppyo5_1',
        file: 'beppyo5_1_official.pdf',
        digitFields: BEPPYO5_PAGE1_FIELDS,
        textFields: BEPPYO5_PAGE1_TEXT,
    },
    {
        name: 'beppyo5_2',
        file: 'beppyo5_2_official.pdf',
        digitFields: BEPPYO5_2_PAGE1_FIELDS,
        textFields: BEPPYO5_2_PAGE1_TEXT,
    },
    {
        name: 'beppyo15',
        file: 'beppyo15_official.pdf',
        digitFields: BEPPYO15_PAGE1_FIELDS,
        textFields: BEPPYO15_PAGE1_TEXT,
    },
    {
        name: 'beppyo16',
        file: 'beppyo16_official.pdf',
        digitFields: BEPPYO16_1_PAGE1_FIELDS,
        textFields: BEPPYO16_1_PAGE1_TEXT,
    },
];

async function generateCalibrationPDF(template) {
    const inputPath = path.join(__dirname, '..', 'public', 'templates', template.file);

    if (!fs.existsSync(inputPath)) {
        console.warn(`[SKIP] ${template.file} not found at ${inputPath}`);
        return;
    }

    const bytes = fs.readFileSync(inputPath);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const page = doc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    console.log(`\n=== ${template.name} (${width.toFixed(1)} x ${height.toFixed(1)}) ===`);

    // Draw ruler lines every 50pt
    for (let x = 0; x <= width; x += 50) {
        page.drawLine({
            start: { x, y: 0 },
            end: { x, y: height },
            thickness: 0.2,
            color: rgb(0.7, 0.7, 0.7),
            opacity: 0.3,
        });
        page.drawText(String(Math.round(x)), {
            x: x + 1, y: 5,
            size: 4, font, color: rgb(0.5, 0.5, 0.5),
        });
    }
    for (let y = 0; y <= height; y += 50) {
        page.drawLine({
            start: { x: 0, y },
            end: { x: width, y },
            thickness: 0.2,
            color: rgb(0.7, 0.7, 0.7),
            opacity: 0.3,
        });
        page.drawText(String(Math.round(y)), {
            x: 2, y: y + 1,
            size: 4, font, color: rgb(0.5, 0.5, 0.5),
        });
    }

    // Draw digit field markers (RED)
    for (const [name, pos] of Object.entries(template.digitFields)) {
        // Cross-hair
        page.drawLine({
            start: { x: pos.x - 8, y: pos.y },
            end: { x: pos.x + 8, y: pos.y },
            thickness: 0.5, color: rgb(1, 0, 0),
        });
        page.drawLine({
            start: { x: pos.x, y: pos.y - 8 },
            end: { x: pos.x, y: pos.y + 8 },
            thickness: 0.5, color: rgb(1, 0, 0),
        });
        // Dot
        page.drawCircle({
            x: pos.x, y: pos.y,
            size: 2, color: rgb(1, 0, 0), opacity: 0.9,
        });
        // Label
        page.drawText(`${name}(${pos.x.toFixed(0)},${pos.y.toFixed(0)})`, {
            x: pos.x + 10, y: pos.y - 2,
            size: 4, font, color: rgb(1, 0, 0),
        });
        console.log(`  DIGIT: ${name} -> (${pos.x}, ${pos.y})`);
    }

    // Draw text field markers (BLUE)
    for (const [name, pos] of Object.entries(template.textFields)) {
        page.drawCircle({
            x: pos.x, y: pos.y,
            size: 3, color: rgb(0, 0, 1), opacity: 0.8,
        });
        page.drawText(`${name}(${pos.x.toFixed(0)},${pos.y.toFixed(0)})`, {
            x: pos.x + 10, y: pos.y - 2,
            size: 4, font, color: rgb(0, 0, 1),
        });
        console.log(`  TEXT:  ${name} -> (${pos.x}, ${pos.y})`);
    }

    // Also draw sample digits "1234567890" at first field position to check sizing
    const firstField = Object.values(template.digitFields)[0];
    if (firstField) {
        const digits = '1234567890';
        for (let i = 0; i < digits.length; i++) {
            const x = firstField.x - (i * 16);  // 16pt spacing, right to left
            page.drawText(digits[i], {
                x, y: firstField.y,
                size: 10, font, color: rgb(0, 0.6, 0),
            });
        }
    }

    const outputPath = path.join(__dirname, '..', 'public', `calibration_${template.name}.pdf`);
    const outputBytes = await doc.save();
    fs.writeFileSync(outputPath, outputBytes);
    console.log(`  -> Saved to ${outputPath}`);
}

async function main() {
    console.log('=== CALIBRATION PDF GENERATOR ===');
    console.log('Generating calibration overlay PDFs for all corporate tax templates...\n');

    for (const template of ALL_TEMPLATES) {
        try {
            await generateCalibrationPDF(template);
        } catch (e) {
            console.error(`ERROR processing ${template.name}:`, e.message);
        }
    }

    console.log('\n=== COMPLETE ===');
    console.log('Open each calibration_*.pdf in your browser or PDF viewer.');
    console.log('Check if red crosshairs align with the center-right of each digit box.');
    console.log('Blue dots should be at the start of each text field.');
    console.log('Note the X/Y offset needed and report it.\n');
}

main().catch(e => console.error('Fatal error:', e));
