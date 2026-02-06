const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function inspectPageSize() {
    try {
        const bytes = fs.readFileSync('public/templates/01-01-a.pdf');
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = doc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        console.log(`File: 01-01-a.pdf`);
        console.log(`Page Size: ${width.toFixed(2)} x ${height.toFixed(2)}`);

        // Check if it has any text layer (optional check for Tier 2)
        // Note: pdf-lib doesn't support text extraction easily, but we can check for existing content
    } catch (e) {
        console.error('Error:', e.message);
    }
}

inspectPageSize();
