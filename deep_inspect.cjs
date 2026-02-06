const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function deepInspect() {
    try {
        const bytes = fs.readFileSync('public/templates/beppyo1_official.pdf');
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false });

        console.log('--- DEEP INSPECTION ---');
        const form = doc.getForm();
        const fields = form.getFields();
        console.log('Summary Fields Count:', fields.length);

        // Let's try to find XFA
        const xfa = doc.catalog.get(doc.context.obj('AcroForm'))?.get(doc.context.obj('XFA'));
        if (xfa) {
            console.log('XFA DETECTED! This is why standard fields might be hidden.');
        }

        // List all keys in AcroForm
        const acroForm = doc.catalog.get(doc.context.obj('AcroForm'));
        if (acroForm) {
            console.log('AcroForm Keys:', acroForm.keys().map(k => k.toString()));
        }

        // Try to find any Annots on page 0
        const pages = doc.getPages();
        const firstPage = pages[0];
        const annots = firstPage.node.get(doc.context.obj('Annots'));
        if (annots) {
            console.log('Annots found on Page 0:', annots.size());
        }

        fields.forEach(f => console.log(`Field Name: "${f.getName()}"`));

    } catch (e) {
        console.error('Error:', e.message);
    }
}

deepInspect();
