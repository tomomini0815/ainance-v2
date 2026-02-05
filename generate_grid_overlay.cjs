/**
 * Visual Grid Overlay Generator
 * 
 * Since the beppyo1 PDF is image-based (no extractable text),
 * this script generates a calibration PDF with a visible grid overlay
 * that can be compared with the original to determine exact coordinates.
 * 
 * Run: node generate_grid_overlay.cjs
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function generateGridOverlay() {
    console.log('='.repeat(60));
    console.log('GRID OVERLAY GENERATOR FOR COORDINATE CALIBRATION');
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

    // Draw horizontal grid lines every 20 points
    const gridSpacing = 20;

    // Draw Y-axis grid lines and labels
    for (let y = 0; y <= height; y += gridSpacing) {
        const color = y % 100 === 0 ? rgb(1, 0, 0) : rgb(0.7, 0.7, 0.7);
        const thickness = y % 100 === 0 ? 1 : 0.25;

        page.drawLine({
            start: { x: 0, y: y },
            end: { x: width, y: y },
            thickness: thickness,
            color: color
        });

        // Label every 100pt
        if (y % 100 === 0) {
            page.drawText(`Y=${y}`, {
                x: 5,
                y: y + 2,
                size: 6,
                font: font,
                color: rgb(1, 0, 0)
            });
        }
    }

    // Draw X-axis grid lines and labels
    for (let x = 0; x <= width; x += gridSpacing) {
        const color = x % 100 === 0 ? rgb(0, 0, 1) : rgb(0.8, 0.8, 0.8);
        const thickness = x % 100 === 0 ? 1 : 0.25;

        page.drawLine({
            start: { x: x, y: 0 },
            end: { x: x, y: height },
            thickness: thickness,
            color: color
        });

        // Label every 100pt at the bottom
        if (x % 100 === 0) {
            page.drawText(`X=${x}`, {
                x: x + 2,
                y: 5,
                size: 6,
                font: font,
                color: rgb(0, 0, 1)
            });
        }
    }

    // Mark specific positions for digit box testing
    const testPositions = [
        // Left column - estimated digit box right edges
        { x: 244, y: 622, label: 'Row1' },
        { x: 244, y: 602, label: 'Row2' },
        { x: 244, y: 388, label: 'Row13' },
        { x: 244, y: 290, label: 'Row18' },
        { x: 244, y: 95, label: 'Row28' },

        // Right column
        { x: 514, y: 310, label: 'Row17R' },
        { x: 514, y: 270, label: 'Row19R' },
        { x: 514, y: 210, label: 'Row22R' },
    ];

    testPositions.forEach(pos => {
        // Draw crosshair at position
        page.drawCircle({
            x: pos.x,
            y: pos.y,
            size: 5,
            borderColor: rgb(1, 0, 0),
            borderWidth: 1
        });

        // Add label
        page.drawText(`${pos.label}\n(${pos.x},${pos.y})`, {
            x: pos.x + 8,
            y: pos.y - 3,
            size: 7,
            font: font,
            color: rgb(1, 0, 0)
        });
    });

    // Draw digit box simulation at Row 18
    console.log('\nDrawing test digits at Row 18...');
    const boxWidth = 16.15;
    const row18Y = 290;
    const row18X = 244;

    // Draw "0" at Row 18 to test alignment
    page.drawText('0', {
        x: row18X - 3, // Nudge left to center
        y: row18Y + 2,  // Nudge up to center
        size: 10,
        font: font,
        color: rgb(0, 0, 0.8)
    });

    // Draw 5000000 at Row 1 to test
    const row1Y = 622;
    const digits = '5000000';
    for (let i = 0; i < digits.length; i++) {
        page.drawText(digits[digits.length - 1 - i], {
            x: row18X - (i * boxWidth) - 3,
            y: row1Y + 2,
            size: 10,
            font: font,
            color: rgb(0, 0, 0.8)
        });
    }

    // Save the calibration PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = 'public/templates/beppyo1_grid_overlay.pdf';
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`\nGrid overlay PDF saved to: ${outputPath}`);
    console.log('\nOpen this PDF and compare with the original to');
    console.log('determine correct Y coordinates for each row.');
    console.log('\nLook for:');
    console.log('  - Red circles marking estimated positions');
    console.log('  - Grid lines every 20pt (bold every 100pt)');
    console.log('  - Test digits "0" at Row 18 and "5000000" at Row 1');
}

generateGridOverlay().catch(console.error);
