import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
    const { signIn, signInWithGoogle, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 認証済みの場合は自動リダイレクト
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // リダイレクト先のパスを取得（デフォルトは/dashboard）
    const from = location.state?.from?.pathname || '/dashboard';

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
            // 元のページにリダイレクト、またはデフォルトの/dashboardに遷移
            navigate(from, { replace: true });
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
                        <>
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

                            {/* 区切り線 */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-surface text-text-muted">または</span>
                                </div>
                            </div>

                            {/* Googleログインボタン */}
                            <button
                                type="button"
                                onClick={async () => {
                                    setError('');
                                    setLoading(true);
                                    try {
                                        await signInWithGoogle();
                                    } catch (err: any) {
                                        console.error('Googleログインエラー:', err);
                                        setError(`Googleログインに失敗しました: ${err.message}`);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading || !isOnline}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl border border-gray-300 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Googleでログイン
                            </button>
                        </>
                    )}

                    <div className="mt-6 text-center space-y-3">
                        {showResetForm ? (
                            <button
                                onClick={() => setShowResetForm(false)}
                                className="text-sm text-text-muted hover:text-primary transition-colors"
                            >
                                ログインに戻る
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowResetForm(true)}
                                    className="text-sm text-text-muted hover:text-primary transition-colors"
                                >
                                    パスワードをお忘れですか？
                                </button>
                                <div className="pt-4 border-t border-border">
                                    <p className="text-sm text-text-muted">
                                        アカウントをお持ちでない方は
                                        <Link
                                            to="/signup"
                                            className="ml-1 text-primary hover:underline font-medium"
                                        >
                                            新規登録
                                        </Link>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;