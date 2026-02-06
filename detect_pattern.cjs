const pdfjsLib = require('pdfjs-dist');
const fs = require('fs');

async function detectGridPattern() {
    try {
        const data = new Uint8Array(fs.readFileSync('public/templates/beppyo1_official.pdf'));
        const loadingTask = pdfjsLib.getDocument({ data });
        const doc = await loadingTask.promise;
        const page = await doc.getPage(1);
        const ops = await page.getOperatorList();

        const points = [];
        let currentX = 0, currentY = 0;

        for (let i = 0; i < ops.fnArray.length; i++) {
            const fn = ops.fnArray[i];
            const args = ops.argsArray[i];

            // 14: moveTo, 15: lineTo, 18: rectangle (RE)
            if (fn === 14 || fn === 15) {
                points.push({ x: args[0], y: args[1] });
            } else if (fn === 18) {
                points.push({ x: args[0], y: args[1] });
            }
        }

        // Search for a sequence of dots forming a horizontal line of approx 200pt (12 boxes * 16pt)
        // Or a cluster of vertical lines.
        const xCoords = points.map(p => Math.round(p.x * 10) / 10);
        const counts = {};
        xCoords.forEach(x => counts[x] = (counts[x] || 0) + 1);

        // Find X coordinates that appear exactly N times (where N is number of rows)
        const candidates = Object.entries(counts)
            .filter(([x, count]) => count >= 5) // At least 5 rows
            .map(([x]) => parseFloat(x))
            .sort((a, b) => a - b);

        console.log('Candidate Vertical Lines (X):', candidates);

        // Check for 16.1~16.2 spacing
        for (let i = 0; i < candidates.length - 1; i++) {
            const diff = candidates[i + 1] - candidates[i];
            if (diff > 15 && diff < 17) {
                console.log(`Detected Grid Column! Spacer: ${diff.toFixed(2)} at X=${candidates[i]}`);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

detectGridPattern();
