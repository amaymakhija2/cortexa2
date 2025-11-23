import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PracticeAnalysis } from './components/PracticeAnalysis';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen w-full bg-gradient-to-br from-[#fef5e7] via-[#fae5c1] to-[#f5d5a8] overflow-hidden relative">
        {/* Sophisticated overlay gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/20 via-transparent to-orange-50/30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-100/40 via-transparent to-transparent pointer-events-none"></div>

        <Sidebar />
        <div className="flex flex-col flex-1 h-full relative">
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
             {/* Multi-layered premium gradient */}
             <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-amber-50/20"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-50/10 to-yellow-50/20"></div>
           </div>
           <div className="relative z-10 flex flex-col h-full">
              <Header />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/practice-analysis" element={<PracticeAnalysis />} />
                <Route path="/clinician-overview" element={<div className="flex-1 p-8"><h1 className="text-3xl">Clinician Overview (Coming Soon)</h1></div>} />
              </Routes>
           </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
