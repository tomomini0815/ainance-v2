import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Edit, Trash2, Save, X, Eye } from 'lucide-react';
import { getTaxDocumentTemplates, saveTaxDocumentTemplate, deleteTaxDocumentTemplate } from '../services/TaxFilingService';

const TaxDocumentTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState<'individual' | 'corporate'>('individual');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    businessType: 'individual' as 'individual' | 'corporate',
    documentType: '',
    fields: [] as any[]
  });
  const [newField, setNewField] = useState({ 
    name: '', 
    type: 'text' as 'text' | 'number' | 'date' | 'currency' | 'boolean',
    required: false,
    defaultValue: '',
    description: ''
  });

  // 申告書テンプレートの取得
  useEffect(() => {
    fetchTemplates();
  }, [businessType]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTaxDocumentTemplates(businessType);
      setTemplates(data);
    } catch (error) {
      console.error('テンプレートの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.documentType) {
      alert('テンプレート名と書類タイプを入力してください。');
      return;
    }

    try {
      await saveTaxDocumentTemplate({
        name: newTemplate.name,
        businessType: newTemplate.businessType,
        documentType: newTemplate.documentType,
        fields: newTemplate.fields
      });
      
      // フォームをリセット
      setNewTemplate({
        name: '',
        businessType: 'individual',
        documentType: '',
        fields: []
      });
      
      setShowCreateForm(false);
      fetchTemplates();
      alert('テンプレートを作成しました。');
    } catch (error) {
      console.error('テンプレートの作成に失敗しました:', error);
      alert('テンプレートの作成に失敗しました。');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate.name || !editingTemplate.documentType) {
      alert('テンプレート名と書類タイプを入力してください。');
      return;
    }

    try {
      await saveTaxDocumentTemplate({
        name: editingTemplate.name,
        businessType: editingTemplate.businessType,
        documentType: editingTemplate.documentType,
        fields: editingTemplate.fields
      });
      
      setEditingTemplate(null);
      fetchTemplates();
      alert('テンプレートを更新しました。');
    } catch (error) {
      console.error('テンプレートの更新に失敗しました:', error);
      alert('テンプレートの更新に失敗しました。');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('このテンプレートを削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteTaxDocumentTemplate(templateId);
      fetchTemplates();
      alert('テンプレートを削除しました。');
    } catch (error) {
      console.error('テンプレートの削除に失敗しました:', error);
      alert('テンプレートの削除に失敗しました。');
    }
  };

  const handleAddField = () => {
    if (!newField.name) {
      alert('フィールド名を入力してください。');
      return;
    }
    
    setNewTemplate({
      ...newTemplate,
      fields: [...newTemplate.fields, { ...newField, id: Date.now().toString() }]
    });
    
    setNewField({ 
      name: '', 
      type: 'text',
      required: false,
      defaultValue: '',
      description: ''
    });
  };

  const handleAddFieldToEditing = () => {
    if (!newField.name) {
      alert('フィールド名を入力してください。');
      return;
    }
    
    setEditingTemplate({
      ...editingTemplate,
      fields: [...editingTemplate.fields, { ...newField, id: Date.now().toString() }]
    });
    
    setNewField({ 
      name: '', 
      type: 'text',
      required: false,
      defaultValue: '',
      description: ''
    });
  };

  const handleRemoveField = (fieldId: string) => {
    setNewTemplate({
      ...newTemplate,
      fields: newTemplate.fields.filter(field => field.id !== fieldId)
    });
  };

  const handleRemoveFieldFromEditing = (fieldId: string) => {
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields.filter((field: any) => field.id !== fieldId)
    });
  };

  const handleViewTemplate = (template: any) => {
    // テンプレートの詳細表示ロジックをここに実装
    console.log('テンプレートを表示:', template);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/tax-filing-support" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">申告書テンプレート</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">業態選択</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setBusinessType('individual')}
                  className={`px-4 py-2 rounded-md ${
                    businessType === 'individual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  個人事業主
                </button>
                <button
                  onClick={() => setBusinessType('corporate')}
                  className={`px-4 py-2 rounded-md ${
                    businessType === 'corporate'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  法人
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              テンプレートを作成
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">テンプレート名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">書類タイプ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">フィールド数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{template.name}</div>
                              <div className="text-sm text-gray-500">
                                {template.business_type === 'individual' ? '個人事業主' : '法人'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.document_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.fields?.length || 0} フィールド
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewTemplate(template)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              表示
                            </button>
                            <button
                              onClick={() => setEditingTemplate({...template, businessType: template.business_type})}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">テンプレートが見つかりません</h3>
                        <p className="mt-1 text-sm text-gray-500">まだテンプレートが作成されていません。</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* テンプレート作成モーダル */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">テンプレートを作成</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTemplate({
                      name: '',
                      businessType: 'individual',
                      documentType: '',
                      fields: []
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">テンプレート名</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 確定申告書A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">業態</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setNewTemplate({ ...newTemplate, businessType: 'individual' })}
                      className={`px-4 py-2 rounded-md ${
                        newTemplate.businessType === 'individual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      個人事業主
                    </button>
                    <button
                      onClick={() => setNewTemplate({ ...newTemplate, businessType: 'corporate' })}
                      className={`px-4 py-2 rounded-md ${
                        newTemplate.businessType === 'corporate'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      法人
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">書類タイプ</label>
                  <input
                    type="text"
                    value={newTemplate.documentType}
                    onChange={(e) => setNewTemplate({ ...newTemplate, documentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 確定申告書"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">フィールド</label>
                  <div className="space-y-3 mb-3 p-3 border border-gray-200 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="フィールド名"
                      />
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">テキスト</option>
                        <option value="number">数値</option>
                        <option value="date">日付</option>
                        <option value="currency">通貨</option>
                        <option value="boolean">真偽値</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newField.defaultValue}
                        onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="デフォルト値（オプション）"
                      />
                      <input
                        type="text"
                        value={newField.description}
                        onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="説明（オプション）"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="required"
                        checked={newField.required}
                        onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                        必須フィールド
                      </label>
                    </div>
                    <button
                      onClick={handleAddField}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      フィールドを追加
                    </button>
                  </div>
                  
                  {newTemplate.fields.length > 0 && (
                    <div className="border border-gray-200 rounded-md p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">追加されたフィールド</h3>
                      <ul className="space-y-2">
                        {newTemplate.fields.map((field: any) => (
                          <li key={field.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div>
                              <span className="font-medium">{field.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({field.type}) {field.required ? '必須' : '任意'}
                              </span>
                              {field.defaultValue && (
                                <span className="text-xs text-gray-500 ml-2">
                                  デフォルト: {field.defaultValue}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveField(field.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTemplate({
                        name: '',
                        businessType: 'individual',
                        documentType: '',
                        fields: []
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleCreateTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* テンプレート編集モーダル */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">テンプレートを編集</h2>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">テンプレート名</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 確定申告書A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">業態</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setEditingTemplate({ ...editingTemplate, businessType: 'individual' })}
                      className={`px-4 py-2 rounded-md ${
                        editingTemplate.businessType === 'individual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      個人事業主
                    </button>
                    <button
                      onClick={() => setEditingTemplate({ ...editingTemplate, businessType: 'corporate' })}
                      className={`px-4 py-2 rounded-md ${
                        editingTemplate.businessType === 'corporate'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      法人
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">書類タイプ</label>
                  <input
                    type="text"
                    value={editingTemplate.documentType}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, documentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 確定申告書"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">フィールド</label>
                  <div className="space-y-3 mb-3 p-3 border border-gray-200 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="フィールド名"
                      />
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">テキスト</option>
                        <option value="number">数値</option>
                        <option value="date">日付</option>
                        <option value="currency">通貨</option>
                        <option value="boolean">真偽値</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newField.defaultValue}
                        onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="デフォルト値（オプション）"
                      />
                      <input
                        type="text"
                        value={newField.description}
                        onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="説明（オプション）"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="required-edit"
                        checked={newField.required}
                        onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="required-edit" className="ml-2 text-sm text-gray-700">
                        必須フィールド
                      </label>
                    </div>
                    <button
                      onClick={handleAddFieldToEditing}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      フィールドを追加
                    </button>
                  </div>
                  
                  {editingTemplate.fields.length > 0 && (
                    <div className="border border-gray-200 rounded-md p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">追加されたフィールド</h3>
                      <ul className="space-y-2">
                        {editingTemplate.fields.map((field: any) => (
                          <li key={field.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div>
                              <span className="font-medium">{field.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({field.type}) {field.required ? '必須' : '任意'}
                              </span>
                              {field.defaultValue && (
                                <span className="text-xs text-gray-500 ml-2">
                                  デフォルト: {field.defaultValue}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveFieldFromEditing(field.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUpdateTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    更新
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxDocumentTemplates;