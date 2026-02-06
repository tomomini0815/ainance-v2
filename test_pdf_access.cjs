const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function testGetPage() {
    try {
        const bytes = fs.readFileSync('public/templates/01-01-a.pdf');
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        console.log('Document loaded successfully');

        try {
            const pageCount = doc.getPageCount();
            console.log('Page count:', pageCount);

            const page = doc.getPage(0);
            console.log('Page 0 retrieved');

            const { width, height } = page.getSize();
            console.log('Size:', width, height);
        } catch (inner) {
            console.error('Inner error (Page access):', inner.message);
            console.error(inner.stack);
        }

    } catch (e) {
        console.error('Outer error (Load):', e.message);
    }
}

testGetPage();
