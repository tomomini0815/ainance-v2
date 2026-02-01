import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {ArrowLeft, Plus, Save, Send, Eye, Download, Search, Calendar, Calculator, User, Building, FileText, Mail, Phone, X, Check, Copy, Trash2, CreditCard, Banknote, Edit} from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface Customer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  taxNumber: string
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

interface BankAccount {
  id: string
  bankName: string
  branchName: string
  accountType: 'savings' | 'checking'
  accountNumber: string
  accountHolder: string
  isDefault: boolean
}

interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  customer: Customer | null
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  notes: string
  bankAccount: BankAccount | null
}

interface Template {
  id: string
  name: string
  description: string
  items: InvoiceItem[]
  notes: string
}

const InvoiceCreation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'templates' | 'history' | 'bank'>('create')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)
  const [showBankFormModal, setShowBankFormModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null)
  const [showCustomerFormModal, setShowCustomerFormModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'ウェブサイト制作',
      quantity: 1,
      unitPrice: 300000,
      taxRate: 10,
      amount: 300000
    }
  ])

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: '三菱UFJ銀行',
      branchName: '渋谷支店',
      accountType: 'checking',
      accountNumber: '1234567',
      accountHolder: '株式会社サンプル',
      isDefault: true
    },
    {
      id: '2',
      bankName: 'みずほ銀行',
      branchName: '新宿支店',
      accountType: 'savings',
      accountNumber: '9876543',
      accountHolder: '株式会社サンプル',
      isDefault: false
    }
  ])

  const [bankForm, setBankForm] = useState({
    bankName: '',
    branchName: '',
    accountType: 'checking' as 'savings' | 'checking',
    accountNumber: '',
    accountHolder: '',
    isDefault: false
  })

  const [customerForm, setCustomerForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: ''
  })

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: '田中太郎',
      company: '株式会社サンプル',
      email: 'tanaka@sample.co.jp',
      phone: '03-1234-5678',
      address: '東京都渋谷区1-1-1',
      taxNumber: 'T1234567890123'
    },
    {
      id: '2',
      name: '佐藤花子',
      company: '合同会社テスト',
      email: 'sato@test.co.jp',
      phone: '03-9876-5432',
      address: '東京都新宿区2-2-2',
      taxNumber: 'T9876543210987'
    },
    {
      id: '3',
      name: '鈴木一郎',
      company: 'フリーランス',
      email: 'suzuki@freelance.jp',
      phone: '090-1234-5678',
      address: '大阪府大阪市北区3-3-3',
      taxNumber: 'T5555666677778'
    }
  ])

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'ウェブ制作標準',
      description: 'ウェブサイト制作の標準的な請求項目',
      items: [
        { id: '1', description: 'ウェブサイト制作', quantity: 1, unitPrice: 300000, taxRate: 10, amount: 300000 },
        { id: '2', description: 'ドメイン設定', quantity: 1, unitPrice: 5000, taxRate: 10, amount: 5000 }
      ],
      notes: '納期: 契約から30日以内'
    },
    {
      id: '2',
      name: 'コンサルティング',
      description: 'コンサルティング業務の標準請求',
      items: [
        { id: '1', description: 'コンサルティング業務', quantity: 10, unitPrice: 15000, taxRate: 10, amount: 150000 }
      ],
      notes: '月次コンサルティング料金'
    }
  ])

  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-2024-001',
      date: '2024-01-15',
      dueDate: '2024-02-14',
      customer: customers[0],
      items: [],
      subtotal: 300000,
      taxAmount: 30000,
      total: 330000,
      status: 'sent',
      notes: '',
      bankAccount: bankAccounts[0]
    },
    {
      id: '2',
      number: 'INV-2024-002',
      date: '2024-01-10',
      dueDate: '2024-02-09',
      customer: customers[1],
      items: [],
      subtotal: 150000,
      taxAmount: 15000,
      total: 165000,
      status: 'paid',
      notes: '',
      bankAccount: bankAccounts[0]
    },
    {
      id: '3',
      number: 'INV-2024-003',
      date: '2024-01-05',
      dueDate: '2024-02-04',
      customer: customers[2],
      items: [],
      subtotal: 80000,
      taxAmount: 8000,
      total: 88000,
      status: 'overdue',
      notes: '',
      bankAccount: bankAccounts[1]
    }
  ])

  const [invoiceForm, setInvoiceForm] = useState({
    number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  })

  const [sendOptions, setSendOptions] = useState({
    sendPdf: true,
    sendMail: false,
    confirmationEmail: true,
    reminderEmail: false
  })

  // 通知表示
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  // 計算関数
  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTax = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  // 振込先口座管理
  const openBankForm = (bank?: BankAccount) => {
    if (bank) {
      setEditingBank(bank)
      setBankForm({
        bankName: bank.bankName,
        branchName: bank.branchName,
        accountType: bank.accountType,
        accountNumber: bank.accountNumber,
        accountHolder: bank.accountHolder,
        isDefault: bank.isDefault
      })
    } else {
      setEditingBank(null)
      setBankForm({
        bankName: '',
        branchName: '',
        accountType: 'checking',
        accountNumber: '',
        accountHolder: '',
        isDefault: false
      })
    }
    setShowBankFormModal(true)
  }

  const saveBankAccount = () => {
    if (!bankForm.bankName || !bankForm.branchName || !bankForm.accountNumber || !bankForm.accountHolder) {
      showNotification('error', 'すべての項目を入力してください')
      return
    }

    if (editingBank) {
      // 編集
      setBankAccounts(accounts => accounts.map(account => 
        account.id === editingBank.id 
          ? { ...account, ...bankForm }
          : bankForm.isDefault 
            ? { ...account, isDefault: false }
            : account
      ))
      showNotification('success', '振込先情報を更新しました')
    } else {
      // 新規追加
      const newBank: BankAccount = {
        id: Date.now().toString(),
        ...bankForm
      }
      
      if (bankForm.isDefault) {
        setBankAccounts(accounts => [
          newBank,
          ...accounts.map(account => ({ ...account, isDefault: false }))
        ])
      } else {
        setBankAccounts(accounts => [...accounts, newBank])
      }
      showNotification('success', '振込先情報を追加しました')
    }

    setShowBankFormModal(false)
    setBankForm({
      bankName: '',
      branchName: '',
      accountType: 'checking',
      accountNumber: '',
      accountHolder: '',
      isDefault: false
    })
    setEditingBank(null)
  }

  const deleteBankAccount = (bankId: string) => {
    setBankAccounts(accounts => accounts.filter(account => account.id !== bankId))
    if (selectedBankAccount?.id === bankId) {
      setSelectedBankAccount(null)
    }
    showNotification('success', '振込先情報を削除しました')
  }

  const setDefaultBank = (bankId: string) => {
    setBankAccounts(accounts => accounts.map(account => ({
      ...account,
      isDefault: account.id === bankId
    })))
    showNotification('success', 'デフォルト振込先を設定しました')
  }

  // 顧客管理
  const openCustomerForm = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setCustomerForm({
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        taxNumber: customer.taxNumber
      })
    } else {
      setEditingCustomer(null)
      setCustomerForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        taxNumber: ''
      })
    }
    setShowCustomerFormModal(true)
  }

  const saveCustomer = () => {
    if (!customerForm.name || !customerForm.company || !customerForm.email) {
      showNotification('error', '必須項目を入力してください')
      return
    }

    if (editingCustomer) {
      // 編集
      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id 
          ? { ...customer, ...customerForm }
          : customer
      ))
      showNotification('success', '顧客情報を更新しました')
    } else {
      // 新規追加
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...customerForm
      }
      setCustomers(prev => [...prev, newCustomer])
      showNotification('success', '顧客情報を追加しました')
    }

    setShowCustomerFormModal(false)
    setCustomerForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      taxNumber: ''
    })
    setEditingCustomer(null)
  }

  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId))
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null)
    }
    showNotification('success', '顧客情報を削除しました')
  }

  // PDFダウンロード機能（日本語対応版）
  const downloadPDF = () => {
    if (!selectedCustomer) {
      showNotification('error', '請求先を選択してください')
      return
    }

    try {
      const doc = new jsPDF()
      
      // 日本語フォント設定（Helveticaで代用し、日本語部分は英数字で表現）
      doc.setFont('helvetica')
      
      // ヘッダー
      doc.setFontSize(24)
      doc.text('INVOICE', 105, 30, { align: 'center' })
      doc.setFontSize(16)
      doc.text('Seikyusho', 105, 40, { align: 'center' })
      
      // 請求元情報（英語表記）
      doc.setFontSize(10)
      doc.text('From:', 20, 60)
      doc.text('Your Company Name', 20, 70)
      doc.text('123-4567 Tokyo, Japan', 20, 80)
      doc.text('TEL: 03-0000-0000', 20, 90)
      
      // 請求先情報（可能な限り英語表記）
      doc.text('To:', 120, 60)
      doc.text(selectedCustomer.company, 120, 70)
      doc.text(`${selectedCustomer.name} sama`, 120, 80)
      doc.text('Tokyo, Japan', 120, 90)
      doc.text(`TEL: ${selectedCustomer.phone}`, 120, 100)
      
      // 請求書情報
      doc.text(`Invoice No: ${invoiceForm.number}`, 20, 120)
      doc.text(`Issue Date: ${invoiceForm.date}`, 20, 130)
      doc.text(`Due Date: ${invoiceForm.dueDate}`, 20, 140)
      
      // 合計金額
      doc.setFontSize(14)
      doc.text(`Total Amount: ¥${calculateTotal().toLocaleString()}`, 120, 130)
      
      // 請求項目テーブル
      const tableData = invoiceItems.map(item => [
        item.description,
        item.quantity.toString(),
        `¥${item.unitPrice.toLocaleString()}`,
        `${item.taxRate}%`,
        `¥${item.amount.toLocaleString()}`
      ])

      // autoTableの型定義を修正
      ;(doc as any).autoTable({
        head: [['Description', 'Qty', 'Unit Price', 'Tax Rate', 'Amount']],
        body: tableData,
        startY: 160,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'center' },
          4: { halign: 'right' }
        }
      })

      // 合計計算部分
      const finalY = (doc as any).lastAutoTable.finalY + 20
      
      doc.setFontSize(10)
      doc.text('Subtotal:', 140, finalY)
      doc.text(`¥${calculateSubtotal().toLocaleString()}`, 170, finalY)
      
      doc.text('Tax:', 140, finalY + 10)
      doc.text(`¥${calculateTax().toLocaleString()}`, 170, finalY + 10)
      
      doc.line(140, finalY + 15, 190, finalY + 15)
      
      doc.setFontSize(12)
      doc.text('Total:', 140, finalY + 25)
      doc.text(`¥${calculateTotal().toLocaleString()}`, 170, finalY + 25)
      
      // 振込先情報（英語表記）
      if (selectedBankAccount) {
        const bankY = finalY + 40
        doc.setFontSize(10)
        doc.text('Bank Transfer Information:', 20, bankY)
        doc.text(`Bank: ${selectedBankAccount.bankName}`, 20, bankY + 10)
        doc.text(`Branch: ${selectedBankAccount.branchName}`, 20, bankY + 20)
        doc.text(`Account Type: ${selectedBankAccount.accountType === 'checking' ? 'Checking' : 'Savings'}`, 20, bankY + 30)
        doc.text(`Account No: ${selectedBankAccount.accountNumber}`, 20, bankY + 40)
        doc.text(`Account Holder: ${selectedBankAccount.accountHolder}`, 20, bankY + 50)
      }
      
      // 備考（英語で記載）
      if (invoiceForm.notes) {
        const notesY = finalY + 100
        doc.text('Notes:', 20, notesY)
        const lines = doc.splitTextToSize(invoiceForm.notes, 170)
        doc.text(lines, 20, notesY + 10)
      }
      
      // PDFを保存
      doc.save(`${invoiceForm.number}.pdf`)
      showNotification('success', 'PDFをダウンロードしました')
      
    } catch (error) {
      console.error('PDF生成エラー:', error)
      showNotification('error', 'PDF生成中にエラーが発生しました')
    }
  }

  // 請求項目操作
  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 10,
      amount: 0
    }
    setInvoiceItems([...invoiceItems, newItem])
  }

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(items => items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice
        }
        return updatedItem
      }
      return item
    }))
  }

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(items => items.filter(item => item.id !== id))
    } else {
      showNotification('error', '最低1つの項目が必要です')
    }
  }

  // メイン機能ボタン
  const handlePreview = () => {
    if (!selectedCustomer) {
      showNotification('error', '請求先を選択してください')
      return
    }
    if (invoiceItems.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      showNotification('error', '請求項目を正しく入力してください')
      return
    }
    setShowPreviewModal(true)
  }

  const handleSave = () => {
    if (!selectedCustomer) {
      showNotification('error', '請求先を選択してください')
      return
    }
    setShowSaveModal(true)
  }

  const confirmSave = () => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      number: invoiceForm.number,
      date: invoiceForm.date,
      dueDate: invoiceForm.dueDate,
      customer: selectedCustomer,
      items: invoiceItems,
      subtotal: calculateSubtotal(),
      taxAmount: calculateTax(),
      total: calculateTotal(),
      status: 'draft',
      notes: invoiceForm.notes,
      bankAccount: selectedBankAccount
    }
    
    setRecentInvoices([newInvoice, ...recentInvoices])
    setShowSaveModal(false)
    showNotification('success', '請求書を保存しました')
  }

  const handleSend = () => {
    if (!selectedCustomer) {
      showNotification('error', '請求先を選択してください')
      return
    }
    if (!selectedCustomer.email) {
      showNotification('error', '顧客のメールアドレスが設定されていません')
      return
    }
    setShowSendModal(true)
  }

  const confirmSend = () => {
    setTimeout(() => {
      setShowSendModal(false)
      showNotification('success', `${selectedCustomer?.email} に請求書を送信しました`)
      
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        number: invoiceForm.number,
        date: invoiceForm.date,
        dueDate: invoiceForm.dueDate,
        customer: selectedCustomer,
        items: invoiceItems,
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        total: calculateTotal(),
        status: 'sent',
        notes: invoiceForm.notes,
        bankAccount: selectedBankAccount
      }
      setRecentInvoices([newInvoice, ...recentInvoices])
    }, 1500)
  }

  // テンプレート機能
  const handleSaveAsTemplate = () => {
    setShowTemplateModal(true)
  }

  const confirmSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      showNotification('error', 'テンプレート名を入力してください')
      return
    }
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: `カスタムテンプレート - ${new Date().toLocaleDateString()}`,
      items: invoiceItems,
      notes: invoiceForm.notes
    }
    
    setTemplates([...templates, newTemplate])
    setNewTemplateName('')
    setShowTemplateModal(false)
    showNotification('success', 'テンプレートを保存しました')
  }

  const loadTemplate = (template: Template) => {
    setInvoiceItems(template.items.map(item => ({ ...item, id: Date.now().toString() + Math.random() })))
    setInvoiceForm(prev => ({ ...prev, notes: template.notes }))
    showNotification('success', `テンプレート「${template.name}」を読み込みました`)
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId))
    showNotification('success', 'テンプレートを削除しました')
  }

  // クイックアクション
  const copyLastInvoice = () => {
    if (recentInvoices.length > 0) {
      const lastInvoice = recentInvoices[0]
      setSelectedCustomer(lastInvoice.customer)
      setSelectedBankAccount(lastInvoice.bankAccount)
      setInvoiceItems(lastInvoice.items.map(item => ({ ...item, id: Date.now().toString() + Math.random() })))
      setInvoiceForm(prev => ({ 
        ...prev, 
        notes: lastInvoice.notes,
        number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
      }))
      showNotification('success', '前回の請求書をコピーしました')
    } else {
      showNotification('error', 'コピーする請求書がありません')
    }
  }

  // 履歴操作
  const downloadInvoice = (invoice: Invoice) => {
    showNotification('success', `${invoice.number} をダウンロードしました`)
  }

  const resendInvoice = (invoice: Invoice) => {
    if (invoice.customer?.email) {
      showNotification('success', `${invoice.customer.email} に再送信しました`)
    } else {
      showNotification('error', 'メールアドレスが設定されていません')
    }
  }

  const duplicateInvoice = (invoice: Invoice) => {
    setSelectedCustomer(invoice.customer)
    setSelectedBankAccount(invoice.bankAccount)
    setInvoiceItems(invoice.items.map(item => ({ ...item, id: Date.now().toString() + Math.random() })))
    setInvoiceForm(prev => ({ 
      ...prev, 
      notes: invoice.notes,
      number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
    }))
    setActiveTab('create')
    showNotification('success', '請求書を複製しました')
  }

  // 検索・フィルター
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredInvoices = recentInvoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ''
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '下書き'
      case 'sent': return '送信済み'
      case 'paid': return '支払済み'
      case 'overdue': return '期限超過'
      default: return '不明'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 通知 */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? 
              <Check className="w-5 h-5 mr-2" /> : 
              <X className="w-5 h-5 mr-2" />
            }
            {notification.message}
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:ml-16 transition-all duration-300">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">請求書作成</h1>
              <p className="text-gray-600">プロフェッショナルな請求書を簡単に作成・送信</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={downloadPDF}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </button>
            <button 
              onClick={handlePreview}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              プレビュー
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Save className="w-4 h-4 mr-1" />
              保存
            </button>
            <button 
              onClick={handleSend}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              <Send className="w-4 h-4 mr-1" />
              送信
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-4 px-4 py-2">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                請求書作成
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'bank'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                振込先管理
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                テンプレート
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                請求書履歴
              </button>
            </nav>
          </div>
        </div>

        {/* 請求書作成タブ */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* 基本情報 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">基本情報</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">請求書番号</label>
                    <input
                      type="text"
                      value={invoiceForm.number}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">発行日</label>
                    <input
                      type="date"
                      value={invoiceForm.date}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">支払期限</label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 顧客情報 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">請求先</h2>
                  <button
                    onClick={() => {
                      // 顧客選択モーダルを表示
                      setShowCustomerModal(true);
                    }}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    顧客選択
                  </button>
                </div>
                {selectedCustomer ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedCustomer.company}</h3>
                        <p className="text-sm text-gray-600">{selectedCustomer.name}</p>
                        <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                        <p className="text-sm text-gray-600">法人番号: {selectedCustomer.taxNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {selectedCustomer.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedCustomer.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">請求先を選択してください</p>
                  </div>
                )}
              </div>

              {/* 請求項目 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">請求項目</h2>
                  <button
                    onClick={addInvoiceItem}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    項目追加
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full md:hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">項目</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">単価</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">税率</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoiceItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="項目名"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(item.id, 'quantity', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="1"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.taxRate}
                              onChange={(e) => updateInvoiceItem(item.id, 'taxRate', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value={0}>0%</option>
                              <option value={8}>8%</option>
                              <option value={10}>10%</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium">¥{item.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeInvoiceItem(item.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              disabled={invoiceItems.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* モバイル用の縦型レイアウト */}
                  <div className="md:hidden space-y-4">
                    {invoiceItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">項目</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="項目名"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(item.id, 'quantity', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">単価</label>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">税率</label>
                            <select
                              value={item.taxRate}
                              onChange={(e) => updateInvoiceItem(item.id, 'taxRate', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value={0}>0%</option>
                              <option value={8}>8%</option>
                              <option value={10}>10%</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
                            <span className="text-sm font-medium">¥{item.amount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => removeInvoiceItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            disabled={invoiceItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 振込先情報 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">振込先</h2>
                  <button
                    onClick={() => {
                      // 振込先管理タブに移動
                      setActiveTab('bank');
                    }}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    振込先選択
                  </button>
                </div>
                {selectedBankAccount ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedBankAccount.bankName}</h3>
                        <p className="text-sm text-gray-600">{selectedBankAccount.branchName}</p>
                        <p className="text-sm text-gray-600">
                          {selectedBankAccount.accountType === 'checking' ? '当座' : '普通'} {selectedBankAccount.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">口座名義</p>
                        <p className="font-medium">{selectedBankAccount.accountHolder}</p>
                        {selectedBankAccount.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                            デフォルト
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">振込先を選択してください</p>
                  </div>
                )}
              </div>

              {/* 備考 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">備考・特記事項</h2>
                <textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="支払い条件、納期、その他の特記事項を記載してください"
                />
              </div>
            </div>

            {/* 右側サマリー */}
            <div className="space-y-6">
              {/* 金額サマリー */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                  金額計算
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">小計</span>
                    <span className="font-medium">¥{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">消費税</span>
                    <span className="font-medium">¥{calculateTax().toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">合計</span>
                      <span className="text-xl font-bold text-blue-600">¥{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 送信オプション */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">送信オプション</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      checked={sendOptions.sendPdf}
                      onChange={(e) => setSendOptions(prev => ({ ...prev, sendPdf: e.target.checked }))}
                    />
                    <span className="text-sm">PDFで送信</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      checked={sendOptions.sendMail}
                      onChange={(e) => setSendOptions(prev => ({ ...prev, sendMail: e.target.checked }))}
                    />
                    <span className="text-sm">郵送も併用</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      checked={sendOptions.confirmationEmail}
                      onChange={(e) => setSendOptions(prev => ({ ...prev, confirmationEmail: e.target.checked }))}
                    />
                    <span className="text-sm">確認メールを送信</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      checked={sendOptions.reminderEmail}
                      onChange={(e) => setSendOptions(prev => ({ ...prev, reminderEmail: e.target.checked }))}
                    />
                    <span className="text-sm">リマインダーメールを送信</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 振込先管理タブ */}
        {activeTab === 'bank' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">振込先管理</h2>
              <button
                onClick={() => openBankForm()}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                振込先追加
              </button>
            </div>
            <div className="space-y-4">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{bank.bankName}</h3>
                      <p className="text-sm text-gray-600">{bank.branchName}</p>
                      <p className="text-sm text-gray-600">
                        {bank.accountType === 'checking' ? '当座' : '普通'} {bank.accountNumber}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openBankForm(bank)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBankAccount(bank.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDefaultBank(bank.id)}
                        className={`text-sm ${
                          bank.isDefault ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        } px-2 py-1 rounded-full`}
                      >
                        {bank.isDefault ? 'デフォルト' : 'デフォルトに設定'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* テンプレートタブ */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">テンプレート</h2>
              <button
                onClick={handleSaveAsTemplate}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                テンプレート保存
              </button>
            </div>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => loadTemplate(template)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 履歴タブ */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">請求書履歴</h2>
              <button
                onClick={copyLastInvoice}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                前回の請求書をコピー
              </button>
            </div>
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{invoice.number}</h3>
                      <p className="text-sm text-gray-600">{invoice.customer?.company}</p>
                      <p className="text-sm text-gray-600">{invoice.date}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => resendInvoice(invoice)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* 顧客追加・編集モーダル */}
        {showCustomerFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {editingCustomer ? '顧客編集' : '顧客追加'}
                </h2>
                <button
                  onClick={() => setShowCustomerFormModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会社名 *</label>
                  <input
                    type="text"
                    value={customerForm.company}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">氏名 *</label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス *</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">法人番号</label>
                  <input
                    type="text"
                    value={customerForm.taxNumber}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, taxNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={saveCustomer}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 振込先管理タブ */}
        {activeTab === 'bank' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">振込先管理</h2>
              <button
                onClick={() => openBankForm()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規追加
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <Banknote className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-medium">{bank.bankName}</h3>
                      {bank.isDefault && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          デフォルト
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openBankForm(bank)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBankAccount(bank.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{bank.branchName}</p>
                    <p>{bank.accountType === 'checking' ? '当座' : '普通'} {bank.accountNumber}</p>
                    <p className="font-medium text-gray-900">{bank.accountHolder}</p>
                  </div>
                  {!bank.isDefault && (
                    <button
                      onClick={() => setDefaultBank(bank.id)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      デフォルトに設定
                    </button>
                  )}
                </div>
              ))}
              
              {bankAccounts.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  振込先情報が登録されていません
                </div>
              )}
            </div>
          </div>
        )}

        {/* 振込先選択モーダル */}
        {showBankModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">振込先選択</h2>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="銀行名、支店名、口座番号で検索"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-4">
                {bankAccounts.map((bank) => (
                  <div key={bank.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{bank.bankName}</h3>
                        <p className="text-sm text-gray-600">{bank.branchName}</p>
                        <p className="text-sm text-gray-600">
                          {bank.accountType === 'checking' ? '当座' : '普通'} {bank.accountNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">口座名義</p>
                        <p className="font-medium">{bank.accountHolder}</p>
                        {bank.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                            デフォルト
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBankAccount(bank)
                        setShowBankModal(false)
                      }}
                      className="mt-4 flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      選択
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 振込先追加・編集モーダル */}
        {showBankFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {editingBank ? '振込先編集' : '振込先追加'}
                </h2>
                <button
                  onClick={() => setShowBankFormModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">銀行名</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">支店名</label>
                  <input
                    type="text"
                    value={bankForm.branchName}
                    onChange={(e) => setBankForm(prev => ({ ...prev, branchName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">口座種類</label>
                  <select
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm(prev => ({ ...prev, accountType: e.target.value as 'savings' | 'checking' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="checking">当座</option>
                    <option value="savings">普通</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">口座番号</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">口座名義</label>
                  <input
                    type="text"
                    value={bankForm.accountHolder}
                    onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      checked={bankForm.isDefault}
                      onChange={(e) => setBankForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    <span className="text-sm">デフォルト振込先に設定</span>
                  </label>
                </div>
                <button
                  onClick={saveBankAccount}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* プレビューモーダル */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">請求書プレビュー</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">プレビュー内容</h3>
                <p className="text-sm text-gray-600">ここにプレビューが表示されます</p>
              </div>
            </div>
          </div>
        )}

        {/* 送信モーダル */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">請求書送信</h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">送信内容</h3>
                <p className="text-sm text-gray-600">ここに送信内容が表示されます</p>
              </div>
              <button
                onClick={confirmSend}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                送信
              </button>
            </div>
          </div>
        )}

        {/* 保存モーダル */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">請求書保存</h2>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">保存内容</h3>
                <p className="text-sm text-gray-600">ここに保存内容が表示されます</p>
              </div>
              <button
                onClick={confirmSave}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </button>
            </div>
          </div>
        )}

        {/* テンプレート保存モーダル */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">テンプレート保存</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="テンプレート名を入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={confirmSaveTemplate}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </button>
            </div>
          </div>
        )}

        {/* 振込先管理タブ */}
        {activeTab === 'bank' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">振込先管理</h2>
              <button
                onClick={() => openBankForm()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規追加
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <Banknote className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-medium">{bank.bankName}</h3>
                      {bank.isDefault && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          デフォルト
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openBankForm(bank)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBankAccount(bank.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{bank.branchName}</p>
                    <p>{bank.accountType === 'checking' ? '当座' : '普通'} {bank.accountNumber}</p>
                    <p className="font-medium text-gray-900">{bank.accountHolder}</p>
                  </div>
                  {!bank.isDefault && (
                    <button
                      onClick={() => setDefaultBank(bank.id)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      デフォルトに設定
                    </button>
                  )}
                </div>
              ))}
              
              {bankAccounts.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  振込先情報が登録されていません
                </div>
              )}
            </div>
          </div>
        )}

        {/* テンプレートタブ */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">請求書テンプレート</h2>
              <button
                onClick={handleSaveAsTemplate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規テンプレート
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="bg-gray-100 h-32 rounded mb-3 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <p className="text-xs text-gray-500 mb-3">{template.items.length}項目</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadTemplate(template)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      使用
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 履歴タブ */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">請求書履歴</h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="請求書番号または顧客名で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  クリア
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">請求書番号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">発行日</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">支払期限</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {invoice.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.customer?.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ¥{invoice.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedCustomer(invoice.customer)
                              setSelectedBankAccount(invoice.bankAccount)
                              setInvoiceItems(invoice.items)
                              setInvoiceForm(prev => ({ 
                                ...prev, 
                                number: invoice.number,
                                date: invoice.date,
                                dueDate: invoice.dueDate,
                                notes: invoice.notes
                              }))
                              setActiveTab('create')
                              showNotification('success', '請求書を編集モードで開きました')
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="編集"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => downloadInvoice(invoice)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="ダウンロード"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => resendInvoice(invoice)}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="再送信"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => duplicateInvoice(invoice)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="複製"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? '検索結果が見つかりません' : '請求書履歴がありません'}
                </div>
              )}
            </div>
          </div>
        )}



        {/* 振込先選択モーダル */}
        {showBankModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">振込先選択</h3>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3">
                {bankAccounts.map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => {
                      setSelectedBankAccount(bank)
                      setShowBankModal(false)
                      showNotification('success', `${bank.bankName} を選択しました`)
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{bank.bankName}</h4>
                          {bank.isDefault && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              デフォルト
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{bank.branchName}</p>
                        <p className="text-sm text-gray-600">
                          {bank.accountType === 'checking' ? '当座' : '普通'} {bank.accountNumber}
                        </p>
                        <p className="text-sm text-gray-600">{bank.accountHolder}</p>
                      </div>
                      <div className="text-right">
                        <Banknote className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
                {bankAccounts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    振込先情報が登録されていません
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBankModal(false)
                    openBankForm()
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  新規追加
                </button>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 顧客選択モーダル */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">顧客選択</h3>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="顧客名、会社名、メールアドレスで検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setShowCustomerModal(false)
                      setSearchTerm('')
                      showNotification('success', `${customer.company} を選択しました`)
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{customer.company}</h4>
                        <p className="text-sm text-gray-600">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                      </div>
                      <div className="text-right">
                        <Building className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    検索結果が見つかりません
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCustomerModal(false)
                    openCustomerForm()
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  新規追加
                </button>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 振込先登録・編集モーダル */}
        {showBankFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingBank ? '振込先編集' : '振込先登録'}
                </h3>
                <button
                  onClick={() => setShowBankFormModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">銀行名</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 三菱UFJ銀行"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">支店名</label>
                  <input
                    type="text"
                    value={bankForm.branchName}
                    onChange={(e) => setBankForm(prev => ({ ...prev, branchName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 渋谷支店"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">口座種別</label>
                  <select
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm(prev => ({ ...prev, accountType: e.target.value as 'savings' | 'checking' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="checking">当座</option>
                    <option value="savings">普通</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">口座番号</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">口座名義</label>
                  <input
                    type="text"
                    value={bankForm.accountHolder}
                    onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 株式会社サンプル"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bankForm.isDefault}
                      onChange={(e) => setBankForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">デフォルト振込先に設定</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowBankFormModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={saveBankAccount}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingBank ? '更新' : '登録'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* プレビューモーダル */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">請求書プレビュー</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* 請求書プレビュー内容 */}
              <div className="border border-gray-300 p-8 bg-white">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold">請求書</h1>
                  <p className="text-sm text-gray-600 mt-2">Invoice</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold mb-2">請求元</h3>
                    <p className="text-sm">あなたの会社名</p>
                    <p className="text-sm">〒000-0000</p>
                    <p className="text-sm">東京都渋谷区1-1-1</p>
                    <p className="text-sm">TEL: 03-0000-0000</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">請求先</h3>
                    <p className="text-sm">{selectedCustomer?.company}</p>
                    <p className="text-sm">{selectedCustomer?.name} 様</p>
                    <p className="text-sm">{selectedCustomer?.address}</p>
                    <p className="text-sm">TEL: {selectedCustomer?.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-sm"><span className="font-medium">請求書番号:</span> {invoiceForm.number}</p>
                    <p className="text-sm"><span className="font-medium">発行日:</span> {invoiceForm.date}</p>
                    <p className="text-sm"><span className="font-medium">支払期限:</span> {invoiceForm.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">¥{calculateTotal().toLocaleString()}</p>
                    <p className="text-sm text-gray-600">請求金額（税込）</p>
                  </div>
                </div>
                
                <table className="w-full mb-8 border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">項目</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">数量</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">単価</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">税率</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">¥{item.unitPrice.toLocaleString()}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{item.taxRate}%</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">¥{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="flex justify-end mb-8">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <span>小計:</span>
                      <span>¥{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>消費税:</span>
                      <span>¥{calculateTax().toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>合計:</span>
                        <span>¥{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedBankAccount && (
                  <div className="mb-8">
                    <h3 className="font-semibold mb-2">振込先</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">銀行名:</span> {selectedBankAccount.bankName}</p>
                      <p><span className="font-medium">支店名:</span> {selectedBankAccount.branchName}</p>
                      <p><span className="font-medium">口座種別:</span> {selectedBankAccount.accountType === 'checking' ? '当座' : '普通'}</p>
                      <p><span className="font-medium">口座番号:</span> {selectedBankAccount.accountNumber}</p>
                      <p><span className="font-medium">口座名義:</span> {selectedBankAccount.accountHolder}</p>
                    </div>
                  </div>
                )}
                
                {invoiceForm.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">備考</h3>
                    <p className="text-sm whitespace-pre-wrap">{invoiceForm.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  閉じる
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false)
                    downloadPDF()
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  PDFダウンロード
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false)
                    handleSend()
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 送信確認モーダル */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">請求書送信</h3>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">以下の宛先に請求書を送信します：</p>
                <p className="font-medium mt-2">{selectedCustomer?.company}</p>
                <p className="text-sm text-gray-600">{selectedCustomer?.email}</p>
                <p className="font-medium mt-2">金額: ¥{calculateTotal().toLocaleString()}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-medium mb-2">送信オプション</h4>
                <div className="space-y-2 text-sm">
                  {sendOptions.sendPdf && <p>• PDFファイルで送信</p>}
                  {sendOptions.sendMail && <p>• 郵送も併用</p>}
                  {sendOptions.confirmationEmail && <p>• 送信確認メールを受信</p>}
                  {sendOptions.reminderEmail && <p>• 支払期限リマインダーを設定</p>}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmSend}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  送信実行
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 保存確認モーダル */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">請求書保存</h3>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">請求書を下書きとして保存します。</p>
                <p className="font-medium mt-2">請求書番号: {invoiceForm.number}</p>
                <p className="text-sm text-gray-600">顧客: {selectedCustomer?.company}</p>
                <p className="font-medium">金額: ¥{calculateTotal().toLocaleString()}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* テンプレート保存モーダル */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">テンプレート保存</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">テンプレート名</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: ウェブ制作標準テンプレート"
                />
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">現在の請求項目（{invoiceItems.length}件）をテンプレートとして保存します。</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowTemplateModal(false)
                    setNewTemplateName('')
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmSaveTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default InvoiceCreation
