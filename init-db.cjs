const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  try {
    // MySQL接続プールの作成（データベース指定なし）
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // データベース作成
    const connection = await pool.getConnection();
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || 'ainance'}`);
    console.log('データベースが正常に作成されました');
    
    // データベース選択
    await connection.query(`USE ${process.env.MYSQL_DATABASE || 'ainance'}`);
    
    // transactionsテーブル作成
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        receipt_url VARCHAR(500),
        creator VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        tags TEXT,
        location VARCHAR(255),
        recurring BOOLEAN DEFAULT FALSE,
        recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly'))
      )
    `);
    console.log('transactionsテーブルが正常に作成されました');
    
    // ai_transactionsテーブル作成
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        confidence INT CHECK (confidence >= 0 AND confidence <= 100),
        ai_category VARCHAR(100) CHECK (ai_category IN ('交通費', '食費', '消耗品費', '通信費', '光熱費', 'その他')),
        manual_verified BOOLEAN DEFAULT FALSE,
        original_text TEXT,
        receipt_url VARCHAR(500),
        location VARCHAR(255),
        creator VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ai_suggestions TEXT,
        learning_feedback TEXT,
        processing_time DECIMAL(5, 2)
      )
    `);
    console.log('ai_transactionsテーブルが正常に作成されました');
    
    // インデックス作成（エラーを避けるために個別に処理）
    try {
      await connection.query('CREATE INDEX idx_transactions_date ON transactions(date)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
    
    try {
      await connection.query('CREATE INDEX idx_transactions_category ON transactions(category)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
    
    try {
      await connection.query('CREATE INDEX idx_transactions_creator ON transactions(creator)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
    
    try {
      await connection.query('CREATE INDEX idx_ai_transactions_created_at ON ai_transactions(created_at)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
    
    try {
      await connection.query('CREATE INDEX idx_ai_transactions_confidence ON ai_transactions(confidence)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
    
    try {
      await connection.query('CREATE INDEX idx_ai_transactions_manual_verified ON ai_transactions(manual_verified)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
    
    try {
      await connection.query('CREATE INDEX idx_ai_transactions_creator ON ai_transactions(creator)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
    
    console.log('インデックスが正常に作成されました');
    
    connection.release();
    pool.end();
    
    console.log('データベースの初期化が完了しました');
  } catch (error) {
    console.error('データベースの初期化に失敗しました:', error);
  }
}

initDatabase();