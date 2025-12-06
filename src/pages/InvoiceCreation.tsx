import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Save, Send, Eye, Download, Search, Calendar, User, FileText, X, Trash2, FileSpreadsheet, Banknote } from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// jspdf-autotableを正しくインポート
import 'jspdf-autotable'


interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface BankAccount {
  id: string
  bankName: string
  branchName: string
  accountType: '普通' | '当座'
  accountNumber: string
  accountHolder: string
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

const InvoiceCreation: React.FC = () => {
  const [documentType, setDocumentType] = useState<'invoice' | 'estimate'>('invoice') // 文書タイプ（請求書/見積書）
  const [invoiceDate, setInvoiceDate] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('') // 請求書の支払期限
  const [estimateExpiryDate, setEstimateExpiryDate] = useState<string>('') // 見積書の有効期限
  const [customer, setCustomer] = useState<Customer>({ id: '', name: '', email: '', phone: '', address: '' })
  const [bankAccount, setBankAccount] = useState<BankAccount>({ id: '', bankName: '', branchName: '', accountType: '普通', accountNumber: '', accountHolder: '' })
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '商品・サービス1', quantity: 1, unitPrice: 10000, amount: 10000 },
    { id: '2', description: '商品・サービス2', quantity: 2, unitPrice: 5000, amount: 10000 }
  ])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showBankAccountModal, setShowBankAccountModal] = useState(false)
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [showNewBankAccountModal, setShowNewBankAccountModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendEmail, setSendEmail] = useState('')
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false)

  // 新規顧客用の状態
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  // 新規銀行口座用の状態
  const [newBankAccount, setNewBankAccount] = useState<Omit<BankAccount, 'id'>>({
    bankName: '',
    branchName: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: ''
  })

  // 合計金額計算
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxRate = 0.1
  const taxAmount = Math.round(subtotal * taxRate)
  const totalAmount = subtotal + taxAmount

  // 商品・サービス追加
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    }
    setItems([...items, newItem])
  }

  // 商品・サービス更新
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
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

  // 商品・サービス削除
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // 顧客選択
  const selectCustomer = (customer: Customer) => {
    setCustomer(customer)
    setShowCustomerModal(false)
  }

  // 銀行口座選択
  const selectBankAccount = (account: BankAccount) => {
    setBankAccount(account)
    setShowBankAccountModal(false)
  }

  // PDF生成の共通関数（html2canvasを使用した新しい方法）
  const generatePDF = async () => {
    try {
      console.log('PDF生成を開始します')

      // 一時的なプレビュー要素を作成
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'fixed' // absoluteからfixedに変更して画面外配置を確実に
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = '210mm' // A4サイズ
      tempContainer.style.minHeight = '297mm'
      tempContainer.style.padding = '20px'
      tempContainer.style.backgroundColor = '#ffffff' // 白背景
      tempContainer.style.color = '#000000' // 黒文字を強制
      tempContainer.style.fontFamily = "'Noto Sans JP', 'Meiryo', 'Hiragino Kaku Gothic ProN', sans-serif"
      tempContainer.style.boxSizing = 'border-box'
      tempContainer.style.zIndex = '-1'

      // プレビュー内容を構築
      tempContainer.innerHTML = `
        <div style="font-family: sans-serif; color: #000;">
          <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 40px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
            ${documentType === 'invoice' ? '請求書' : '見積書'}
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div style="width: 48%;">
              <div style="font-size: 18px; font-weight: bold; border-bottom: 2px solid #333; margin-bottom: 10px; padding-bottom: 5px;">
                ${customer.name || '（取引先未設定）'} 御中
              </div>
              <div style="font-size: 14px; line-height: 1.6;">
                ${customer.address ? `<div>${customer.address}</div>` : ''}
                ${customer.phone ? `<div>TEL: ${customer.phone}</div>` : ''}
                ${customer.email ? `<div>Email: ${customer.email}</div>` : ''}
              </div>
            </div>
            
            <div style="width: 48%; text-align: right;">
              <div style="margin-bottom: 5px;">発行日: ${invoiceDate || '未設定'}</div>
              <div style="margin-bottom: 5px;">${documentType === 'invoice' ? '支払期限' : '有効期限'}: ${documentType === 'invoice' ? (dueDate || '未設定') : (estimateExpiryDate || '未設定')}</div>
              <div style="margin-bottom: 5px;">請求書番号: T${Date.now().toString().slice(-13)}</div>
              
              <div style="margin-top: 20px; font-size: 14px; line-height: 1.6;">
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">株式会社Ainance</div>
                <div>〒100-0001</div>
                <div>東京都千代田区千代田1-1-1</div>
                <div>TEL: 03-1234-5678</div>
                <div>Email: info@ainance.co.jp</div>
                <div>登録番号: T1234567890123</div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; font-size: 16px;">
            件名: ${document.querySelector('input[placeholder="〇〇開発案件 3月分ご請求"]')?.getAttribute('value') || (document.querySelector('input[placeholder="〇〇開発案件 3月分ご請求"]') as HTMLInputElement)?.value || ''}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f3f4f6; color: #000;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; width: 50%;">品目</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; width: 10%;">数量</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; width: 20%;">単価</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; width: 20%;">金額</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description || '（品目なし）'}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">¥${item.unitPrice.toLocaleString()}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">¥${item.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 40%;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
                <span>小計</span>
                <span>¥${subtotal.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
                <span>消費税 (10%)</span>
                <span>¥${taxAmount.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; margin-top: 10px;">
                <span>合計</span>
                <span>¥${totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          ${documentType === 'invoice' && bankAccount.bankName ? `
          <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
            <div style="font-weight: bold; margin-bottom: 10px; font-size: 16px;">お振込先</div>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px;">
              <div style="display: flex; gap: 20px; margin-bottom: 5px;">
                <span style="font-weight: bold;">銀行名:</span>
                <span>${bankAccount.bankName}</span>
              </div>
              <div style="display: flex; gap: 20px; margin-bottom: 5px;">
                <span style="font-weight: bold;">支店名:</span>
                <span>${bankAccount.branchName}</span>
              </div>
              <div style="display: flex; gap: 20px; margin-bottom: 5px;">
                <span style="font-weight: bold;">口座種別:</span>
                <span>${bankAccount.accountType}</span>
              </div>
              <div style="display: flex; gap: 20px; margin-bottom: 5px;">
                <span style="font-weight: bold;">口座番号:</span>
                <span>${bankAccount.accountNumber}</span>
              </div>
              <div style="display: flex; gap: 20px;">
                <span style="font-weight: bold;">口座名義:</span>
                <span>${bankAccount.accountHolder}</span>
              </div>
            </div>
          </div>
          ` : ''}
          
          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            ※ 本書に関するご質問等がございましたら、上記連絡先までお問い合わせください。
          </div>
        </div>
      `

      document.body.appendChild(tempContainer)

      // html2canvasでキャプチャ
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // 品質向上のためスケールを上げる
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' // 背景色を白に強制
      })

      // 一時要素を削除
      document.body.removeChild(tempContainer)

      // CanvasをPDFに変換
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4の幅
      const pageHeight = 297 // A4の高さ
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // 複数ページ対応
      while (heightLeft >= 20) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      console.log('PDF生成が完了しました')
      return pdf
    } catch (error) {
      console.error('PDF生成中にエラーが発生しました:', error)
      throw error
    }
  }

  // PDFプレビュー生成
  const generatePDFPreview = async () => {
    try {
      console.log('PDFプレビュー生成を開始します')
      const doc = await generatePDF()

      // PDFをBlobとして取得
      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)

      // プレビュー用のBlob URLを設定
      setPreviewBlobUrl(url)
      setShowPreviewModal(true)
      console.log('PDFプレビュー生成が完了しました')
    } catch (error) {
      console.error('PDFプレビュー生成中にエラーが発生しました:', error)
      alert('PDFプレビューの生成に失敗しました。')
    }
  }

  // PDF保存
  const savePDF = async () => {
    try {
      console.log('PDF保存を開始します')
      const doc = await generatePDF()
      // PDFを保存
      doc.save(documentType === 'invoice' ? '請求書.pdf' : '見積書.pdf')
      console.log('PDF保存が完了しました')
    } catch (error) {
      console.error('PDF保存中にエラーが発生しました:', error)
      alert('PDFの保存に失敗しました。')
    }
  }

  // PDFダウンロード
  const downloadPDF = async () => {
    console.log('PDFダウンロード確認モーダルを表示します')
    setShowDownloadConfirm(true)
  }

  // PDFダウンロード処理
  const handleDownloadPDF = async () => {
    try {
      console.log('PDFダウンロードを開始します')
      const doc = await generatePDF()
      // PDFをダウンロード
      doc.save(documentType === 'invoice' ? '請求書.pdf' : '見積書.pdf')
      setShowDownloadConfirm(false)
      console.log('PDFダウンロードが完了しました')
    } catch (error) {
      console.error('PDFダウンロード中にエラーが発生しました:', error)
      alert('PDFのダウンロードに失敗しました。')
      setShowDownloadConfirm(false)
    }
  }

  // ダウンロード確認モーダルを閉じる
  const closeDownloadConfirm = () => {
    console.log('PDFダウンロード確認モーダルを閉じます')
    setShowDownloadConfirm(false)
  }

  // 請求書送信
  const sendInvoice = () => {
    console.log('請求書送信モーダルを表示します')
    // 顧客のメールアドレスが既に選択されている場合は、それをデフォルト値として設定
    if (customer.email) {
      setSendEmail(customer.email)
    }
    setShowSendModal(true)
  }

  // 請求書送信処理
  const handleSendInvoice = () => {
    console.log('請求書を送信します')
    // 実際のアプリケーションでは、ここでAPIを呼び出して請求書を送信する処理を実装します
    // 今回は簡単のためにアラートを表示
    alert(`${documentType === 'invoice' ? '請求書' : '見積書'}を ${sendEmail || '指定されたアドレス'} に送信しました`)
    setShowSendModal(false)
    setSendEmail('')
  }

  // 送信モーダルを閉じる
  const closeSendModal = () => {
    console.log('請求書送信モーダルを閉じます')
    setShowSendModal(false)
    setSendEmail('')
  }

  // 顧客モーダル表示
  const openCustomerModal = () => {
    console.log('顧客選択モーダルを表示します')
    setShowCustomerModal(true)
  }

  // 銀行口座モーダル表示
  const openBankAccountModal = () => {
    console.log('銀行口座選択モーダルを表示します')
    setShowBankAccountModal(true)
  }

  // モーダル閉じる
  const closeModal = () => {
    console.log('モーダルを閉じます')
    setShowCustomerModal(false)
    setShowBankAccountModal(false)
    setShowNewCustomerModal(false)
    setShowNewBankAccountModal(false)
  }

  // プレビューモーダル閉じる
  const closePreviewModal = () => {
    console.log('PDFプレビューモーダルを閉じます')
    setShowPreviewModal(false)
    setPreviewBlobUrl(null)
  }

  // 新規顧客作成
  const createCustomer = () => {
    console.log('新規顧客を作成します')
    const customerWithId: Customer = {
      ...newCustomer,
      id: Date.now().toString()
    }
    setCustomers([...customers, customerWithId])
    setCustomer(customerWithId)
    setNewCustomer({ name: '', email: '', phone: '', address: '' })
    closeModal()
  }

  // 新規銀行口座作成
  const createBankAccount = () => {
    console.log('新規銀行口座を作成します')
    const bankAccountWithId: BankAccount = {
      ...newBankAccount,
      id: Date.now().toString()
    }
    setBankAccounts([...bankAccounts, bankAccountWithId])
    setBankAccount(bankAccountWithId)
    setNewBankAccount({
      bankName: '',
      branchName: '',
      accountType: '普通',
      accountNumber: '',
      accountHolder: ''
    })
    closeModal()
  }

  // 初期データ設定
  useEffect(() => {
    console.log('初期データを設定します')
    // サンプル顧客データ
    const sampleCustomers: Customer[] = [
      { id: '1', name: '株式会社サンプル取引先', email: 'client@example.com', phone: '03-9876-5432', address: '〒100-0002 東京都千代田区皇居外苑1-1' },
      { id: '2', name: '株式会社テスト企業', email: 'test@testcompany.co.jp', phone: '06-1234-5678', address: '〒530-0001 大阪府大阪市北区梅田1-1-1' }
    ]

    // サンプル銀行口座データ
    const sampleBankAccounts: BankAccount[] = [
      { id: '1', bankName: '三井住友銀行', branchName: '銀座支店', accountType: '普通', accountNumber: '1234567', accountHolder: '株式会社Ainance' },
      { id: '2', bankName: '三菱UFJ銀行', branchName: '丸の内支店', accountType: '当座', accountNumber: '9876543', accountHolder: '株式会社Ainance' }
    ]

    setCustomers(sampleCustomers)
    setBankAccounts(sampleBankAccounts)

    // 初期日付設定
    const today = new Date()
    const formattedToday = today.toISOString().split('T')[0]
    const due = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0]
    setInvoiceDate(formattedToday)
    setDueDate(due)
    setEstimateExpiryDate(due) // 見積書の有効期限も同様に設定
  }, [])

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-start mb-4 sm:mb-6">
          <Link to="/dashboard" className="flex items-center text-primary hover:text-primary/90 transition-colors mr-4" title="ダッシュボードに戻る">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main">
            {documentType === 'invoice' ? '請求書作成' : '見積書作成'}
          </h1>
        </div>

        {/* 文書タイプ切り替え */}
        <div className="bg-surface rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => setDocumentType('invoice')}
              className={`flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${documentType === 'invoice'
                ? 'bg-primary text-white'
                : 'border border-border text-text-muted hover:bg-surface-highlight'
                }`}
            >
              <FileText className="mr-1 sm:mr-2" size={16} />
              <span className="whitespace-nowrap">請求書</span>
            </button>
            <button
              onClick={() => setDocumentType('estimate')}
              className={`flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${documentType === 'estimate'
                ? 'bg-primary text-white'
                : 'border border-border text-text-muted hover:bg-surface-highlight'
                }`}
            >
              <FileSpreadsheet className="mr-1 sm:mr-2" size={16} />
              <span className="whitespace-nowrap">見積書</span>
            </button>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="bg-surface rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-end">
            {/* プレビュー（優先度低） */}
            <button
              onClick={generatePDFPreview}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-border text-text-muted rounded-lg hover:bg-surface-highlight transition-colors text-sm sm:text-base"
            >
              <Eye className="mr-1 sm:mr-2" size={16} />
              <span className="whitespace-nowrap">プレビュー</span>
            </button>

            {/* 保存（中） */}
            <button
              onClick={savePDF}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm sm:text-base"
            >
              <Save className="mr-1 sm:mr-2" size={16} />
              <span className="whitespace-nowrap">保存</span>
            </button>

            {/* PDFダウンロード（中） */}
            <button
              onClick={downloadPDF}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm sm:text-base"
            >
              <Download className="mr-1 sm:mr-2" size={16} />
              <span className="whitespace-nowrap">PDF</span>
            </button>

            {/* 送信（高） */}
            <button
              onClick={sendInvoice}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base font-semibold shadow-lg shadow-primary/25"
            >
              <Send className="mr-1 sm:mr-2" size={16} />
              <span className="whitespace-nowrap">送信</span>
            </button>
          </div>
        </div>

        {/* 請求書フォーム */}
        <div className="bg-surface rounded-lg shadow-md p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-text-main flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    請求書情報
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-highlight text-text-muted border border-border">
                    T1234567890123
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">取引先</label>
                      <button
                        onClick={() => setShowCustomerModal(true)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-left text-text-main hover:bg-surface-highlight focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-between"
                      >
                        <span className={customer.name ? 'text-text-main' : 'text-text-muted'}>
                          {customer.name || '取引先を選択'}
                        </span>
                        <User className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">請求日</label>
                      <input
                        type="date"
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">件名</label>
                    <input
                      type="text"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="〇〇開発案件 3月分ご請求"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">振込先</label>
                    <button
                      onClick={() => setShowBankAccountModal(true)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-left text-text-main hover:bg-surface-highlight focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-between"
                    >
                      <span className={bankAccount.bankName ? 'text-text-main' : 'text-text-muted'}>
                        {bankAccount.bankName ? `${bankAccount.bankName} ${bankAccount.branchName} ${bankAccount.accountType} ${bankAccount.accountNumber}` : '振込先を選択'}
                      </span>
                      <Banknote className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>

                  {/* Items Table */}
                  {/* Items Table */}
                  <div className="border border-border rounded-xl overflow-hidden bg-background">
                    <div className="block md:hidden">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 border-b border-border last:border-b-0 bg-surface">
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-text-muted mb-1">品目</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="w-full bg-background border border-border rounded px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="品目を入力"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-text-muted mb-1">数量</label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-right text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-text-muted mb-1">単価</label>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-right text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <span className="text-text-muted mr-2">金額:</span>
                              <span className="font-medium text-text-main">¥{item.amount.toLocaleString()}</span>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-text-muted hover:text-red-400 transition-colors p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-surface-highlight">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">品目</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase w-24">数量</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase w-32">単価</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase w-32">金額</th>
                            <th className="px-4 py-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                  className="w-full bg-transparent border-none focus:ring-0 text-text-main placeholder-text-muted"
                                  placeholder="品目を入力"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                  className="w-full bg-transparent border-none focus:ring-0 text-right text-text-main"
                                  placeholder="1"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                  className="w-full bg-transparent border-none focus:ring-0 text-right text-text-main"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-4 py-3 text-right text-text-main">¥{item.amount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-text-muted hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 bg-surface-highlight border-t border-border">
                      <button
                        onClick={addItem}
                        className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        行を追加
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                      <div className="flex justify-between text-text-muted">
                        <span>小計</span>
                        <span>¥{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>消費税 (10%)</span>
                        <span>¥{taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-text-main pt-3 border-t border-border">
                        <span>合計</span>
                        <span>¥{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-text-main mb-4">アクション</h3>
                <div className="space-y-3">
                  <button className="w-full btn-primary transition-colors shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    メールで送信
                  </button>
                  <button className="w-full py-2.5 px-4 bg-surface border border-border text-text-main rounded-lg font-medium hover:bg-surface-highlight transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    PDFダウンロード
                  </button>
                  <button className="w-full py-2.5 px-4 bg-surface border border-border text-text-main rounded-lg font-medium hover:bg-surface-highlight transition-colors flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    下書き保存
                  </button>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-text-main mb-4">最近の請求書</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-highlight transition-colors cursor-pointer group border border-border">
                      <div>
                        <p className="font-medium text-text-main group-hover:text-primary transition-colors">株式会社〇〇 御中</p>
                        <p className="text-xs text-text-muted">2024/03/{20 - i}</p>
                      </div>
                      <span className="text-sm font-bold text-text-main">¥150,000</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 顧客選択モーダル */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-border">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-main">顧客を選択</h3>
                <button
                  onClick={closeModal}
                  className="text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[70vh]">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="顧客を検索..."
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  {customers
                    .filter(customer =>
                      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(customer => (
                      <div
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="p-3 border border-border rounded-md hover:bg-background cursor-pointer bg-background hover:bg-surface-highlight transition-colors"
                      >
                        <p className="font-medium text-text-main">{customer.name}</p>
                        <p className="text-sm text-text-muted">{customer.email}</p>
                        <p className="text-sm text-text-muted">{customer.phone}</p>
                        <p className="text-sm text-text-muted">{customer.address}</p>
                      </div>
                    ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowCustomerModal(false)
                      setShowNewCustomerModal(true)
                    }}
                    className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    新規顧客を作成
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 銀行口座選択モーダル */}
        {showBankAccountModal && documentType === 'invoice' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-border">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-main">銀行口座を選択</h3>
                <button
                  onClick={closeModal}
                  className="text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[70vh]">
                <div className="space-y-2">
                  {bankAccounts.map(account => (
                    <div
                      key={account.id}
                      onClick={() => selectBankAccount(account)}
                      className="p-3 border border-border rounded-md hover:bg-background cursor-pointer bg-background hover:bg-surface-highlight transition-colors"
                    >
                      <p className="font-medium text-text-main">{account.bankName} {account.branchName}</p>
                      <p className="text-sm text-text-muted">{account.accountType} {account.accountNumber}</p>
                      <p className="text-sm text-text-muted">口座名義: {account.accountHolder}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowBankAccountModal(false)
                      setShowNewBankAccountModal(true)
                    }}
                    className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    新規銀行口座を作成
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 新規顧客作成モーダル */}
        {showNewCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-border">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-main">新規顧客を作成</h3>
                <button
                  onClick={closeModal}
                  className="text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[70vh] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">顧客名</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="顧客名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="example@company.co.jp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">電話番号</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="03-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">住所</label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="〒100-0001 東京都千代田区千代田1-1-1"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-border text-text-muted rounded-md hover:bg-surface-highlight transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={createCustomer}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    作成
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 新規銀行口座作成モーダル */}
        {showNewBankAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-border">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-main">新規銀行口座を作成</h3>
                <button
                  onClick={closeModal}
                  className="text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[70vh] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">銀行名</label>
                  <input
                    type="text"
                    value={newBankAccount.bankName}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="銀行名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">支店名</label>
                  <input
                    type="text"
                    value={newBankAccount.branchName}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, branchName: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="支店名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">口座種別</label>
                  <select
                    value={newBankAccount.accountType}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, accountType: e.target.value as '普通' | '当座' })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                  >
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">口座番号</label>
                  <input
                    type="text"
                    value={newBankAccount.accountNumber}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="口座番号"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">口座名義</label>
                  <input
                    type="text"
                    value={newBankAccount.accountHolder}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, accountHolder: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="口座名義"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-border text-text-muted rounded-md hover:bg-surface-highlight transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={createBankAccount}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    作成
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* プレビューモーダル */}
        {showPreviewModal && previewBlobUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-main">{documentType === 'invoice' ? '請求書' : '見積書'} プレビュー</h3>
                <button
                  onClick={closePreviewModal}
                  className="text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-white">
                <iframe
                  src={previewBlobUrl}
                  className="w-full h-full min-h-[500px]"
                  title="PDF Preview"
                />
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-2">
                <button
                  onClick={closePreviewModal}
                  className="px-4 py-2 border border-border text-text-muted rounded-md hover:bg-surface-highlight transition-colors"
                >
                  閉じる
                </button>
                <button
                  onClick={savePDF}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 請求書送信モーダル */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-md w-full overflow-hidden border border-border">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-main">{documentType === 'invoice' ? '請求書' : '見積書'} 送信</h3>
                <button
                  onClick={closeSendModal}
                  className="text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">送信先メールアドレス</label>
                  <input
                    type="email"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-text-main"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={closeSendModal}
                    className="px-4 py-2 border border-border text-text-muted rounded-md hover:bg-surface-highlight transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSendInvoice}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDFダウンロード確認モーダル */}
        {showDownloadConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-md w-full overflow-hidden border border-border">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-main">PDFダウンロード</h3>
                <button
                  onClick={closeDownloadConfirm}
                  className="text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4">
                <p className="text-text-main mb-4">{documentType === 'invoice' ? '請求書' : '見積書'}をPDFとしてダウンロードしますか？</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeDownloadConfirm}
                    className="px-4 py-2 border border-border text-text-muted rounded-md hover:bg-surface-highlight transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    ダウンロード
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceCreation