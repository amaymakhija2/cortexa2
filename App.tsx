import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PracticeAnalysis } from './components/PracticeAnalysis';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen w-full bg-[#e8cfb3] overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full relative">
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-b from-[#f0dcc5] to-[#e8cfb3] opacity-50 z-0"></div>
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
