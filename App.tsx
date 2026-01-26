import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { TypographyProvider, TypographyStyles } from './context/TypographyContext';
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
import { SessionHistoryPage } from './components/SessionHistoryPage';
import { Consultations } from './components/Consultations';
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
  '/consultations': 'Consultations',
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPageWithNav />} />
        <Route path="/signup" element={<SignUpFlowWithNav />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // No wrapper padding - pages handle their own left padding so backgrounds extend full width
  const sidebarCollapsedWidth = 0;

  return (
    <div className="flex h-screen w-full overflow-hidden relative" style={{ backgroundColor: '#fafaf9' }}>
      {/*
        REFINED BACKGROUND SYSTEM - Matching Cortexa LP aesthetic
        Base: stone-50 (#fafaf9) - clean, neutral warmth
        Layers: Subtle radial warmth + ambient light effects
      */}

      {/* Layer 1: Subtle warm radial from center-bottom - mimics ambient warmth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(254, 243, 199, 0.25) 0%, rgba(254, 249, 239, 0.15) 40%, transparent 70%)',
        }}
      />

      {/* Layer 2: Top-right ambient light - creates depth and direction */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 85% 10%, rgba(255, 251, 245, 0.6) 0%, rgba(250, 248, 244, 0.3) 30%, transparent 60%)',
        }}
      />

      {/* Layer 3: Soft left-side warmth - balances the composition */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 10% 60%, rgba(253, 246, 236, 0.2) 0%, transparent 50%)',
        }}
      />

      {/* Layer 4: Gentle overall warm tint - cohesive warmth without saturation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(252, 250, 247, 0.4) 0%, rgba(250, 248, 244, 0.2) 50%, rgba(248, 245, 240, 0.3) 100%)',
        }}
      />

      {/* Floating Glassmorphic Sidebar - hovers over content */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main content - fixed left padding to account for collapsed sidebar */}
      <div className="flex flex-col flex-1 h-full relative">
        {/* Fixed left margin for desktop to prevent content under collapsed sidebar */}
        <style>{`
          @media (min-width: 1024px) {
            #main-content {
              padding-left: ${sidebarCollapsedWidth}px;
            }
          }
        `}</style>
        <div id="main-content" className="flex flex-col flex-1 h-full relative">

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
                <Route path="/clinician/:clinicianId/session-history" element={<SessionHistoryPage />} />
                <Route path="/consultations" element={<Consultations />} />
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
          <TypographyProvider>
            <TypographyStyles />
            <ReferralProvider>
              <ProtectedApp />
            </ReferralProvider>
          </TypographyProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
