
import React from 'react';
import { useApp } from '../context/AppContext';
import { Icons, LOGO_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-0.5">
              <img 
                src={LOGO_URL} 
                alt="LADTEM Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=L";
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight tracking-tight">LADTEM</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Commission Portal</p>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{currentUser.role}</p>
              </div>
              <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <Icons.LogOut />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <img src={LOGO_URL} alt="LADTEM Logo" className="w-8 h-8 opacity-40 grayscale mb-4" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center">
            &copy; 2024 Ladtem Commission
            <span className="mx-3 text-slate-200">|</span>
            Authorized Academic Gateway
          </p>
          <div className="mt-4 flex gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            <span>Transparency</span>
            <span>Integrity</span>
            <span>Excellence</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
