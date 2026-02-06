const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function testProportionalScaling() {
    const width = 595.28;
    const height = 841.89;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([width, height]);

    const drawAmountRel = (amount, relX, relY) => {
        const text = String(amount);
        const textWidth = 20; // Simulated
        const x = (width * relX) - textWidth;
        const y = height * (1 - relY);
        console.log(`Amount: ${amount}, Calculated X: ${x.toFixed(2)}, Calculated Y: ${y.toFixed(2)}`);
    };

    // Test Beppyo 1 所得金額 (260/595, 200/842)
    const leftRelX = 260 / 595;
    const firstRelY = 200 / 842;
    drawAmountRel(1234567, leftRelX, firstRelY);

    // Expected X should be around 240 (260 - 20)
    // Expected Y should be around 642 (842 - 200)
}

testProportionalScaling();
