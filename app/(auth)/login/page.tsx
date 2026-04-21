'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/app/components/Logo';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciais inválidas.');
      }

      const data = await response.json();
      await login(data.token);
      router.push('/search');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 sm:p-6 selection:bg-lime-400/30">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-10">
          <Logo className="scale-125 mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Bem-vindo de volta</h1>
          <p className="text-zinc-500 text-sm mt-1">Entre na sua conta para continuar</p>
        </div>

        {/* Form Container */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Error Message with smooth appearance */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                error ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
              }`}
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-lime-400 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Palavra-passe
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-lime-400 transition-colors" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full bg-lime-400 hover:bg-lime-500 text-black font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-[0_4px_14px_rgba(163,230,53,0.3)]`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>A entrar...</span>
                  </>
                ) : (
                  <span>Entrar na conta</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center border-t border-zinc-900 pt-6">
            <p className="text-sm text-zinc-500">
              Ainda não tem conta?{' '}
              <Link href="/register" className="text-lime-400 hover:text-lime-300 font-semibold transition-colors">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>

        {/* App Footer/Info */}
        <p className="mt-8 text-center text-[10px] text-zinc-700 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Media Tracker — Organize seus filmes, séries e livros
        </p>
      </div>
    </div>
  );
};

export default LoginPage;