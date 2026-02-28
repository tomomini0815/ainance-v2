import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 座標更新API
app.post('/api/update-coordinates', (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    const servicePath = path.join(__dirname, 'src', 'services', 'pdfDigitBoxService.ts');

    try {
        if (!fs.existsSync(servicePath)) {
            return res.status(500).json({ error: `File not found: ${servicePath}` });
        }

        const currentContent = fs.readFileSync(servicePath, 'utf-8');
        
        // 置き換えマーカーの検索
        const startMarker = '// <<< COORDINATE_DATA_START >>>';
        const endMarker = '// <<< COORDINATE_DATA_END >>>';
        
        const startIndex = currentContent.indexOf(startMarker);
        const endIndex = currentContent.indexOf(endMarker);

        if (startIndex === -1 || endIndex === -1) {
            return res.status(500).json({ error: 'Could not find markers in file' });
        }

        // 新しい内容の構築
        const newCodeTrimmed = code.trim();
        const updatedContent = currentContent.substring(0, startIndex) + 
                             startMarker + '\n' + 
                             newCodeTrimmed + '\n' + 
                             endMarker + 
                             currentContent.substring(endIndex + endMarker.length);

        fs.writeFileSync(servicePath, updatedContent, 'utf-8');
        
        console.log('✅ pdfDigitBoxService.ts updated successfully');
        res.json({ success: true });
    } catch (err: any) {
        console.error('❌ Error updating file:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Coordinate Update Server listening at http://localhost:${port}`);
});
