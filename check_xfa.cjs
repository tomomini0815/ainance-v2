const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function checkXFA() {
    try {
        const bytes = fs.readFileSync('public/templates/beppyo1_official.pdf');
        const pdfDoc = await PDFDocument.load(bytes);
        const catalog = pdfDoc.catalog;
        const acroForm = catalog.get(PDFDocument.context.obj('AcroForm'));

        if (acroForm) {
            console.log('AcroForm found');
            const xfa = acroForm.get(PDFDocument.context.obj('XFA'));
            if (xfa) {
                console.log('XFA found!');
            } else {
                console.log('No XFA');
            }
        } else {
            console.log('No AcroForm');
        }
    } catch (e) {
        console.error(e);
    }
}

checkXFA();
