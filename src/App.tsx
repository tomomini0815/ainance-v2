import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
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
const BudgetAnalysisPage = React.lazy(() => import('./pages/BudgetAnalysisPage'));
const QuickReceiptScan = React.lazy(() => import('./pages/QuickReceiptScan'));
const InvoiceCreation = React.lazy(() => import('./pages/InvoiceCreation'));
const BusinessAnalysis = React.lazy(() => import('./pages/BusinessAnalysis'));
const ChatToBook = React.lazy(() => import('./pages/ChatToBook'));
const BusinessConversion = React.lazy(() => import('./pages/BusinessConversion'));
const IntegrationSettings = React.lazy(() => import('./pages/IntegrationSettings'));
const TransactionHistory = React.lazy(() => import('./pages/TransactionHistory'));
const AITransactionList = React.lazy(() => import('./pages/AITransactionList'));
const SubsidyMatching = React.lazy(() => import('./pages/SubsidyMatching'));
const TaxFilingWizard = React.lazy(() => import('./pages/TaxFilingWizard'));
const TaxReturnInputForm = React.lazy(() => import('./components/taxReturn/TaxReturnInputForm').then(module => ({ default: module.TaxReturnInputForm })));
const CorporateTaxInputForm = React.lazy(() => import('./components/corporateTax/CorporateTaxInputForm').then(module => ({ default: module.CorporateTaxInputForm })));
const TaxFilingGuidePage = React.lazy(() => import('./pages/TaxFilingGuidePage'));
const CorporateTaxFilingPage = React.lazy(() => import('./pages/CorporateTaxFilingPage'));
const CorporateTaxGuidePage = React.lazy(() => import('./pages/CorporateTaxGuidePage'));
const CSVImportPage = React.lazy(() => import('./pages/CSVImportPage'));
const QuickTaxFilingPage = React.lazy(() => import('./pages/QuickTaxFilingPage'));
const TransactionInbox = React.lazy(() => import('./pages/TransactionInbox'));

const Login = React.lazy(() => import('./pages/Login'));
const DatabaseTestPage = React.lazy(() => import('./pages/DatabaseTestPage'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const Contact = React.lazy(() => import('./pages/Contact'));
const LegalNotice = React.lazy(() => import('./pages/LegalNotice'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Features = React.lazy(() => import('./pages/Features'));
const HowToUse = React.lazy(() => import('./pages/HowToUse'));
const Support = React.lazy(() => import('./pages/Support'));
const ReceiptTips = React.lazy(() => import('./pages/support/ReceiptTips'));
const InvoiceCompliance = React.lazy(() => import('./pages/support/InvoiceCompliance'));
const AccountDeletion = React.lazy(() => import('./pages/support/AccountDeletion'));
const MultiDevice = React.lazy(() => import('./pages/support/MultiDevice'));
const AccountHelp = React.lazy(() => import('./pages/support/AccountHelp'));
const PaymentHelp = React.lazy(() => import('./pages/support/PaymentHelp'));
const FeatureHelp = React.lazy(() => import('./pages/support/FeatureHelp'));
const Troubleshooting = React.lazy(() => import('./pages/support/Troubleshooting'));
const AccountCreate = React.lazy(() => import('./pages/support/AccountCreate'));
const LoginIssues = React.lazy(() => import('./pages/support/LoginIssues'));
const SocialLogin = React.lazy(() => import('./pages/support/SocialLogin'));
const TwoFactorAuth = React.lazy(() => import('./pages/support/TwoFactorAuth'));
const ChangePassword = React.lazy(() => import('./pages/support/ChangePassword'));
const ForgotPassword = React.lazy(() => import('./pages/support/ForgotPassword'));
const LoginHistory = React.lazy(() => import('./pages/support/LoginHistory'));
const SuspiciousActivity = React.lazy(() => import('./pages/support/SuspiciousActivity'));
const ProfileEdit = React.lazy(() => import('./pages/support/ProfileEdit'));
const EmailChange = React.lazy(() => import('./pages/support/EmailChange'));
const NotificationSettings = React.lazy(() => import('./pages/support/NotificationSettings'));
const PaymentPlans = React.lazy(() => import('./pages/support/PaymentPlans'));
const FreeVsPaid = React.lazy(() => import('./pages/support/FreeVsPaid'));
const PlanUpgrade = React.lazy(() => import('./pages/support/PlanUpgrade'));
const Cancellation = React.lazy(() => import('./pages/support/Cancellation'));
const PaymentMethods = React.lazy(() => import('./pages/support/PaymentMethods'));
const UpdateCard = React.lazy(() => import('./pages/support/UpdateCard'));
const BankTransfer = React.lazy(() => import('./pages/support/BankTransfer'));
const BillingDate = React.lazy(() => import('./pages/support/BillingDate'));
const InvoiceIssuance = React.lazy(() => import('./pages/support/InvoiceIssuance'));
const ReceiptDownload = React.lazy(() => import('./pages/support/ReceiptDownload'));
const QualifiedInvoice = React.lazy(() => import('./pages/support/QualifiedInvoice'));
const BillingHistory = React.lazy(() => import('./pages/support/BillingHistory'));
const ReceiptPhotoGuide = React.lazy(() => import('./pages/support/ReceiptPhotoGuide'));
const ManualEntry = React.lazy(() => import('./pages/support/ManualEntry'));
const CsvImport = React.lazy(() => import('./pages/support/CsvImport'));
const ChatUsage = React.lazy(() => import('./pages/support/ChatUsage'));
const VoiceInputTips = React.lazy(() => import('./pages/support/VoiceInputTips'));
const LineIntegration = React.lazy(() => import('./pages/support/LineIntegration'));
const UnknownEntry = React.lazy(() => import('./pages/support/UnknownEntry'));
const TaxReturnGuide = React.lazy(() => import('./pages/support/TaxReturnGuide'));
const EtaxLinkage = React.lazy(() => import('./pages/support/EtaxLinkage'));
const InvoiceCreationGuide = React.lazy(() => import('./pages/support/InvoiceCreationGuide'));
const FormDownload = React.lazy(() => import('./pages/support/FormDownload'));
const DashboardGuide = React.lazy(() => import('./pages/support/DashboardGuide'));
const ManagementReport = React.lazy(() => import('./pages/support/ManagementReport'));
const CashFlowForecast = React.lazy(() => import('./pages/support/CashFlowForecast'));
const CustomReport = React.lazy(() => import('./pages/support/CustomReport'));
const LoginFailedError = React.lazy(() => import('./pages/support/LoginFailedError'));
const ImageUploadError = React.lazy(() => import('./pages/support/ImageUploadError'));
const ButtonNotResponding = React.lazy(() => import('./pages/support/ButtonNotResponding'));
const WhiteScreen = React.lazy(() => import('./pages/support/WhiteScreen'));
const OfflineMode = React.lazy(() => import('./pages/support/OfflineMode'));
const SyncError = React.lazy(() => import('./pages/support/SyncError'));
const BankLinkageError = React.lazy(() => import('./pages/support/BankLinkageError'));
const SlowPerformance = React.lazy(() => import('./pages/support/SlowPerformance'));
const AppUpdate = React.lazy(() => import('./pages/support/AppUpdate'));
const SystemRequirements = React.lazy(() => import('./pages/support/SystemRequirements'));
const ClearCache = React.lazy(() => import('./pages/support/ClearCache'));
const BugReport = React.lazy(() => import('./pages/support/BugReport'));

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
          <Toaster position="top-right" />
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
                  path="/transaction-inbox"
                  element={
                    <ProtectedRoute>
                      <TransactionInbox />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subsidy-matching"
                  element={
                    <ProtectedRoute>
                      <SubsidyMatching />
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
                  path="/tax-return-input"
                  element={
                    <ProtectedRoute>
                      <TaxReturnInputForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/corporate-tax-input"
                  element={
                    <ProtectedRoute>
                      <CorporateTaxInputForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tax-filing-guide"
                  element={
                    <ProtectedRoute>
                      <TaxFilingGuidePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/corporate-tax"
                  element={
                    <ProtectedRoute>
                      <CorporateTaxFilingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/corporate-tax-guide"
                  element={
                    <ProtectedRoute>
                      <CorporateTaxGuidePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/csv-import"
                  element={
                    <ProtectedRoute>
                      <CSVImportPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/quick-tax-filing"
                  element={
                    <ProtectedRoute>
                      <QuickTaxFilingPage />
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
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/features" element={<Features />} />
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="/support" element={<Support />} />
              <Route path="/support/receipt-tips" element={<ReceiptTips />} />
              <Route path="/support/invoice-compliance" element={<InvoiceCompliance />} />
              <Route path="/support/account-deletion" element={<AccountDeletion />} />
              <Route path="/support/multi-device" element={<MultiDevice />} />
              <Route path="/support/account" element={<AccountHelp />} />
              <Route path="/support/payment" element={<PaymentHelp />} />
              <Route path="/support/features" element={<FeatureHelp />} />
              <Route path="/support/troubleshooting" element={<Troubleshooting />} />
              <Route path="/support/account/create" element={<AccountCreate />} />
              <Route path="/support/account/login-issues" element={<LoginIssues />} />
              <Route path="/support/account/social-login" element={<SocialLogin />} />
              <Route path="/support/account/2fa" element={<TwoFactorAuth />} />
              <Route path="/support/account/change-password" element={<ChangePassword />} />
              <Route path="/support/account/forgot-password" element={<ForgotPassword />} />
              <Route path="/support/account/login-history" element={<LoginHistory />} />
              <Route path="/support/account/suspicious-activity" element={<SuspiciousActivity />} />
              <Route path="/support/account/profile-edit" element={<ProfileEdit />} />
              <Route path="/support/account/email-change" element={<EmailChange />} />
              <Route path="/support/account/notification-settings" element={<NotificationSettings />} />
              <Route path="/support/payment/plans" element={<PaymentPlans />} />
              <Route path="/support/payment/free-vs-paid" element={<FreeVsPaid />} />
              <Route path="/support/payment/upgrade" element={<PlanUpgrade />} />
              <Route path="/support/payment/cancellation" element={<Cancellation />} />
              <Route path="/support/payment/methods" element={<PaymentMethods />} />
              <Route path="/support/payment/update-card" element={<UpdateCard />} />
              <Route path="/support/payment/bank-transfer" element={<BankTransfer />} />
              <Route path="/support/payment/billing-date" element={<BillingDate />} />
              <Route path="/support/payment/invoice-issuance" element={<InvoiceIssuance />} />
              <Route path="/support/payment/receipt-download" element={<ReceiptDownload />} />
              <Route path="/support/payment/qualified-invoice" element={<QualifiedInvoice />} />
              <Route path="/support/payment/billing-history" element={<BillingHistory />} />
              <Route path="/support/features/receipt-photo" element={<ReceiptPhotoGuide />} />
              <Route path="/support/features/manual-entry" element={<ManualEntry />} />
              <Route path="/support/features/csv-import" element={<CsvImport />} />
              <Route path="/support/features/chat-usage" element={<ChatUsage />} />
              <Route path="/support/features/voice-input" element={<VoiceInputTips />} />
              <Route path="/support/features/line-integration" element={<LineIntegration />} />
              <Route path="/support/features/unknown-entry" element={<UnknownEntry />} />
              <Route path="/support/features/tax-return" element={<TaxReturnGuide />} />
              <Route path="/support/features/etax-linkage" element={<EtaxLinkage />} />
              <Route path="/support/features/invoice-creation" element={<InvoiceCreationGuide />} />
              <Route path="/support/features/form-download" element={<FormDownload />} />
              <Route path="/support/features/dashboard" element={<DashboardGuide />} />
              <Route path="/support/features/management-report" element={<ManagementReport />} />
              <Route path="/support/features/cash-flow" element={<CashFlowForecast />} />
              <Route path="/support/features/custom-report" element={<CustomReport />} />
              <Route path="/support/troubleshooting/login-failed" element={<LoginFailedError />} />
              <Route path="/support/troubleshooting/image-upload" element={<ImageUploadError />} />
              <Route path="/support/troubleshooting/button-not-responding" element={<ButtonNotResponding />} />
              <Route path="/support/troubleshooting/white-screen" element={<WhiteScreen />} />
              <Route path="/support/troubleshooting/offline-mode" element={<OfflineMode />} />
              <Route path="/support/troubleshooting/sync-error" element={<SyncError />} />
              <Route path="/support/troubleshooting/bank-linkage" element={<BankLinkageError />} />
              <Route path="/support/troubleshooting/slow-performance" element={<SlowPerformance />} />
              <Route path="/support/troubleshooting/app-update" element={<AppUpdate />} />
              <Route path="/support/troubleshooting/system-requirements" element={<SystemRequirements />} />
              <Route path="/support/troubleshooting/clear-cache" element={<ClearCache />} />
              <Route path="/support/troubleshooting/bug-report" element={<BugReport />} />
              {/* <Route path="/legal" element={<LegalNotice />} /> */}

              {/* デフォルトルート */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/budget-analysis" element={<React.Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}><BudgetAnalysisPage /></React.Suspense>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </BusinessTypeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App