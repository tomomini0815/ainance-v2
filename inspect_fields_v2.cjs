const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function inspectFieldCoordinates(filename) {
    try {
        console.log(`--- Inspecting ${filename} ---`);
        const bytes = fs.readFileSync(`public/templates/${filename}`);
        const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false });
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        console.log(`Total fields: ${fields.length}`);

        fields.slice(0, 10).forEach(field => {
            const name = field.getName();
            try {
                const widgets = field.acroField.getWidgets();
                if (widgets.length > 0) {
                    const rect = widgets[0].getRectangle();
                    console.log(`Field: ${name}, Rect: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`);
                } else {
                    console.log(`Field: ${name}, No widgets found`);
                }
            } catch (e) {
                console.log(`Field: ${name}, Error: ${e.message}`);
            }
        });

    } catch (e) {
        console.error(`Error loading ${filename}:`, e.message);
    }
}

async function run() {
    await inspectFieldCoordinates('01-01-a.pdf');
    await inspectFieldCoordinates('beppyo1_official.pdf');
}

run();
