const fs = require('fs');
let content = fs.readFileSync('C:\\Users\\userv\\Downloads\\Ainance-v2\\src\\services\\pdfDigitBoxService.ts', 'utf8');

// We want to add ", noGrid: true " before the closing "}" for all BEPPYO except BEPPYO1
const patternsToFix = [
    'BEPPYO4_FIELDS',
    'BEPPYO5_PAGE1_FIELDS',
    'BEPPYO5_PAGE2_FIELDS',
    'BEPPYO15_FIELDS',
    'BEPPYO16_1_FIELDS',
    'BEPPYO16_2_FIELDS'
];

patternsToFix.forEach(pattern => {
    const startIndex = content.indexOf(`export const ${pattern}`);
    if (startIndex === -1) return;

    const endIndex = content.indexOf('};', startIndex);
    if (endIndex === -1) return;

    let block = content.substring(startIndex, endIndex);

    // Replace 'maxDigits: 12 }' with 'maxDigits: 12, noGrid: true }'
    block = block.replace(/maxDigits:\s*\d+\s*\}/g, match => {
        return match.replace('}', ', noGrid: true }');
    });

    content = content.substring(0, startIndex) + block + content.substring(endIndex);
});

fs.writeFileSync('C:\\Users\\userv\\Downloads\\Ainance-v2\\src\\services\\pdfDigitBoxService.ts', content, 'utf8');
console.log('Successfully updated noGrid flags');
