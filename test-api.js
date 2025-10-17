import fetch from 'node-fetch';

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: '2025-10-08',
        description: 'テスト取引',
        amount: 1000,
        type: 'income',
        category: 'その他',
        payment_method: null,
        tags: []
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();