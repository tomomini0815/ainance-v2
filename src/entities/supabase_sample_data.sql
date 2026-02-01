-- transactionsテーブルのサンプルデータ
INSERT INTO transactions (item, amount, date, category, type, description, receipt_url, creator, tags, location, recurring, recurring_frequency) VALUES
('給与', 300000.00, '2023-10-01', '収入', '給与', '10月分給与', NULL, 'user1', ARRAY['給与'], '会社', false, NULL),
('家賃', -80000.00, '2023-10-05', '支出', '光熱費', '10月分家賃', NULL, 'user1', ARRAY['家賃'], '自宅', true, 'monthly'),
('コンビニ', -1200.00, '2023-10-10', '支出', '食費', '夕食', '/receipts/conv_1.jpg', 'user1', ARRAY['食費'], '近所のコンビニ', false, NULL),
('電車定期券', -15000.00, '2023-10-15', '支出', '交通費', '11月分定期券', '/receipts/train_1.jpg', 'user1', ARRAY['交通費'], 'JR駅', true, 'monthly'),
('Amazon購入', -4500.00, '2023-10-20', '支出', '消耗品費', '書籍購入', '/receipts/amazon_1.jpg', 'user1', ARRAY['消耗品費'], 'オンライン', false, NULL);

-- ai_transactionsテーブルのサンプルデータ
INSERT INTO ai_transactions (item, amount, category, confidence, ai_category, manual_verified, original_text, receipt_url, location, creator, ai_suggestions, learning_feedback, processing_time) VALUES
('新宿駅前タクシー', 2200.00, '交通費', 98, '交通費', true, '新宿駅前タクシー 2023/10/15 2200円', '/receipts/taxi_1.jpg', '新宿区', 'user1', ARRAY['交通費', '移動費'], '正解', 0.45),
('スターバックスコーヒー', 580.00, '食費', 95, '食費', true, 'スターバックスコーヒー 渋谷店 2023/10/16 580円', '/receipts/starbucks_1.jpg', '渋谷区', 'user1', ARRAY['食費', 'カフェ'], '正解', 0.32),
('Google広告費', 15000.00, '広告費', 92, '広告費', false, 'Google 広告サービス 2023/10/18 15000円', '/receipts/google_ads_1.jpg', 'オンライン', 'user1', ARRAY['広告費', 'マーケティング'], NULL, 0.55),
('コンビニATM手数料', 210.00, 'その他', 76, 'その他', false, 'セブンイレブン ATM手数料 2023/10/19 210円', '/receipts/atm_fee_1.jpg', '渋谷区', 'user1', ARRAY['その他', '手数料'], NULL, 0.28),
('Amazonクラウドサービス', 8500.00, '通信費', 88, '通信費', false, 'Amazon Web Services 2023/10/25 8500円', '/receipts/aws_1.jpg', 'オンライン', 'user1', ARRAY['通信費', 'クラウド'], NULL, 0.67);