/**
 * Precision Coordinate Calibration
 * 
 * Based on analyzing the user's actual form image, this script
 * places test markers at carefully measured positions and generates
 * a PDF for visual verification.
 * 
 * The approach:
 * 1. Measure positions from the user's image
 * 2. Convert image pixels to PDF points
 * 3. Generate test PDF with markers
 * 4. User compares and provides feedback for fine-tuning
 * 
 * Key measurements from the user's 別表一 image:
 * - Page is A4 (595.32 x 841.92 pt)
 * - Form header (番号, 税務署長殿, etc.) starts at ~top 50pt
 * - Main form body starts around Y = 700 (from bottom)
 * - Each row is approximately 19.3pt high
 * - Left digit boxes right edge: ~244pt from left
 * - Right digit boxes right edge: ~514pt from left
 * - Each digit box: ~16.15pt wide
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function calibrateCoordinates() {
    console.log('='.repeat(60));
    console.log('PRECISION COORDINATE CALIBRATION');
    console.log('='.repeat(60));

    const pdfPath = 'public/templates/beppyo1_official.pdf';

    if (!fs.existsSync(pdfPath)) {
        console.error(`PDF not found: ${pdfPath}`);
        return;
    }

    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });

    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    console.log(`Page size: ${width.toFixed(2)} x ${height.toFixed(2)} points`);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    /**
     * From analyzing the user's form image:
     * 
     * The form has the following visual structure:
     * - Header section (令和 年 月 日, 税務署長殿, etc.)
     * - Main data area starts around row "1" label
     * - Left column has digit boxes ending around X=244
     * - Right column has digit boxes ending around X=514
     * 
     * Measuring from the BOTTOM of the page:
     * 
     * From the image, the visible row numbers and their approximate Y positions:
     * - Row 1 (所得金額又は欠損金額): approximately 613pt from bottom
     * - Row 2 (法人税額): approximately 593pt
     * - Row 18 (所得金額の計): The image shows "0" here - approx 280pt
     * - Row 28 (法人税額計): Shows "141940" - approx 88pt
     * 
     * Critical observation from user's image:
     * - The "0" in row 18 appears to be at approximately Y=280
     * - The "1 4 1 9 4 0" in row 28 appears around Y=88
     */

    // More precise measurements based on form analysis
    const rowPositions = {
        // Left column (金額欄 左)
        row1: { x: 244, y: 613, label: '所得金額 Row1' },      // 所得金額又は欠損金額
        row2: { x: 244, y: 593, label: '法人税額 Row2' },      // 法人税額
        row3: { x: 244, y: 574, label: 'Row3' },               // 法人税額の特別控除額
        row4: { x: 244, y: 554, label: 'Row4' },               // 税額控除
        row5: { x: 244, y: 534, label: 'Row5' },               // 利子税土地譲渡利子税金
        row6: { x: 244, y: 515, label: 'Row6' },               // 控除税額
        row7: { x: 244, y: 495, label: 'Row7' },               // 控除税留保金額
        row8: { x: 244, y: 475, label: 'Row8' },               // 同上に対する税額
        row9: { x: 244, y: 456, label: 'Row9' },               // 法人税額(2)-(3)...
        row10: { x: 244, y: 436, label: 'Row10' },
        row11: { x: 244, y: 416, label: 'Row11' },
        row12: { x: 244, y: 397, label: 'Row12' },
        row13: { x: 244, y: 377, label: '差引所得 Row13' },     // 差引所得に対する法人税額
        row14: { x: 244, y: 358, label: 'Row14' },              // 中間申告分の法人税額
        row15: { x: 244, y: 338, label: 'Row15' },
        row16: { x: 244, y: 318, label: 'Row16' },
        row17: { x: 244, y: 298, label: 'Row17' },              // This should be around the 所得金額の計 area
        row18: { x: 244, y: 280, label: '所得合計 Row18★' },   // 所得金額の計 - USER'S TEST ROW

        row28: { x: 244, y: 88, label: '法人税額計 Row28' },    // 法人税額計

        // Right column
        row17R: { x: 514, y: 298, label: 'Row17右' },           // 復興特別法人税額
        row19R: { x: 514, y: 260, label: '控除税額 Row19右' },  // 控除税額
        row22R: { x: 514, y: 200, label: '中間納付 Row22右' },  // 中間納付額
    };

    // Draw markers at all positions
    Object.entries(rowPositions).forEach(([key, pos]) => {
        // Draw position marker
        page.drawCircle({
            x: pos.x,
            y: pos.y,
            size: 3,
            color: key.includes('18') ? rgb(1, 0, 0) : rgb(0, 0.5, 0),
            borderWidth: key.includes('18') ? 2 : 1
        });

        // Draw label to the right
        page.drawText(`> ${key}`, {
            x: pos.x + 5,
            y: pos.y - 2,
            size: 5,
            font: font,
            color: key.includes('18') ? rgb(1, 0, 0) : rgb(0, 0.5, 0)
        });
    });

    // Draw test digits at key positions
    // Test 1: "0" at Row 18
    const row18 = rowPositions.row18;
    page.drawText('0', {
        x: row18.x - 5,  // Center offset
        y: row18.y + 1,  // Vertical center offset
        size: 10,
        font: font,
        color: rgb(0, 0, 0.8)
    });

    // Test 2: "5000000" at Row 1
    const row1 = rowPositions.row1;
    const testValue = '5000000';
    const boxWidth = 16.15;
    for (let i = 0; i < testValue.length; i++) {
        const digitX = row1.x - (i * boxWidth) - 5;
        page.drawText(testValue[testValue.length - 1 - i], {
            x: digitX,
            y: row1.y + 1,
            size: 10,
            font: font,
            color: rgb(0, 0, 0.8)
        });
    }

    // Test 3: "141940" at Row 28
    const row28 = rowPositions.row28;
    const testValue28 = '141940';
    for (let i = 0; i < testValue28.length; i++) {
        const digitX = row28.x - (i * boxWidth) - 5;
        page.drawText(testValue28[testValue28.length - 1 - i], {
            x: digitX,
            y: row28.y + 1,
            size: 10,
            font: font,
            color: rgb(0, 0, 0.8)
        });
    }

    // Save
    const outputBytes = await pdfDoc.save();
    const outputPath = 'public/templates/beppyo1_calibration_test.pdf';
    fs.writeFileSync(outputPath, outputBytes);

    console.log(`\nCalibration PDF saved to: ${outputPath}`);
    console.log('\nTest values placed:');
    console.log('  Row 1: "5000000"');
    console.log('  Row 18: "0" (marked with red circle)');
    console.log('  Row 28: "141940"');
    console.log('\nCompare with original and adjust coordinates as needed.');

    // Output final coordinates
    console.log('\n' + '='.repeat(60));
    console.log('UPDATE pdfDigitBoxService.ts WITH THESE VALUES:');
    console.log('='.repeat(60));
    console.log(`
export const BEPPYO1_FIELDS: { [key: string]: DigitBoxConfig } = {
  '所得金額_row1': { anchorX: 244, anchorY: ${row1.y}, boxWidth: 16.15, boxSpacing: 16.15, fontSize: 10, maxDigits: 12 },
  '法人税額_row2': { anchorX: 244, anchorY: ${rowPositions.row2.y}, boxWidth: 16.15, boxSpacing: 16.15, fontSize: 10, maxDigits: 12 },
  '差引法人税額_row13': { anchorX: 244, anchorY: ${rowPositions.row13.y}, boxWidth: 16.15, boxSpacing: 16.15, fontSize: 10, maxDigits: 12 },
  '所得合計_row18': { anchorX: 244, anchorY: ${row18.y}, boxWidth: 16.15, boxSpacing: 16.15, fontSize: 10, maxDigits: 12 },
  '法人税額計_row28': { anchorX: 244, anchorY: ${row28.y}, boxWidth: 16.15, boxSpacing: 16.15, fontSize: 10, maxDigits: 12 },
  '復興税額_row17': { anchorX: 514, anchorY: ${rowPositions.row17R.y}, boxWidth: 16.15, boxSpacing: 16.15, fontSize: 10, maxDigits: 12 },
  '控除税額_row19': { anchorX: 514, anchorY: ${rowPositions.row19R.y}, boxWidth: 16.15, boxSpacing: 16.15, fontSize: 10, maxDigits: 12 },
  '中間納付_row22': { anchorX: 514, anchorY: ${rowPositions.row22R.y}, boxWidth: 16.15, boxSpacing: 16.15, fontSize: 10, maxDigits: 12 },
};
    `);
}

calibrateCoordinates().catch(console.error);
