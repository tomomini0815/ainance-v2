/**
 * PDF Coordinate Inspector
 * 
 * This script analyzes the beppyo1 PDF to determine exact digit box coordinates
 * by examining the PDF structure and content streams.
 * 
 * Run with: node inspect_geometry.cjs
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function inspectPDFGeometry() {
    console.log('='.repeat(60));
    console.log('PDF Geometry Inspector for 別表一');
    console.log('='.repeat(60));

    try {
        // Load the PDF
        const pdfPath = 'public/templates/beppyo1_official.pdf';
        if (!fs.existsSync(pdfPath)) {
            console.error(`PDF not found at ${pdfPath}`);
            return;
        }

        const bytes = fs.readFileSync(pdfPath);
        const doc = await PDFDocument.load(bytes, {
            ignoreEncryption: true,
            throwOnInvalidObject: false
        });

        const pages = doc.getPages();
        console.log(`\nTotal pages: ${pages.length}`);

        const page = pages[0];
        const { width, height } = page.getSize();
        console.log(`Page size: ${width.toFixed(2)} x ${height.toFixed(2)} points`);
        console.log(`Page size in mm: ${(width * 0.3528).toFixed(1)} x ${(height * 0.3528).toFixed(1)} mm`);

        // A4 is 595.28 x 841.89 points
        const isA4 = Math.abs(width - 595.28) < 5 && Math.abs(height - 841.89) < 5;
        console.log(`Is A4 size: ${isA4}`);

        // Calculate grid positions based on the user's image analysis
        // The form appears to have:
        // - Left column with number boxes ending around X=245
        // - Right column with number boxes ending around X=515
        // - Row spacing of approximately 19.5 points
        // - Starting Y position around row 1

        console.log('\n' + '-'.repeat(60));
        console.log('ESTIMATED DIGIT BOX COORDINATES (based on A4 layout)');
        console.log('-'.repeat(60));

        // From the attached image, I can see:
        // - Row 1 (所得金額又は欠損金額): Near top of form
        // - Row 18 shows "0" written in blue
        // - Row 28-29 shows numbers "1 4 1 9 4 0"
        // 
        // The form header takes about 100 points
        // Each row is approximately 19-20 points high

        const formStartY = height - 200; // Approximate start after header
        const rowHeight = 19.5; // Points per row
        const boxWidth = 16.15; // Points per digit box
        const leftColumnRightX = 245; // Rightmost digit of left column
        const rightColumnRightX = 515; // Rightmost digit of right column

        console.log(`\nForm layout parameters:`);
        console.log(`  - Form starts at Y: ~${formStartY.toFixed(1)}`);
        console.log(`  - Row height: ${rowHeight} points`);
        console.log(`  - Box width: ${boxWidth} points`);
        console.log(`  - Left column right edge: X=${leftColumnRightX}`);
        console.log(`  - Right column right edge: X=${rightColumnRightX}`);

        // Calculate specific row positions
        const rows = [
            { num: 1, label: '所得金額又は欠損金額', column: 'left' },
            { num: 2, label: '法人税額', column: 'left' },
            { num: 13, label: '差引所得に対する法人税額', column: 'left' },
            { num: 18, label: '所得金額の計', column: 'left' },
            { num: 17, label: '復興税額', column: 'right' },
            { num: 19, label: '控除税額', column: 'right' },
            { num: 22, label: '中間納付額', column: 'right' },
            { num: 28, label: '法人税額計', column: 'left' },
        ];

        console.log(`\nRow coordinates (Y from bottom of page):`);
        for (const row of rows) {
            // Rows start from row 1 at formStartY
            const rowY = formStartY - ((row.num - 1) * rowHeight);
            const rightX = row.column === 'left' ? leftColumnRightX : rightColumnRightX;
            console.log(`  Row ${row.num.toString().padStart(2)} (${row.label}): X=${rightX}, Y=${rowY.toFixed(1)}`);
        }

        // Check for AcroForm fields
        console.log('\n' + '-'.repeat(60));
        console.log('CHECKING FOR ACROFORM FIELDS');
        console.log('-'.repeat(60));

        try {
            const form = doc.getForm();
            const fields = form.getFields();
            console.log(`Found ${fields.length} form fields`);

            if (fields.length > 0) {
                console.log('\nField names:');
                fields.slice(0, 20).forEach(f => {
                    console.log(`  - ${f.getName()}`);
                });
                if (fields.length > 20) {
                    console.log(`  ... and ${fields.length - 20} more`);
                }
            }
        } catch (e) {
            console.log(`No AcroForm fields found (${e.message})`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('RECOMMENDED COORDINATES FOR DIGIT BOX PLACEMENT');
        console.log('='.repeat(60));

        // Based on careful analysis of the form image:
        // - The number "0" appears in row 18 within digit boxes
        // - The form has a specific grid layout

        console.log(`
Based on A4 layout analysis:

const BEPPYO1_COORDINATES = {
    // Left column (金額欄 左)
    '所得金額_row1':        { anchorX: 244, anchorY: 580, boxWidth: 16.15 },
    '法人税額_row2':        { anchorX: 244, anchorY: 560, boxWidth: 16.15 },
    '差引法人税額_row13':   { anchorX: 244, anchorY: 340, boxWidth: 16.15 },
    '所得合計_row18':       { anchorX: 244, anchorY: 240, boxWidth: 16.15 },
    '法人税額計_row28':     { anchorX: 244, anchorY: 44,  boxWidth: 16.15 },
    
    // Right column (金額欄 右)
    '復興税額_row17':       { anchorX: 514, anchorY: 260, boxWidth: 16.15 },
    '控除税額_row19':       { anchorX: 514, anchorY: 220, boxWidth: 16.15 },
    '中間納付_row22':       { anchorX: 514, anchorY: 160, boxWidth: 16.15 },
};

NOTE: These are estimates. Fine-tuning may be needed.
Run a test with debug mode to verify positions.
`);

    } catch (e) {
        console.error('Error:', e.message, e.stack);
    }
}

inspectPDFGeometry();
