import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Home, Menu, X, Info } from 'lucide-react';
import { LoginModal } from './LoginModal';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'bg-mca-600 text-white'
      : 'text-gray-300 hover:bg-mca-800 hover:text-white';

  const openLoginModal = () => {
    setIsMobileMenuOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-mca-900 shadow-lg sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center justify-between w-full">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
                  <GraduationCap className="h-8 w-8 text-sky-400" />
                  <span>UCC MCA Dept.</span>
                </Link>
              </div>

              {/* Menu & Info Button on Right */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-xs italic">v1.1</span>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="bg-mca-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-mca-700 focus:outline-none transition-all"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown Menu (Floating on all sizes) */}
        {isMobileMenuOpen && (
          <div className="absolute right-4 sm:right-6 lg:right-8 top-16 w-56 mt-1 origin-top-right rounded-xl bg-mca-950/95 backdrop-blur-md border border-mca-800 shadow-2xl ring-1 ring-black ring-opacity-5 z-50 p-2 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${location.pathname === '/'
                ? 'bg-mca-700 text-white shadow-md'
                : 'text-slate-300 hover:bg-mca-800 hover:text-white'
                }`}
            >
              <Home className="h-4 w-4 text-sky-400" />
              Public Portal
            </Link>

            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${location.pathname === '/about'
                ? 'bg-mca-700 text-white shadow-md'
                : 'text-slate-300 hover:bg-mca-800 hover:text-white'
                }`}
            >
              <Info className="h-4 w-4 text-sky-400" />
              About Dept
            </Link>

            {localStorage.getItem('adminToken') ? (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${location.pathname === '/admin'
                  ? 'bg-mca-700 text-white shadow-md'
                  : 'text-slate-300 hover:bg-mca-800 hover:text-white'
                  }`}
              >
                Admin Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-mca-800 hover:text-white transition-colors"
              >
                Login
              </button>
            )}
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
