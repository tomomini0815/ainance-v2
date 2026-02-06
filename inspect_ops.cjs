const pdfjsLib = require('pdfjs-dist');
const fs = require('fs');

async function inspectOperators() {
    try {
        const data = new Uint8Array(fs.readFileSync('public/templates/beppyo1_official.pdf'));
        const loadingTask = pdfjsLib.getDocument({ data });
        const doc = await loadingTask.promise;
        const page = await doc.getPage(1);
        const ops = await page.getOperatorList();

        console.log('Total operators:', ops.fnArray.length);

        const counts = {};
        ops.fnArray.forEach(fn => {
            counts[fn] = (counts[fn] || 0) + 1;
        });

        console.log('Operator counts:', JSON.stringify(counts, null, 2));

        // Let's look for PaintPath (15 in some versions, or named ops)
        // Or constructPath (12)
        // Check for specific coordinates of rects/lines
        for (let i = 0; i < ops.fnArray.length; i++) {
            const fn = ops.fnArray[i];
            const args = ops.argsArray[i];

            // In pdfjs-dist, op values are numbers. 
            // constructPath is often 14, 15, etc.
            // Let's print the first few RE (RECT) args if any
            if (fn === pdfjsLib.OPS.constructPath || fn === pdfjsLib.OPS.re) {
                console.log(`Path construction at index ${i}:`, args);
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

inspectOperators();
