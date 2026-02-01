const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('環境変数の値:');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);

async function testServerDBConnection() {
  try {
    // MySQL接続プールの作成
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'ainance',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 接続テスト
    const connection = await pool.getConnection();
    console.log('MySQLデータベースに正常に接続しました');
    
    // 簡単なクエリを実行
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('クエリ実行結果:', rows[0].solution);
    
    connection.release();
    pool.end();
  } catch (error) {
    console.error('MySQLデータベースへの接続に失敗しました:', error);
  }
}

testServerDBConnection();