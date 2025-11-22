import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [showResetForm, setShowResetForm] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    // ネットワーク状態の監視
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // ネットワーク状態の確認
        if (!navigator.onLine) {
            setError('インターネットに接続されていません。ネットワーク接続を確認してください。');
            setLoading(false);
            return;
        }

        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login Page Error:', err);
            console.error('Error Code:', err.code);
            console.error('Error Message:', err.message);
            
            // エラーメッセージの表示
            if (err.message) {
                setError(`ログインに失敗しました: ${err.message}`);
            } else {
                setError('ログインに失敗しました。入力内容を確認してください。');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // ネットワーク状態の確認
        if (!navigator.onLine) {
            setError('インターネットに接続されていません。ネットワーク接続を確認してください。');
            setLoading(false);
            return;
        }

        try {
            // パスワードリセット機能は後で実装
            setError('パスワードリセット機能は現在利用できません。');
        } catch (err: any) {
            console.error('パスワードリセットエラー:', err);
            setError(`パスワードリセットメールの送信に失敗しました。エラー: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        Ainance
                    </h1>
                    <p className="text-text-muted">AI経理プラットフォームへようこそ</p>
                </div>

                <div className="bg-surface border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                    <h2 className="text-xl font-semibold text-text-main mb-6">
                        {showResetForm ? 'パスワードリセット' : 'ログイン'}
                    </h2>
                    
                    {/* ネットワーク状態の表示 */}
                    {!isOnline && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                            インターネットに接続されていません
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {resetSent ? (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm mb-6">
                            パスワードリセットメールを送信しました。メールをご確認ください。
                        </div>
                    ) : showResetForm ? (
                        <form onSubmit={handlePasswordReset} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    メールアドレス
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-surface-highlight border border-border rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm hover:bg-surface-hover"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isOnline}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'パスワードリセットメールを送信'
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    メールアドレス
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-surface-highlight border border-border rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm hover:bg-surface-hover"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">
                                    パスワード
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-surface-highlight border border-border rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm hover:bg-surface-hover"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isOnline}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        ログイン
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        {showResetForm ? (
                            <button
                                onClick={() => setShowResetForm(false)}
                                className="text-sm text-text-muted hover:text-primary transition-colors"
                            >
                                ログインに戻る
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowResetForm(true)}
                                className="text-sm text-text-muted hover:text-primary transition-colors"
                            >
                                パスワードをお忘れですか？
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;