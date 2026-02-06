const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function dumpAllStrings() {
    try {
        const bytes = fs.readFileSync('public/templates/beppyo1_official.pdf');
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false });

        console.log('--- ALL STRINGS DUMP ---');
        const objects = doc.context.enumerateFreeObjects(); // This is not what I want

        // Let's just look for any text that looks like a field name
        const text = bytes.toString('utf-8');
        const matches = text.match(/\/T\s*\((.*?)\)/g);
        if (matches) {
            console.log('Found potential Field Names (/T):');
            matches.forEach(m => console.log(m));
        }

        const matches2 = text.match(/\/V\s*\((.*?)\)/g);
        if (matches2) {
            console.log('Found potential Values (/V):');
            matches2.forEach(m => console.log(m));
        }

        // Check for XFA field names in XML
        const xfaMatch = text.match(/<field name="(.*?)"/g);
        if (xfaMatch) {
            console.log('Found potential XFA Field Names:');
            xfaMatch.slice(0, 20).forEach(m => console.log(m));
        }

    } catch (e) {
        console.error(e.message);
    }
}

dumpAllStrings();
