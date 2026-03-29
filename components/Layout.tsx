import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Home, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'bg-mca-600 text-white'
      : 'text-gray-300 hover:bg-mca-800 hover:text-white';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-mca-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
                  <GraduationCap className="h-8 w-8 text-sky-400" />
                  <span>MCA Dept.</span>
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}
                  >
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Public Portal
                    </div>
                  </Link>

                  {/* Admin Link Removed */}
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <span className="text-gray-400 text-xs italic pr-4">v1.1</span>
            </div>

            {/* Mobile Toggle Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-mca-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-mca-700 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-mca-900">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:bg-mca-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Public Portal
              </Link>

              {/* Admin Link Removed */}
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2025 MCA Department. All Rights Reserved.</p>
          <p className="text-xs text-gray-500">System Version 1.1 | Developed for SRS Compliance</p>
        </div>
      </footer>
    </div>
  );
};
