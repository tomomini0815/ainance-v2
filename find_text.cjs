const fs = require('fs');

function extractTextSimple() {
    try {
        const bytes = fs.readFileSync('public/templates/beppyo1_official.pdf');
        const text = bytes.toString('latin1');

        // Search for strings in parentheses or hex brackets
        const matches = text.match(/\((.*?)\)|<([0-9a-fA-F]+)>/g);
        if (matches) {
            console.log(`Found ${matches.length} potential text chunks.`);
            // Filter only some interesting ones (trying to find Japanese text)
            // Japanese text is often hex encoded or CID
            const hexMatches = matches.filter(m => m.startsWith('<') && m.length > 10);
            console.log(`Found ${hexMatches.length} hex chunks.`);
            if (hexMatches.length > 0) {
                console.log('Sample Hex:', hexMatches.slice(0, 5));
            }
        } else {
            console.log('No text fragments found.');
        }
    } catch (e) {
        console.error(e.message);
    }
}

extractTextSimple();
