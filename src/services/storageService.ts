
import { supabase } from '../lib/supabaseClient';

export const storageService = {
    /**
     * 決算書・貸借対照表などの証憑ファイルをアップロード
     * @param userId ユーザーID
     * @param file アップロードするファイル
     * @param year 年度
     * @param type 書類タイプ ('pl' | 'bs')
     * @returns 保存されたファイルパス
     */
    async uploadFinancialDocument(userId: string, file: File, year: number, type: 'pl' | 'bs'): Promise<string | null> {
        try {
            // ファイル名の生成: {年度}_{タイプ}_{タイムスタンプ}.{拡張子}
            const ext = file.name.split('.').pop();
            const fileName = `${year}_${type}_${Date.now()}.${ext}`;
            // パス: {userId}/{fileName}
            const filePath = `${userId}/${fileName}`;

            console.log('Uploading file to:', filePath);

            const { data, error } = await supabase.storage
                .from('financial_documents')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Storage Upload Error:', error);
                throw error;
            }

            console.log('File uploaded successfully:', data.path);
            return data.path;
        } catch (error) {
            console.error('uploadFinancialDocument Error:', error);
            throw error;
        }
    },

    /**
     * ファイルの署名付きURL（ダウンロード用）を取得
     * @param path ストレージ内のファイルパス
     * @returns 署名付きURL
     */
    async getSignedUrl(path: string): Promise<string | null> {
        try {
            if (!path) return null;

            const { data, error } = await supabase.storage
                .from('financial_documents')
                .createSignedUrl(path, 60 * 60); // 1時間有効

            if (error) {
                console.error('Get Signed URL Error:', error);
                return null; // エラー時はnullを返す（呼び出し元でハンドリング）
            }

            return data.signedUrl;
        } catch (error) {
            console.error('getSignedUrl Error:', error);
            return null;
        }
    }
};
