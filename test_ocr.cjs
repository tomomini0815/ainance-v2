const Tesseract = require('tesseract.js');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function testOCR() {
    try {
        console.log('--- Testing OCR-Based Anchor Detection ---');
        // Note: In Node.js, we'd need pdf-img-convert or similar to get an image from PDF.
        // In the browser, we can use pdfjs-dist and Canvas.
        // For this test, I'll just check if Tesseract is available and can find text in a generic image.

        const result = await Tesseract.recognize(
            'https://tesseract.projectnaptha.com/img/eng_bw.png',
            'eng'
        );
        console.log('OCR Test Result:', result.data.text.substring(0, 50));
    } catch (e) {
        console.error(e);
    }
}

testOCR();
