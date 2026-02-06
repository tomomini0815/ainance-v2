const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function checkFields() {
    const templatesDir = path.join(__dirname, 'public', 'templates');
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.pdf'));

    for (const file of files) {
        console.log(`\n--- Checking ${file} ---`);
        const pdfBytes = fs.readFileSync(path.join(templatesDir, file));
        try {
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const form = pdfDoc.getForm();
            const fields = form.getFields();

            if (fields.length === 0) {
                console.log('No form fields found in this PDF.');
            } else {
                console.log(`Found ${fields.length} fields:`);
                fields.forEach(field => {
                    const type = field.constructor.name;
                    const name = field.getName();
                    console.log(`- [${type}] ${name}`);
                });
            }
        } catch (e) {
            console.error(`Error loading ${file}: ${e.message}`);
        }
    }
}

checkFields();
