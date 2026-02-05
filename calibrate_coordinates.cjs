/**
 * Precision Coordinate Calibration
 * 
 * Based on analyzing the visual preview (Screenshot), this script
 * places test markers at nudged positions to achieve perfect alignment.
 * 
 * RUN: node calibrate_coordinates.cjs
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function calibrateCoordinates() {
    console.log('='.repeat(60));
    console.log('PRECISION COORDINATE CALIBRATION (NUDGED)');
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

    // ANALYZED SHIFTS:
    // X: Need to move right by approx 10.5pt (244 -> 254.5)
    // Y: Row 1 needs to come down slightly (613 -> 608.5)
    // Y: Row 18 needs to come down slightly (280 -> 276.5)
    // Y: Row 28 needs to come down slightly (88 -> 86.5)

    const rowPositions = {
        // Left column (金額欄 左)
        row1: { x: 254.5, y: 608.5, label: 'Row1' },
        row2: { x: 254.5, y: 588.5, label: 'Row2' },
        row3: { x: 254.5, y: 569.0, label: 'Row3' },
        row4: { x: 254.5, y: 549.5, label: 'Row4' },
        row5: { x: 254.5, y: 530.0, label: 'Row5' },
        row6: { x: 254.5, y: 510.5, label: 'Row6' },
        row7: { x: 254.5, y: 491.0, label: 'Row7' },
        row8: { x: 254.5, y: 471.5, label: 'Row8' },
        row9: { x: 254.5, y: 452.0, label: 'Row9' },
        row13: { x: 254.5, y: 373.5, label: 'Row13' },
        row18: { x: 254.5, y: 276.5, label: 'Row18' },
        row28: { x: 254.5, y: 86.5, label: 'Row28' },

        // Right column
        row17R: { x: 524.5, y: 294.0, label: 'Row17R' },
        row19R: { x: 524.5, y: 256.0, label: 'Row19R' },
        row22R: { x: 524.5, y: 196.5, label: 'Row22R' },
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
    const testValues = [
        { row: rowPositions.row1, value: '5000000' },
        { row: rowPositions.row18, value: '0' },
        { row: rowPositions.row28, value: '141940' }
    ];

    const boxWidth = 16.15;
    const digitCenterOffsetX = -3;
    const digitCenterOffsetY = 1;

    testValues.forEach(test => {
        const val = test.value;
        const row = test.row;
        for (let i = 0; i < val.length; i++) {
            const digitX = row.x - (i * boxWidth) + digitCenterOffsetX;
            page.drawText(val[val.length - 1 - i], {
                x: digitX,
                y: row.y + digitCenterOffsetY,
                size: 10,
                font: font,
                color: rgb(0, 0, 0.8)
            });
        }
    });

    // Save
    const outputBytes = await pdfDoc.save();
    const outputPath = 'public/templates/beppyo1_calibration_test.pdf';
    fs.writeFileSync(outputPath, outputBytes);

    console.log(`\nCalibration PDF updated: ${outputPath}`);
}

calibrateCoordinates().catch(console.error);
