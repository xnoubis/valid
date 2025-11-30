import React from 'react';
import { Shield, Lock, Activity, UserSearch } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'trust' | 'paw' | 'interviewed';
  onTabChange: (tab: 'trust' | 'paw' | 'interviewed') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">TRUST PROTOCOL</h1>
                <p className="text-xs text-slate-500 font-mono tracking-wider">BIDIRECTIONAL VALIDATION SYS</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => onTabChange('trust')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'trust' 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Identity</span>
                </div>
              </button>
              <button
                onClick={() => onTabChange('paw')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'paw' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Guard</span>
                </div>
              </button>
              <button
                onClick={() => onTabChange('interviewed')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'interviewed' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center">
                  <UserSearch className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Interviewed</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p className="mb-2">"As much as what's within acceptable, appropriate boundaries."</p>
          <p className="font-mono text-xs">TRUST IS EARNED. DISTANCE IS PROTECTIVE.</p>
        </div>
      </footer>
    </div>
  );
};