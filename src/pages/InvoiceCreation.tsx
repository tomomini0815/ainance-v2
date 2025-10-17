
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, FileText, Send, Eye } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

const InvoiceCreation: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [documentType, setDocumentType] = useState<'invoice' | 'individual-tax' | 'corporate-tax'>('invoice');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 10 }
  ]);
  const [notes, setNotes] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 10
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * item.taxRate / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // 申告書用の特別な計算（例：必要経費の計算）
  const calculateDeduction = () => {
    if (documentType !== 'individual-tax' && documentType !== 'corporate-tax') return 0;
    
    // ここに必要経費の計算ロジックを実装
    // 例として、総収入の10%を必要経費として計算
    const totalIncome = items
      .filter(item => item.unitPrice > 0)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    return totalIncome * 0.1;
  };

  const calculateTaxableIncome = () => {
    if (documentType !== 'individual-tax' && documentType !== 'corporate-tax') return 0;
    
    const totalIncome = items
      .filter(item => item.unitPrice > 0)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    return totalIncome - calculateDeduction();
  };

  const calculateTaxAmount = () => {
    if (documentType !== 'individual-tax' && documentType !== 'corporate-tax') return 0;
    
    // 仮に所得税率5%として計算
    return calculateTaxableIncome() * 0.05;
  };

  const handleSave = () => {
    if (documentType === 'invoice') {
      // 請求書保存ロジック
      console.log('請求書を保存しました');
    } else {
      // 申告書保存ロジック
      console.log(`${documentType === 'individual-tax' ? '個人事業主申告書' : '法人税申告書'}を保存しました`);
    }
  };

  const handleSend = () => {
    if (documentType === 'invoice') {
      // 請求書送信ロジック
      console.log('請求書を送信しました');
    } else {
      // 申告書送信ロジック
      console.log(`${documentType === 'individual-tax' ? '個人事業主申告書' : '法人税申告書'}を送信しました`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {documentType === 'invoice' && '請求書作成'}
            {documentType === 'individual-tax' && '個人事業主申告書作成'}
            {documentType === 'corporate-tax' && '法人税申告書作成'}
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">ドキュメントタイプ</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setDocumentType('invoice')}
                className={`px-4 py-2 rounded-md ${
                  documentType === 'invoice'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                請求書
              </button>
              <button
                onClick={() => setDocumentType('individual-tax')}
                className={`px-4 py-2 rounded-md ${
                  documentType === 'individual-tax'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                個人事業主申告書
              </button>
              <button
                onClick={() => setDocumentType('corporate-tax')}
                className={`px-4 py-2 rounded-md ${
                  documentType === 'corporate-tax'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                法人税申告書
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {documentType === 'invoice' ? '顧客名' : '氏名/会社名'}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={documentType === 'invoice' ? '顧客名を入力' : '氏名/会社名を入力'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {documentType === 'invoice' ? '顧客住所' : '住所'}
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={documentType === 'invoice' ? '顧客住所を入力' : '住所を入力'}
              />
            </div>
            {documentType === 'invoice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">請求書番号</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請求書番号を入力"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {documentType === 'invoice' ? '請求日' : '作成日'}
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {documentType === 'invoice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">支払期日</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            {(documentType === 'individual-tax' || documentType === 'corporate-tax') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">確定申告年度</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 令和5年分"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">税務署</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="管轄税務署名"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {documentType === 'invoice' ? '請求項目' : '明細項目'}
              </h2>
              <button
                onClick={addItem}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                項目を追加
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {documentType === 'invoice' ? '項目' : '内容'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単価</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">税率</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="項目を入力"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.taxRate}
                          onChange={(e) => updateItem(item.id, 'taxRate', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value={0}>0%</option>
                          <option value={8}>8%</option>
                          <option value={10}>10%</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ¥{(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="備考を入力"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">小計:</span>
                  <span className="font-medium">¥{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">消費税:</span>
                  <span className="font-medium">¥{calculateTax().toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">合計:</span>
                  <span className="text-lg font-bold text-gray-900">¥{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              プレビュー
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {documentType === 'invoice' ? '保存' : '提出書類を保存'}
            </button>
            <button
              onClick={handleSend}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              {documentType === 'invoice' ? '送信' : '提出書類を送信'}
            </button>
          </div>
        </div>

        {/* プレビュー */}
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">請求書プレビュー</h2>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {documentType === 'invoice' && '請求書'}
                        {documentType === 'individual-tax' && '個人事業主申告書'}
                        {documentType === 'corporate-tax' && '法人税申告書'}
                      </h1>
                      {documentType === 'invoice' && (
                        <p className="text-gray-600">請求書番号: {invoiceNumber || 'N/A'}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">
                        {documentType === 'invoice' ? '発行日' : '作成日'}: {invoiceDate || 'N/A'}
                      </p>
                      {documentType === 'invoice' && (
                        <p className="text-gray-600">支払期日: {dueDate || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  
                  {(documentType === 'individual-tax' || documentType === 'corporate-tax') && (
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-gray-600">確定申告年度: 令和5年分</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">管轄税務署: 東京税務署</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {documentType === 'invoice' ? '請求元' : '提出者'}
                      </h3>
                      <p className="text-gray-600">Ainance会計事務所</p>
                      <p className="text-gray-600">〒100-0001 東京都千代田区</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {documentType === 'invoice' ? '請求先' : '提出先'}
                      </h3>
                      <p className="text-gray-600">{clientName || '顧客名'}</p>
                      <p className="text-gray-600">{clientAddress || '顧客住所'}</p>
                    </div>
                  </div>
                  
                  {(documentType === 'individual-tax' || documentType === 'corporate-tax') && (
                    <div className="mb-8 bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">申告情報</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm text-gray-600">総収入</p>
                          <p className="text-lg font-bold">¥{calculateSubtotal().toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm text-gray-600">必要経費</p>
                          <p className="text-lg font-bold">¥{calculateDeduction().toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm text-gray-600">課税所得</p>
                          <p className="text-lg font-bold">¥{calculateTaxableIncome().toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-blue-100">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-600">申告税額</p>
                          <p className="text-xl font-bold text-red-600">¥{calculateTaxAmount().toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">項目</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単価</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">税率</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description || '項目'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">¥{item.unitPrice.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.taxRate}%</td>
                            <td className="px-4 py-3 text-sm text-gray-900">¥{(item.quantity * item.unitPrice).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">小計:</span>
                        <span className="font-medium">¥{calculateSubtotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">消費税:</span>
                        <span className="font-medium">¥{calculateTax().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-gray-200">
                        <span className="text-lg font-bold text-gray-900">合計:</span>
                        <span className="text-lg font-bold text-gray-900">¥{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {notes && (
                    <div className="mt-8">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">備考</h3>
                      <p className="text-gray-600">{notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceCreation;
