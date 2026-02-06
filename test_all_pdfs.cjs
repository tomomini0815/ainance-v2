const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function testOthers() {
    const files = ['beppyo1_official.pdf', 'beppyo4_official.pdf', '01-01-a.pdf'];
    for (const file of files) {
        try {
            const bytes = fs.readFileSync(`public/templates/${file}`);
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            console.log(`${file}: Loaded. Page count: ${doc.getPageCount()}`);
        } catch (e) {
            console.error(`${file}: Failed. ${e.message}`);
        }
    }
}

testOthers();
