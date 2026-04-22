import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PublicHome } from './pages/PublicHome';
import { AdminPanel } from './pages/AdminPanel';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <HashRouter>
      <Routes>

        {/* PUBLIC PAGE */}
        <Route 
          path="/" 
          element={
            <Layout>
              <PublicHome />
            </Layout>
          } 
        />

        {/* LOGIN PAGE */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN PAGE (PROTECTED) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
