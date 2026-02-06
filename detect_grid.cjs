const pdfjsLib = require('pdfjs-dist');
const fs = require('fs');

async function detectGrid() {
    try {
        const data = new Uint8Array(fs.readFileSync('public/templates/beppyo1_official.pdf'));
        const loadingTask = pdfjsLib.getDocument({ data });
        const doc = await loadingTask.promise;
        const page = await doc.getPage(1);
        const ops = await page.getOperatorList();

        const vLines = [];
        const hLines = [];

        for (let i = 0; i < ops.fnArray.length; i++) {
            const fn = ops.fnArray[i];
            const args = ops.argsArray[i];

            // re (rectangle) [x, y, w, h] - common for boxes
            if (fn === pdfjsLib.OPS.re) {
                const [x, y, w, h] = args;
                if (Math.abs(w) < 2) vLines.push(x);
                if (Math.abs(h) < 2) hLines.push(y);
            }
            // m/l (move/line) - also common
            // fn === 14/15/etc. 
            // In pdfjs-dist common.js:
            // m: 14, l: 15
            if (fn === 14 || fn === 15) {
                // This is harder to parse as they come in sequences.
            }
        }

        // Find clusters of vertical lines
        vLines.sort((a, b) => a - b);
        const uniqueV = [...new Set(vLines.map(v => Math.round(v * 10) / 10))];

        console.log('Unique V-Lines (X):');
        console.log(uniqueV.join(', '));

        hLines.sort((a, b) => a - b);
        const uniqueH = [...new Set(hLines.map(v => Math.round(v * 10) / 10))];
        console.log('Unique H-Lines (Y):');
        console.log(uniqueH.join(', '));

    } catch (e) {
        console.error(e);
    }
}

detectGrid();
