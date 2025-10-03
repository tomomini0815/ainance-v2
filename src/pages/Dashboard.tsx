
import React from 'react'
import Header from '../components/Header'
import QuickActions from '../components/QuickActions'
import RevenueChart from '../components/RevenueChart'
import ExpenseChart from '../components/ExpenseChart'
import TransactionTable from '../components/TransactionTable'
import AITransactionTable from '../components/AITransactionTable'

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* クイックアクション */}
        <QuickActions />
        
        {/* チャートセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart />
          <ExpenseChart />
        </div>
        
        {/* テーブルセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionTable />
          <AITransactionTable />
        </div>
      </main>
    </div>
  )
}

export default Dashboard
