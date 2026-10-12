import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/error';


export function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível concluir a operação. Verifique os dados e tente novamente.', false));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex animate-fade-in">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-dots pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <img src="/logo.png" alt="SIGEFROTA Logo" className="w-80 h-80 object-contain drop-shadow-xl" />
          <h2 className="mt-8 text-4xl font-extrabold text-primary tracking-tight">Bem-vindo ao SIGEFROTA</h2>
          <p className="mt-4 text-lg text-primary/70 max-w-sm text-center font-medium">A solução definitiva e inteligente para a gestão corporativa da sua frota.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 xl:p-24 bg-white relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
        </div>
        
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Fazer Login</h1>
            <p className="text-gray-500 font-medium">Insira suas credenciais para acessar o painel.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">E-mail Corporativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900"
                placeholder="voce@empresa.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex items-center font-medium">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Autenticando...' : 'Acessar Plataforma'}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 font-medium">
              Ainda não tem conta?{' '}
              <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
                Solicitar Acesso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
