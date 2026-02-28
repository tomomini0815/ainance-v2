const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
(async () => {
    const pdfBytes = fs.readFileSync('C:\\Users\\userv\\Downloads\\Ainance-v2\\public\\templates\\beppyo5_1_official.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    console.log('Pages:', pdfDoc.getPageCount());
    console.log('Fields:', pdfDoc.getForm().getFields().map(f => f.getName()));
})();
