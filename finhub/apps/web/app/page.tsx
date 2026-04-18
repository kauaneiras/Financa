"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, TrendingUp, TrendingDown, Clock, LogOut, PlusSquare, X } from 'lucide-react';

function AddAccountModal({ isOpen, onClose, onAdded }: { isOpen: boolean, onClose: () => void, onAdded: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('PIX');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('http://127.0.0.1:4000/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name, 
          type, 
          bankName: 'Meu Banco', 
          balance: Number(balance)
        })
      });
      onAdded();
      onClose();
    } catch (err) {
      alert('Erro ao salvar.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition">
          <X className="w-5 h-5" />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Cadastrar Conta/Cartão</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-slate-500 mb-2 block">Nome da Conta (ex: Nubank, VA Caju)</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="Sua conta" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-500 mb-2 block">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-800">
                <option value="PIX">Pix/Poupança</option>
                <option value="CREDIT_CARD">Cartão de Crédito</option>
                <option value="VA">Vale Alimentação</option>
                <option value="VR">Vale Refeição</option>
              </select>
            </div>
            {(type !== 'CREDIT_CARD') && (
              <div>
                <label className="text-sm font-semibold text-slate-500 mb-2 block">Saldo Atual (R$)</label>
                <input required value={balance} onChange={e => setBalance(e.target.value)} type="number" step="0.01" className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="0.00" />
              </div>
            )}
            <button disabled={loading} className="w-full h-12 mt-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition active:scale-95">
              {loading ? 'Salvando...' : 'Salvar Novo Cartão'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboard = () => {
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
      if(payload.error) router.push('/auth');
      else setData(payload);
    })
    .catch(() => router.push('/auth'));
  };

  useEffect(() => {
    fetchDashboard();
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

      {data.balanceBreakdown?.length <= 1 && data.totalIncome === 0 && data.totalExpense === 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 mb-8 text-center">
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-6">
            Você ainda não tem contas, vales ou salários registrados.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-primary text-white font-bold rounded-2xl inline-flex items-center gap-2 hover:bg-primary/90 transition shadow-lg shadow-primary/30"
          >
            <PlusSquare className="w-5 h-5" />
            Cadastrar novo cartão / conta
          </button>
        </div>
      )}

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



      <AddAccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdded={() => fetchDashboard()} 
        />
    </div>
  );
}
