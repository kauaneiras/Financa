"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, TrendingUp, TrendingDown, Clock, LogOut } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth');
      return;
    }

    fetch('http://127.0.0.1:4000/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(payload => {
      // In case API returns auth error
      if(payload.error) router.push('/auth');
      else setData(payload);
    })
    .catch(() => router.push('/auth'));
  }, []);

  if (!data) return <div className="p-10 text-center animate-pulse">Carregando painel inteligente...</div>;

  return (
    <div className="max-w-4xl mx-auto w-full p-6 mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Painel FinHub</h1>
        <button 
          onClick={() => { localStorage.removeItem('auth_token'); router.push('/auth'); }}
          className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/20">
          <div className="flex items-center gap-3 mb-4 text-white/80">
            <Wallet className="w-5 h-5" /> 
            <span className="font-semibold">Saldo Restante Esperado</span>
          </div>
          <p className="text-4xl font-bold">R$ {data.predictedRemainingBalance?.toFixed(2) || '0.00'}</p>
          <p className="text-sm mt-3 opacity-90">Já deduzindo assinaturas do mês</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <TrendingUp className="w-5 h-5" /> 
            <span className="font-semibold">Renda Total</span>
          </div>
          <p className="text-3xl font-bold dark:text-white">R$ {data.totalIncome?.toFixed(2) || '0.00'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3 mb-4 text-red-500">
            <TrendingDown className="w-5 h-5" /> 
            <span className="font-semibold">Gastos Consumados</span>
          </div>
          <p className="text-3xl font-bold dark:text-white">R$ {data.totalExpense?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => router.push('/quick-log')} className="h-20 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition rounded-3xl font-semibold text-lg flex justify-center items-center gap-3 border border-slate-200 dark:border-slate-700">
          <TrendingDown className="w-6 h-6 text-red-500" />
          Lançar Despesa / Renda
        </button>

        <div className="bg-amber-100 dark:bg-amber-900/20 p-6 rounded-3xl text-amber-800 dark:text-amber-500 border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5" /> 
            <span className="font-semibold">Assinaturas Ativas</span>
          </div>
          <p className="text-2xl font-bold mb-1">R$ {data.activeSubscriptionsTotal?.toFixed(2) || '0.00'}</p>
          <p className="text-sm">Reservado paraNetflix, IFOOD, etc.</p>
        </div>
      </div>
    </div>
  );
}
