const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function extractExactFieldNames() {
    try {
        const bytes = fs.readFileSync('public/templates/01-01-a.pdf');
        // Ignore encryption and try to load even with structural errors
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false });

        const form = doc.getForm();
        const fields = form.getFields();

        console.log(`--- FIELD REPORT: 01-01-a.pdf ---`);
        console.log(`Total Fields Found: ${fields.length}`);

        const report = fields.map(f => {
            return {
                name: f.getName(),
                type: f.constructor.name
            };
        });

        // Search for specific keywords in the names
        const keywords = ['Sho', 'Hou', 'Zei', 'Gaku', 'Box', 'Text', 'Line', '1'];
        const matches = report.filter(r => keywords.some(k => r.name.includes(k)));

        console.log('\nTop Matches (Likely candidates):');
        console.log(JSON.stringify(matches, null, 2));

        console.log('\nAll Fields:');
        fields.forEach(f => console.log(`- ${f.getName()}`));

    } catch (e) {
        console.error('Extraction Failed:', e.message);
    }
}

extractExactFieldNames();
