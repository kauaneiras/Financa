"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export default function QuickLog() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    const token = localStorage.getItem('auth_token');

    try {
      const res = await fetch('http://127.0.0.1:4000/api/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, category, type })
      });
      if (res.ok) {
        setFeedback('🎉 Registrado com sucesso!');
        setTimeout(() => router.push('/'), 1200);
      } else {
        setFeedback('❌ Falha ao registrar.');
      }
    } catch(err) {
      setFeedback('❌ Erro de conexão ao salvar.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-6 mt-10">
      <div className="flex items-center gap-4 mb-8 text-slate-800 dark:text-slate-100">
        <button onClick={() => router.back()} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:scale-105 transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">Lançamento Rápido</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
        {feedback && (
          <div className="mb-6 p-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl font-bold font-sans text-center transition">
            {feedback}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-2 gap-2">
            <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 py-3 font-bold rounded-xl transition ${type === 'EXPENSE' ? 'bg-white dark:bg-slate-700 shadow text-red-500' : 'text-slate-500'}`}>Saída</button>
            <button type="button" onClick={() => setType('INCOME')} className={`flex-1 py-3 font-bold rounded-xl transition ${type === 'INCOME' ? 'bg-white dark:bg-slate-700 shadow text-emerald-500' : 'text-slate-500'}`}>Entrada</button>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500 mb-2 block">Valor Total</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-xl font-bold text-slate-400">R$</span>
              <input 
                type="number" 
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full h-16 pl-12 pr-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-2xl font-bold font-mono dark:text-white focus:border-primary outline-none transition"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500 mb-2 block">Categoria ou Título</label>
            <input 
              type="text" 
              required
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-16 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-lg font-medium dark:text-white focus:border-primary outline-none transition"
              placeholder="Ex: Assado e Churrasco, Mercado..."
            />
          </div>

          <button disabled={loading} className="w-full h-16 bg-primary hover:bg-blue-600 text-white font-bold text-lg rounded-2xl active:scale-95 transition-transform flex justify-center items-center gap-2">
            <PlusCircle className="w-6 h-6" /> Registar Finança
          </button>
        </form>
      </div>
    </div>
  );
}
