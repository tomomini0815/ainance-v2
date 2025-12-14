import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Components
import { AuthProvider } from './components/AuthProvider'
import { BusinessTypeProvider } from './context/BusinessTypeContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
// Pages (Lazy Loaded)
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ReceiptProcessing = React.lazy(() => import('./pages/ReceiptProcessing'));
const QuickReceiptScan = React.lazy(() => import('./pages/QuickReceiptScan'));
const InvoiceCreation = React.lazy(() => import('./pages/InvoiceCreation'));
const BusinessAnalysis = React.lazy(() => import('./pages/BusinessAnalysis'));
const ChatToBook = React.lazy(() => import('./pages/ChatToBook'));
const BusinessConversion = React.lazy(() => import('./pages/BusinessConversion'));
const IntegrationSettings = React.lazy(() => import('./pages/IntegrationSettings'));
const TransactionHistory = React.lazy(() => import('./pages/TransactionHistory'));
const AITransactionList = React.lazy(() => import('./pages/AITransactionList'));
const TaxFilingSupport = React.lazy(() => import('./pages/TaxFilingSupport'));
const TaxFilingWizard = React.lazy(() => import('./pages/TaxFilingWizard'));
const Login = React.lazy(() => import('./pages/Login'));
const DatabaseTestPage = React.lazy(() => import('./pages/DatabaseTestPage'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Signup = React.lazy(() => import('./pages/Signup'));

// プリロード関数
const preloadRoute = (importFunc: () => Promise<any>) => {
  importFunc();
};

// 重要なページをプリロード
preloadRoute(() => import('./pages/Dashboard'));
preloadRoute(() => import('./pages/Login'));
preloadRoute(() => import('./pages/LandingPage'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-text-muted">読み込み中...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BusinessTypeProvider>
          <React.Suspense fallback={<PageLoader />}>
            <Routes>
              {/* パブリックルート */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* 保護されたルート - Layoutでラップ */}
              <Route element={<Layout />}>
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
                  path="/quick-scan"
                  element={
                    <ProtectedRoute>
                      <QuickReceiptScan />
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
                <Route
                  path="/tax-filing-wizard"
                  element={
                    <ProtectedRoute>
                      <TaxFilingWizard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/database-test"
                  element={
                    <ProtectedRoute>
                      <DatabaseTestPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Public Pages */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />

              {/* デフォルトルート */}
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </BusinessTypeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App