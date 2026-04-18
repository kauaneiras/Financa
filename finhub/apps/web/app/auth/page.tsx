"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://127.0.0.1:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('auth_token', data.token);
        router.push('/');
      } else {
        alert(data.error || 'Erro no login');
      }
    } catch(err) {
      alert('Erro de conexão');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex justify-center items-center p-6 mt-20">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Bem-vindo ao FinHub</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-500 mb-2 block">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-500 mb-2 block">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
              placeholder="••••••••"
            />
          </div>
          <button 
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button className="w-full h-12 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Continuar com Google
          </button>
          <button className="w-full h-12 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Continuar com Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
