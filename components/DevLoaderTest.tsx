import React, { useState, useEffect } from 'react';
import { CortexaLoader } from './CortexaLoader';

export const DevLoaderTest: React.FC = () => {
  const [showLoader, setShowLoader] = useState(false);

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !showLoader) {
        e.preventDefault();
        setShowLoader(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLoader]);

  // Simulated app content that gets revealed
  return (
    <div className="h-screen w-full relative" style={{ backgroundColor: '#fafaf9' }}>
      {/* Simulated app background layers - matching actual app */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(254, 243, 199, 0.25) 0%, rgba(254, 249, 239, 0.15) 40%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 85% 10%, rgba(255, 251, 245, 0.6) 0%, rgba(250, 248, 244, 0.3) 30%, transparent 60%)',
        }}
      />

      {/* Test page content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-stone-400 text-xs font-medium tracking-widest uppercase">Loader Preview</p>
            <h1 className="text-2xl font-light text-stone-800 tracking-tight">Brand Reveal Animation</h1>
            <p className="text-stone-500 text-sm max-w-xs mx-auto">
              Dots disperse outward to reveal your dashboard
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              onClick={() => setShowLoader(true)}
              disabled={showLoader}
              className="px-8 py-3 bg-stone-900 text-stone-100 rounded-full hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium tracking-wide shadow-lg shadow-stone-900/10"
            >
              {showLoader ? 'Playing...' : 'Play Animation'}
            </button>

            <p className="text-stone-400 text-xs">
              or press <kbd className="px-2 py-1 bg-stone-100 rounded text-[11px] font-mono text-stone-500 border border-stone-200">Space</kbd>
            </p>
          </div>
        </div>
      </div>

      {showLoader && <CortexaLoader onDone={() => setShowLoader(false)} />}
    </div>
  );
};
