import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { PracticeAnalysis } from './components/PracticeAnalysis';
import { ClinicianOverview } from './components/ClinicianOverview';
import { SettingsPage } from './components/SettingsPage';
import { Reference as Components } from './components/design-system';

const ProtectedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#fef5e7] via-[#fae5c1] to-[#f5d5a8] overflow-hidden relative">
      {/* Sophisticated overlay gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/20 via-transparent to-orange-50/30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-100/40 via-transparent to-transparent pointer-events-none"></div>

      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      {/* Main content - add left margin on desktop (lg+) to account for fixed sidebar */}
      <div className="flex flex-col flex-1 h-full relative lg:ml-[72px]">
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
           {/* Multi-layered premium gradient */}
           <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-amber-50/20"></div>
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-50/10 to-yellow-50/20"></div>
         </div>
         <div className="relative z-10 flex flex-col h-full">
            <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />
            {/* Main content area - add bottom padding for BottomNav on mobile/tablet */}
            <div className="flex-1 flex flex-col pb-16 lg:pb-0 overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/practice-analysis" element={<PracticeAnalysis />} />
                <Route path="/clinician-overview" element={<ClinicianOverview />} />
                <Route path="/components" element={<Components />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </div>
            {/* Mobile Bottom Navigation */}
            <BottomNav />
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </Router>
  );
};

export default App;
