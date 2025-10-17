import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// MySQL接続プールの作成
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'finance_app',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// トランザクションデータの取得API
app.get('/api/transactions', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM transactions ORDER BY date DESC');
    connection.release();
    
    // tagsを配列に変換
    const formattedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('取引履歴の取得に失敗:', error);
    res.status(500).json({ error: '取引履歴の取得に失敗しました' });
  }
});

// AIトランザクションデータの取得API
app.get('/api/ai-transactions', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM ai_transactions ORDER BY created_at DESC');
    connection.release();
    
    // ai_suggestionsを配列に変換
    const formattedRows = rows.map(row => ({
      ...row,
      ai_suggestions: row.ai_suggestions ? JSON.parse(row.ai_suggestions) : []
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('AI取引履歴の取得に失敗:', error);
    res.status(500).json({ error: 'AI取引履歴の取得に失敗しました' });
  }
});

// 新しいトランザクションの作成API
app.post('/api/transactions', async (req, res) => {
  try {
    const transactionData = req.body;
    
    const connection = await pool.getConnection();
    
    // tagsをJSON文字列に変換
    const dataToInsert = {
      date: transactionData.date,
      description: transactionData.item || transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      category: transactionData.category,
      payment_method: transactionData.payment_method,
      tags: transactionData.tags ? JSON.stringify(transactionData.tags) : null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    const [result] = await connection.query(
      'INSERT INTO transactions SET ?',
      dataToInsert
    );
    connection.release();
    
    res.status(201).json({ id: result.insertId, ...transactionData });
  } catch (error) {
    console.error('取引の作成に失敗:', error);
    res.status(500).json({ error: '取引の作成に失敗しました' });
  }
});

// トランザクションの更新API
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const updates = req.body;
    
    const connection = await pool.getConnection();
    
    // tagsをJSON文字列に変換
    const dataToUpdate = {
      ...updates,
      tags: updates.tags ? JSON.stringify(updates.tags) : null,
      updated_at: new Date().toISOString()
    };
    
    await connection.query(
      'UPDATE transactions SET ? WHERE id = ?',
      [dataToUpdate, transactionId]
    );
    connection.release();
    
    res.json({ id: transactionId, ...updates });
  } catch (error) {
    console.error('取引の更新に失敗:', error);
    res.status(500).json({ error: '取引の更新に失敗しました' });
  }
});

// トランザクションの削除API
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM transactions WHERE id = ?', [transactionId]);
    connection.release();
    
    res.json({ message: '取引が正常に削除されました' });
  } catch (error) {
    console.error('取引の削除に失敗:', error);
    res.status(500).json({ error: '取引の削除に失敗しました' });
  }
});

// AIトランザクションの確認API
app.put('/api/ai-transactions/:id/verify', async (req, res) => {
  try {
    const aiTransactionId = req.params.id;
    const { verified, feedback } = req.body;
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE ai_transactions SET manual_verified = ?, learning_feedback = ?, updated_at = NOW() WHERE id = ?',
      [verified, feedback, aiTransactionId]
    );
    connection.release();
    
    res.json({ message: verified ? 'AI分類を承認しました' : 'AI分類を却下しました' });
  } catch (error) {
    console.error('AI取引の確認に失敗:', error);
    res.status(500).json({ error: 'AI取引の確認に失敗しました' });
  }
});

// テスト用エンドポイント - トランザクションテーブルの内容を確認
app.get('/api/test/transactions', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM transactions');
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('テストクエリに失敗:', error);
    res.status(500).json({ error: 'テストクエリに失敗しました' });
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました`);
});

export default app;