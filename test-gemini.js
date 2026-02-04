import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.VITE_GEMINI_API_KEY;

const logFile = path.resolve(process.cwd(), 'model_list.txt');
const log = (msg) => {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
};

// Clear log
fs.writeFileSync(logFile, '');

log('--- Start Diagnosis ---');

if (!apiKey) {
    log('ERROR: No API Key');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (res.statusCode === 200) {
                log('SUCCESS. Models:');
                if (json.models) {
                    json.models.forEach(m => {
                        log(m.name.replace('models/', ''));
                    });
                }
            } else {
                log(`FAILURE: ${res.statusCode}`);
                log(JSON.stringify(json));
            }
        } catch (e) {
            log('Parse Error');
        }
    });
});
