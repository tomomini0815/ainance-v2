
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Calculator, FileText, Users, Building} from 'lucide-react'
import Header from '../components/Header'

interface SimulationResult {
  currentTax: number
  corporateTax: number
  savings: number
  socialInsurance: number
  netBenefit: number
}

const BusinessConversion: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<'individual' | 'corporate'>('individual')
  const [revenue, setRevenue] = useState(8000000)
  const [expenses, setExpenses] = useState(3000000)
  const [showSimulation, setShowSimulation] = useState(false)

  const [simulationResult] = useState<SimulationResult>({
    currentTax: 1650000,
    corporateTax: 890000,
    savings: 760000,
    socialInsurance: 420000,
    netBenefit: 340000
  })

  const conversionSteps = [
    {
      step: 1,
      title: '事業形態の決定',
      description: '株式会社、合同会社などの法人形態を選択',
      status: 'pending',
      duration: '1-2日'
    },
    {
      step: 2,
      title: '定款作成・認証',
      description: '会社の基本事項を定めた定款を作成し、公証役場で認証',
      status: 'pending',
      duration: '3-5日'
    },
    {
      step: 3,
      title: '資本金の払込',
      description: '発起人個人の口座に資本金を払い込み',
      status: 'pending',
      duration: '1日'
    },
    {
      step: 4,
      title: '法人登記申請',
      description: '法務局に設立登記を申請',
      status: 'pending',
      duration: '1-2週間'
    },
    {
      step: 5,
      title: '税務署等への届出',
      description: '税務署、都道府県、市区町村への各種届出',
      status: 'pending',
      duration: '2-3日'
    },
    {
      step: 6,
      title: 'データ移行',
      description: 'Ainanceで個人事業のデータを法人用に自動変換',
      status: 'pending',
      duration: '即時'
    }
  ]

  const requiredDocuments = [
    '個人事業主の開業届（控え）',
    '直近3年分の確定申告書',
    '青色申告決算書',
    '銀行口座の取引履歴',
    '主要な契約書類',
    '印鑑証明書',
    '住民票'
  ]

  const benefits = [
    {
      title: '税制上のメリット',
      items: [
        '法人税率の適用（最大約23.2%）',
        '役員報酬による所得分散',
        '退職金制度の活用',
        '経費計上範囲の拡大'
      ]
    },
    {
      title: '事業運営のメリット',
      items: [
        '社会的信用の向上',
        '資金調達の選択肢拡大',
        '優秀な人材の採用',
        '事業継承の円滑化'
      ]
    },
    {
      title: 'リスク管理',
      items: [
        '有限責任による個人資産保護',
        '事業リスクの分離',
        '保険制度の充実',
        '法的安定性の向上'
      ]
    }
  ]

  const calculateSimulation = () => {
    setShowSimulation(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">事業形態変換</h1>
            <p className="text-gray-600">個人事業主から法人への切り替えをサポートします</p>
          </div>
        </div>

        {/* 現在のステータス */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">現在の事業形態</h2>
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex flex-col items-center p-6 rounded-lg border-2 ${
              currentStatus === 'individual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <Users className="w-12 h-12 text-blue-600 mb-2" />
              <span className="font-medium">個人事業主</span>
              <span className="text-sm text-gray-600">現在</span>
            </div>
            
            <ArrowRight className="w-8 h-8 text-gray-400" />
            
            <div className={`flex flex-col items-center p-6 rounded-lg border-2 ${
              currentStatus === 'corporate' ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}>
              <Building className="w-12 h-12 text-green-600 mb-2" />
              <span className="font-medium">法人</span>
              <span className="text-sm text-gray-600">変換後</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: シミュレーション */}
          <div className="lg:col-span-2 space-y-6">
            {/* 法人成りシミュレーション */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                法人成りシミュレーション
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年間売上</label>
                  <input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年間経費</label>
                  <input
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={calculateSimulation}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 mb-6"
              >
                シミュレーション実行
              </button>

              {showSimulation && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">シミュレーション結果</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">個人事業主（現在）</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>所得税・住民税:</span>
                          <span>¥{simulationResult.currentTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>国民健康保険:</span>
                          <span>¥{(simulationResult.socialInsurance * 0.7).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>合計負担:</span>
                          <span>¥{(simulationResult.currentTax + simulationResult.socialInsurance * 0.7).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">法人（変換後）</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>法人税:</span>
                          <span>¥{simulationResult.corporateTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>社会保険:</span>
                          <span>¥{simulationResult.socialInsurance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>合計負担:</span>
                          <span>¥{(simulationResult.corporateTax + simulationResult.socialInsurance).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">年間節税効果:</span>
                      <span className="text-xl font-bold text-blue-600">¥{simulationResult.netBenefit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 変換手続きステップ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                変換手続きステップ
              </h2>
              
              <div className="space-y-4">
                {conversionSteps.map((step) => (
                  <div key={step.step} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500">所要期間: {step.duration}</span>
                        <div className="ml-auto">
                          {step.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {step.status === 'pending' && (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Ainanceの自動サポート</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 個人事業のデータを法人用に自動変換</li>
                  <li>• 必要書類の自動生成</li>
                  <li>• 税務署への届出書類作成</li>
                  <li>• 移行後の会計設定を自動構築</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 右側: メリット・必要書類 */}
          <div className="space-y-6">
            {/* 法人化のメリット */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">法人化のメリット</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index}>
                    <h3 className="font-medium text-gray-900 mb-2">{benefit.title}</h3>
                    <ul className="space-y-1">
                      {benefit.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 必要書類 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">必要書類</h2>
              <div className="space-y-2">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Ainanceに登録済みのデータは自動で活用されます
                </p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">次のステップ</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                  法人成り手続きを開始
                </button>
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                  専門家に相談
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                  詳細資料をダウンロード
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BusinessConversion
