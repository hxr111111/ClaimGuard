import React from 'react';
import { Bell, Search, Menu, User, Briefcase } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-[#005cb9] rounded flex items-center justify-center text-white font-bold text-lg group-hover:bg-[#004a96] transition-colors">
                C
              </div>
              <span className="font-bold text-gray-800 text-xl tracking-tight">ClaimGuard</span>
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search People, Tasks and Reports" 
                className="w-full bg-[#f0f1f4] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#005cb9] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 relative hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full pr-3 transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                AL
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Alex Lee</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
         <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
            &copy; 2024 Avo.ai Enterprises. All rights reserved.
         </div>
      </footer>
    </div>
  );
};
