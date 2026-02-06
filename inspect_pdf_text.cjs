const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function inspectText() {
    try {
        const bytes = fs.readFileSync('public/templates/beppyo1_official.pdf');
        const doc = await PDFDocument.load(bytes);
        const pages = doc.getPages();
        console.log(`Analyzing ${pages.length} pages...`);

        // pdf-lib doesn't easily expose text position extraction, 
        // we'd need a more specialized library for full OCR/Text-Search.
        // But we can check for Font objects or other indicators.
        const page = pages[0];
        console.log('Page Size:', page.getSize());

        // Checking for 'Contents' which holds the drawing commands
        const contents = page.node.get(doc.context.obj('Contents'));
        if (contents) {
            console.log('Text/Content stream found.');
        } else {
            console.log('No content stream found. Might be a flat image.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

inspectText();
