import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface Props {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 md:p-12 h-full w-full flex flex-col items-center justify-center">
        <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex flex-col items-center text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600 text-2xl">
            🔒
          </div>
          <h2 className="text-3xl font-extrabold text-red-700 tracking-tight mb-3">Acesso Negado</h2>
          <p className="text-red-600/80 font-medium">Você não tem permissão para acessar esta área do sistema.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
