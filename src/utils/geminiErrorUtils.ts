/**
 * Gemini APIのエラーを解析し、ユーザーフレンドリーな日本語メッセージを返します。
 * @param error キャッチされたエラーオブジェクト
 * @returns ユーザー向けの日本語エラーメッセージ
 */
export const parseGeminiError = (error: any): string => {
    if (!error) return '予期せぬエラーが発生しました。';

    const errorMessage = typeof error === 'string' ? error : error.message || JSON.stringify(error);

    // 429 Resource Exhausted (Quota Exceeded)
    if (
        errorMessage.includes('429') ||
        errorMessage.includes('Resource has been exhausted') ||
        errorMessage.includes('Quota exceeded') ||
        errorMessage.includes('RESOURCE_EXHAUSTED')
    ) {
        return '【AI利用制限】短時間の利用上限に達しました。1分ほど待ってから再試行してください。（プランの制限によるものです）';
    }

    // 400 Bad Request
    if (errorMessage.includes('400') || errorMessage.includes('INVALID_ARGUMENT')) {
        return '画像の形式が正しくないか、読み込めませんでした。別の画像を試すか、画像サイズを小さくしてください。';
    }

    // 401/403 Authentication Errors
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('API key not valid')) {
        return 'AIサービスの認証に失敗しました。システム管理者に連絡するか、APIキーの設定を確認してください。';
    }

    // 500+ Server Errors
    if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('INTERNAL')) {
        return 'AIサービス側で一時的なエラーが発生しています。しばらく待ってから再試行してください。';
    }

    // Network Errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network request failed')) {
        return 'インターネット接続を確認してください。オフラインの可能性があります。';
    }

    // Fallback for generic errors but with cleaned up message
    // Remove technical prefixes if possible
    const cleanMessage = errorMessage.replace('Gemini API Error:', '').replace('Error:', '').trim();

    // If the message is still too technical (contains JSON-like structure), return a generic one
    if (cleanMessage.includes('{') || cleanMessage.includes('[')) {
        return 'AI処理中にエラーが発生しました。しばらく待ってから再試行してください。';
    }

    return `AI処理エラー: ${cleanMessage}`;
};
