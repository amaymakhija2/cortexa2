import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ReferralProvider } from './components/referral';
import { LoginPage } from './components/LoginPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { PracticeAnalysis } from './components/PracticeAnalysis';
import { ClinicianOverview } from './components/ClinicianOverview';
import { ClinicianDetails } from './components/ClinicianDetails';
import { SettingsPage } from './components/SettingsPage';
import { PracticeConfigurationPage } from './components/PracticeConfigurationPage';
import { Reference as Components } from './components/design-system';
import { Menu } from 'lucide-react';

// =============================================================================
// MOBILE HEADER COMPONENT
// =============================================================================
// A minimal header for mobile/tablet that provides menu access and page context.
// =============================================================================

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/clinician-overview': 'Clinicians',
  '/practice-analysis': 'Practice Details',
  '/clinician-details': 'Clinician Details',
  '/configure': 'Configure',
  '/components': 'Components',
  '/settings': 'Settings',
};

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuOpen }) => {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Cortexa';

  return (
    <header
      className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 24, 22, 0.98) 0%, rgba(26, 24, 22, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        onClick={onMenuOpen}
        className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all duration-200"
        style={{
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Menu size={20} strokeWidth={1.5} />
      </button>

      <h1
        className="text-lg font-semibold tracking-[-0.01em] text-stone-100"
      >
        {pageTitle}
      </h1>

      {/* Spacer to center title */}
      <div className="w-11" />
    </header>
  );
};

// =============================================================================
// AUTH PAGES WITH ROUTING
// =============================================================================

const LoginPageWithNav: React.FC = () => {
  const navigate = useNavigate();
  return <LoginPage onSwitchToSignUp={() => navigate('/signup')} />;
};

const SignUpFlowWithNav: React.FC = () => {
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    navigate('/login');
  };

  return (
    <OnboardingFlow
      onComplete={handleOnboardingComplete}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
};

const ProtectedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPageWithNav />} />
        <Route path="/signup" element={<SignUpFlowWithNav />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Dynamic margin based on sidebar state
  const sidebarWidth = sidebarCollapsed ? 80 : 320;

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#fef5e7] via-[#fae5c1] to-[#f5d5a8] overflow-hidden relative">
      {/* Sophisticated overlay gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/20 via-transparent to-orange-50/30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-100/40 via-transparent to-transparent pointer-events-none"></div>

      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main content - dynamic margin based on sidebar state */}
      <div
        className="flex flex-col flex-1 h-full relative"
      >
        {/* Inject dynamic margin for desktop */}
        <style>{`
          @media (min-width: 1024px) {
            #main-content {
              margin-left: ${sidebarWidth}px;
              transition: margin-left 250ms cubic-bezier(0.4, 0, 0.2, 1);
            }
          }
        `}</style>
        <div id="main-content" className="flex flex-col flex-1 h-full relative">
        {/* Premium background gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-amber-50/20"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-50/10 to-yellow-50/20"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Mobile Header */}
          <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

          {/* Main content area - add bottom padding for BottomNav on mobile/tablet */}
          <div className="flex-1 flex flex-col pb-16 lg:pb-0 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/practice-analysis" element={<PracticeAnalysis />} />
              <Route path="/clinician-overview" element={<ClinicianOverview />} />
              <Route path="/clinician-details" element={<ClinicianDetails />} />
              <Route path="/configure" element={<PracticeConfigurationPage />} />
              <Route path="/components" element={<Components />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <ReferralProvider>
            <ProtectedApp />
          </ReferralProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
