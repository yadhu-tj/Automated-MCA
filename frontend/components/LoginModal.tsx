import React, { useEffect, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.loginAdmin(email, password);

      if (response?.token) {
        localStorage.setItem('adminToken', response.token);
        onLoginSuccess();
      } else {
        setError('Invalid admin credentials.');
      }
    } catch {
      setError('Invalid admin credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close login modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl border border-white/70"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mca-50 text-mca-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
              <p className="text-sm text-gray-500">Access the dashboard</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="admin-email">
          Admin Email
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          placeholder="admin@mca.com"
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-mca-500 focus:border-mca-500"
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-mca-500 focus:border-mca-500"
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-mca-600 text-white rounded-md font-semibold hover:bg-mca-700 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

