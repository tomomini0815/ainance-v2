import { generateFilledTaxForm } from './src/services/pdfAutoFillService';

const mockData = {
    name: "Test Name",
    address: "Tokyo",
    phone: "000",
    tradeName: "Ainance",
    year: 2026,
    month: 3,
    day: 15,
    revenue: 1000000,
    costOfGoods: 0,
    expenses: 0,
    netIncome: 1000000,
    expensesByCategory: [],
    deductions: {
        socialInsurance: 0,
        lifeInsurance: 0,
        basic: 480000,
        medicalExpenses: 0,
        blueReturn: 0,
    },
    businessIncome: 1000000,
    salaryIncome: 0,
    miscellaneousIncome: 0,
    totalIncome: 1000000,
    taxableIncome: 520000,
    estimatedTax: 0,
    fiscalYear: 2025,
    isBlueReturn: false,
};

async function test() {
    try {
        console.log("Starting test...");
        // Mock fetch for the template fallback
        global.fetch = async (url) => {
            console.log(`Mock fetch fetching: ${url}`);
            return {
                ok: false, // Force fallback
                statusText: "Not Found",
                arrayBuffer: async () => new ArrayBuffer(0)
            } as any;
        };

        const { pdfBytes, filename } = await generateFilledTaxForm('tax_return_b', mockData);
        console.log(`Success! Generated PDF of size ${pdfBytes.length}, filename: ${filename}`);
    } catch (err) {
        console.error("Test failed with error:", err);
    }
}

test();
