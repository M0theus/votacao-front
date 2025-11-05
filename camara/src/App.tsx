import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Votacao from './pages/Votacao';
import AdminPanel from './pages/AdminPanel';
import Resultado from './pages/Resultado';
import EditarUsuario from './pages/EditarUsuario';
import GerenciarUsuarios from './pages/GerenciarUsuarios';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/votacao" element={
            <ProtectedRoute>
              <Votacao />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin/usuarios" element={<GerenciarUsuarios />} />
          {/* RESULTADO É PÚBLICO - SEM PROTECTED ROUTE */}
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/editar-usuario" element={
            <ProtectedRoute>
              <EditarUsuario />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/votacao" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;