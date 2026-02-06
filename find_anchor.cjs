const pdfjsLib = require('pdfjs-dist');
const fs = require('fs');

async function findAnchor() {
    try {
        const data = new Uint8Array(fs.readFileSync('public/templates/beppyo1_official.pdf'));
        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true
        });
        const doc = await loadingTask.promise;
        console.log('Doc pages:', doc.numPages);
        const page = await doc.getPage(1);
        const textContent = await page.getTextContent();

        console.log('Total items found:', textContent.items.length);

        textContent.items.forEach(item => {
            // Log everything to find the labels
            console.log(`[${item.transform[4].toFixed(1)}, ${item.transform[5].toFixed(1)}] -> "${item.str}"`);
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}

findAnchor();
