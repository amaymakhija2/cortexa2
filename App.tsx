import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-[#e8cfb3] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full relative">
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-b from-[#f0dcc5] to-[#e8cfb3] opacity-50 z-0"></div>
         <div className="relative z-10 flex flex-col h-full">
            <Header />
            <Dashboard />
         </div>
      </div>
    </div>
  );
};

export default App;
