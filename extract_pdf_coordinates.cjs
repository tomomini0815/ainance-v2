/**
 * PDF Text Coordinate Extractor
 * 
 * Uses pdf.js-extract to scan the beppyo1 PDF and extract ALL text
 * elements with their EXACT coordinates. This allows us to find
 * the precise positions of row labels (1, 2, 3...) and use them
 * as anchors for digit placement.
 * 
 * Run: node extract_pdf_coordinates.cjs
 */

const { PDFExtract } = require('pdf.js-extract');
const fs = require('fs');

const pdfExtract = new PDFExtract();

async function extractCoordinates() {
    console.log('='.repeat(70));
    console.log('PDF TEXT COORDINATE EXTRACTOR - 別表一');
    console.log('='.repeat(70));

    const pdfPath = 'public/templates/beppyo1_official.pdf';

    if (!fs.existsSync(pdfPath)) {
        console.error(`PDF not found: ${pdfPath}`);
        return;
    }

    try {
        const data = await pdfExtract.extract(pdfPath, {});

        console.log(`\nTotal pages: ${data.pages.length}`);

        const page = data.pages[0];
        console.log(`Page dimensions: ${page.pageInfo.width.toFixed(2)} x ${page.pageInfo.height.toFixed(2)}`);
        console.log(`Total text elements: ${page.content.length}`);

        // Group text by approximate Y coordinate (within 5pt tolerance)
        const rowMap = new Map();

        page.content.forEach(item => {
            const y = Math.round(item.y);
            const roundedY = Math.round(y / 5) * 5; // Round to nearest 5pt

            if (!rowMap.has(roundedY)) {
                rowMap.set(roundedY, []);
            }
            rowMap.get(roundedY).push({
                text: item.str,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height
            });
        });

        // Sort rows by Y coordinate (descending - top to bottom in PDF coords)
        const sortedRows = Array.from(rowMap.entries()).sort((a, b) => b[0] - a[0]);

        console.log('\n' + '-'.repeat(70));
        console.log('EXTRACTED TEXT BY ROW (Top to Bottom)');
        console.log('-'.repeat(70));

        // Find key labels for calibration
        const keyLabels = [
            '所得金額又は欠損金額',
            '法人税額',
            '差引所得に対する法人税額',
            '中間申告分の法人税額',
            '所得税額等の控除額',
            '中間納付額',
        ];

        const foundLabels = [];

        sortedRows.forEach(([y, items], index) => {
            // Concatenate text in this row
            const rowText = items.map(i => i.text).join(' ');

            // Check if this row contains a key label
            const isKeyRow = keyLabels.some(label => rowText.includes(label));

            // Check if row contains row number (1, 2, 3, etc.)
            const hasRowNum = items.some(i => /^[0-9]+$/.test(i.text.trim()));

            if (isKeyRow || (index < 50 && rowText.trim().length > 0)) {
                console.log(`\nY=${y.toString().padStart(4)}:`);
                items.forEach(item => {
                    console.log(`    X=${item.x.toFixed(1).padStart(6)}: "${item.text}" (w=${item.width.toFixed(1)})`);
                });

                if (isKeyRow) {
                    foundLabels.push({ y, text: rowText, items });
                }
            }
        });

        console.log('\n' + '='.repeat(70));
        console.log('KEY LABELS FOUND (for coordinate calibration)');
        console.log('='.repeat(70));

        foundLabels.forEach(label => {
            console.log(`\nY=${label.y}: "${label.text.substring(0, 40)}..."`);
            // Find rightmost X in this row (for digit box alignment)
            const rightmostItem = label.items.reduce((max, item) =>
                (item.x + item.width) > (max.x + max.width) ? item : max
            );
            console.log(`   Rightmost text: X=${(rightmostItem.x + rightmostItem.width).toFixed(1)}`);
        });

        // Look for digit boxes by finding repeated space patterns
        console.log('\n' + '='.repeat(70));
        console.log('DETECTING DIGIT BOX PATTERNS');
        console.log('='.repeat(70));

        // Find rows that might have digit boxes (look for patterns of numbers or empty boxes)
        page.content.forEach(item => {
            // Check if this is a single digit or number
            if (/^[0-9]$/.test(item.str.trim())) {
                console.log(`Single digit "${item.str}" at X=${item.x.toFixed(1)}, Y=${item.y.toFixed(1)}`);
            }
        });

        // Generate coordinate configuration
        console.log('\n' + '='.repeat(70));
        console.log('SUGGESTED COORDINATE CONFIGURATION');
        console.log('='.repeat(70));

        // Find row numbers (1, 2, 3, etc.) and their Y positions
        const rowNumbers = [];
        page.content.forEach(item => {
            const match = item.str.match(/^([0-9]+)$/);
            if (match) {
                const num = parseInt(match[1]);
                if (num >= 1 && num <= 50) {
                    rowNumbers.push({
                        num,
                        x: item.x,
                        y: item.y,
                        width: item.width
                    });
                }
            }
        });

        // Sort and deduplicate
        const uniqueRows = new Map();
        rowNumbers.forEach(row => {
            if (!uniqueRows.has(row.num) || row.x < uniqueRows.get(row.num).x) {
                uniqueRows.set(row.num, row);
            }
        });

        const sortedRowNums = Array.from(uniqueRows.entries())
            .sort((a, b) => a[0] - b[0])
            .slice(0, 30);

        console.log('\nRow number positions found:');
        sortedRowNums.forEach(([num, pos]) => {
            console.log(`  Row ${num.toString().padStart(2)}: Y=${pos.y.toFixed(1)}`);
        });

        // Calculate average row spacing
        if (sortedRowNums.length >= 2) {
            let totalSpacing = 0;
            for (let i = 1; i < Math.min(sortedRowNums.length, 10); i++) {
                totalSpacing += sortedRowNums[i - 1][1].y - sortedRowNums[i][1].y;
            }
            const avgSpacing = totalSpacing / (Math.min(sortedRowNums.length, 10) - 1);
            console.log(`\nAverage row spacing: ${avgSpacing.toFixed(2)}pt`);
        }

        // Output final coordinate suggestions
        console.log('\n' + '='.repeat(70));
        console.log('FINAL COORDINATE MAP');
        console.log('='.repeat(70));

        console.log(`
Based on PDF analysis, use these coordinates:

// In pdfDigitBoxService.ts
const CALIBRATED_BEPPYO1_FIELDS = {`);

        sortedRowNums.forEach(([num, pos]) => {
            // Estimate right edge of digit boxes (about 244pt from left)
            const digitBoxRightX = 244; // Left column
            console.log(`  'row${num}': { anchorX: ${digitBoxRightX}, anchorY: ${pos.y.toFixed(0)}, boxWidth: 16.15 },`);
        });

        console.log(`};`);

        // Save raw data to JSON for further analysis
        const outputData = {
            pageWidth: page.pageInfo.width,
            pageHeight: page.pageInfo.height,
            rowNumbers: sortedRowNums.map(([num, pos]) => ({ rowNum: num, ...pos })),
            allContent: page.content.slice(0, 500) // First 500 elements
        };

        fs.writeFileSync('pdf_coordinates.json', JSON.stringify(outputData, null, 2));
        console.log('\nRaw coordinate data saved to pdf_coordinates.json');

    } catch (error) {
        console.error('Error extracting PDF:', error.message);
        console.error(error.stack);
    }
}

extractCoordinates();
