import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Components
import { AuthProvider } from './components/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'

// Pages
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ReceiptProcessing from './pages/ReceiptProcessing'
import InvoiceCreation from './pages/InvoiceCreation'
import BusinessAnalysis from './pages/BusinessAnalysis'
import ChatToBook from './pages/ChatToBook'
import BusinessConversion from './pages/BusinessConversion'
import IntegrationSettings from './pages/IntegrationSettings'
import TransactionHistory from './pages/TransactionHistory'
import AITransactionList from './pages/AITransactionList'
import TaxFilingSupport from './pages/TaxFilingSupport'

function App() {
  const [isPcSideMenuExpanded, setIsPcSideMenuExpanded] = useState(true);

  const handlePcSideMenuToggle = (expanded: boolean) => {
    setIsPcSideMenuExpanded(expanded);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header 
            showPcSideMenu={false}
            onPcSideMenuToggle={handlePcSideMenuToggle}
            isPcSideMenuExpanded={isPcSideMenuExpanded}
            showSideMenus={true}
          />
          <div className="flex">
            <div className="flex-1">
              <Routes>
                {/* パブリックルート */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* 保護されたルート */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/receipt-processing" 
                  element={
                    <ProtectedRoute>
                      <ReceiptProcessing />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/invoice-creation" 
                  element={
                    <ProtectedRoute>
                      <InvoiceCreation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/business-analysis" 
                  element={
                    <ProtectedRoute>
                      <BusinessAnalysis />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat-to-book" 
                  element={
                    <ProtectedRoute>
                      <ChatToBook />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/business-conversion" 
                  element={
                    <ProtectedRoute>
                      <BusinessConversion />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/integration-settings" 
                  element={
                    <ProtectedRoute>
                      <IntegrationSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/transaction-history" 
                  element={
                    <ProtectedRoute>
                      <TransactionHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ai-transaction-list" 
                  element={
                    <ProtectedRoute>
                      <AITransactionList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tax-filing-support" 
                  element={
                    <ProtectedRoute>
                      <TaxFilingSupport />
                    </ProtectedRoute>
                  } 
                />
                
                {/* デフォルトルート */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App