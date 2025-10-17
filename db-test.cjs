const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root1234',
      database: 'finance_app'
    });

    console.log('データベース接続成功!');

    // transactionsテーブルの構造を確認
    const [rows] = await connection.execute('DESCRIBE transactions');
    console.log('transactionsテーブル構造:');
    console.table(rows);

    await connection.end();
  } catch (error) {
    console.error('データベース接続エラー:', error.message);
  }
}

testConnection();