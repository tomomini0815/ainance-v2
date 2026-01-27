import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Minimize2, Calendar } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { parseChatTransactionWithAI } from '../services/geminiAIService';
import { determineCategoryByKeyword } from '../services/keywordCategoryService';

const DashboardChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isProcessing, setIsProcessing] = useState(false);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: 'こんにちは！AIアシスタントです。\n「タクシー代 2500円」のように入力すると、自動で家計簿に記録します。' }
    ]);

    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { createTransaction } = useTransactions(user?.id, currentBusinessType?.business_type);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isProcessing) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsProcessing(true);

        try {
            if (!user?.id) throw new Error('ログインが必要です');

            // AI解析
            const aiData = await parseChatTransactionWithAI(userMessage);
            let transactionData;

            if (aiData) {
                transactionData = {
                    item: aiData.item || 'AIチャット入力',
                    description: aiData.description || aiData.item,
                    amount: aiData.amount,
                    // AIが日付を特定できなかった場合は、ユーザーが選択した「基準日」を使用する
                    date: aiData.date || selectedDate,
                    category: aiData.category || '未分類',
                    type: (aiData.type as 'income' | 'expense') || 'expense',
                    creator: user.id,
                    approval_status: 'pending' as const,
                    tags: ['ai-chat']
                };
            } else {
                // フォールバックロジック
                // (Optional: Implement fallback similar to OmniEntryPortal if needed, or rely on AI)
                // Simplified fallback for now
                let amount = 0;
                const amountTextMatch = userMessage.match(/(\d+(?:[,\d]*\d+)?(?:万|千)?(?:円)?)/);
                if (amountTextMatch) {
                    let text = amountTextMatch[1].replace(/円|,/g, '');
                    if (text.includes('万')) {
                        const parts = text.split('万');
                        amount = (parseFloat(parts[0]) || 0) * 10000;
                        if (parts[1]) amount += (parseFloat(parts[1].replace('千', '')) || 0) * 1000;
                    } else {
                        amount = parseFloat(text) || 0;
                    }
                }
                const detectedCategory = determineCategoryByKeyword(userMessage) || '未分類';

                transactionData = {
                    item: userMessage,
                    description: userMessage,
                    amount: amount,
                    date: selectedDate,
                    category: detectedCategory,
                    type: 'expense' as 'income' | 'expense',
                    creator: user.id,
                    approval_status: 'pending' as const,
                    tags: ['ai-chat', 'fallback']
                };
            }

            // 取引記録
            const result = await createTransaction(transactionData);
            if (result.error) throw result.error;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `✅ 記録しました！\n科目: ${transactionData.category}\n金額: ¥${transactionData.amount.toLocaleString()}\n(確認待ちに追加されました)`
            }]);

            window.dispatchEvent(new CustomEvent('transactionRecorded'));

        } catch (error: any) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ エラーが発生しました: ${error.message}`
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`fixed bottom-6 md:bottom-24 right-6 z-40 flex flex-col items-end transition-all duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-0'}`}>
            {/* Chat Window */}
            {isOpen && (
                <div className="relative bg-white dark:bg-surface border border-border shadow-2xl rounded-2xl w-80 sm:w-96 h-[500px] mb-4 flex flex-col overflow-visible animate-in slide-in-from-bottom-5 duration-200">
                    {/* Tail */}
                    <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-surface border-b border-r border-border rotate-45 z-0" />

                    <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-white dark:bg-surface rounded-2xl">
                        {/* Header */}
                        <div className="bg-primary/5 p-4 border-b border-border flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-text-main">AIアシスタント</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-highlight/30">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-surface border border-border text-text-main rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isProcessing && (
                                <div className="flex justify-start">
                                    <div className="bg-surface border border-border text-text-main rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-surface">
                            <div className="flex items-center gap-2">
                                {/* Date Picker Button */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => dateInputRef.current?.showPicker()}
                                        className={`p-2.5 rounded-xl transition-all ${selectedDate !== new Date().toISOString().split('T')[0]
                                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                            : 'bg-surface-highlight text-text-muted hover:text-text-main hover:bg-surface-highlight/80'
                                            }`}
                                        title="日付を選択 (基準日)"
                                    >
                                        <Calendar className="w-5 h-5" />
                                    </button>
                                    {selectedDate !== new Date().toISOString().split('T')[0] && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                    <input
                                        type="date"
                                        ref={dateInputRef}
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
                                    />
                                </div>

                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="例: ランチ 1000円"
                                        className="w-full pl-4 pr-12 py-3 bg-surface-highlight border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main text-sm"
                                        disabled={isProcessing}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isProcessing}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center gap-2 px-5 py-4 rounded-full shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen
                    ? 'bg-surface-highlight text-text-muted border border-border hover:bg-surface-highlight/80'
                    : 'bg-gradient-to-r from-primary to-blue-600 text-white'
                    }`}
            >
                {isOpen ? (
                    <>
                        <Minimize2 className="w-5 h-5" />
                        <span className="font-bold text-sm hidden sm:inline">閉じる</span>
                    </>
                ) : (
                    <>
                        <Bot className="w-6 h-6" />
                        <span className="font-bold text-sm hidden sm:inline">AIで記帳</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default DashboardChatbot;
