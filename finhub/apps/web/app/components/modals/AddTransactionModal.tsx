"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

const API = "http://127.0.0.1:4000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type TxType = "EXPENSE" | "INCOME" | "SUBSCRIPTION" | "INVESTMENT";

export interface Transaction {
  id: string; amount: number; type: TxType; category: string;
  description?: string; date: string; accountId?: string | null;
  isRecurring?: boolean; installments?: number | null;
  installmentCurrent?: number | null; investmentRate?: number | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultType?: TxType;
  editing?: Transaction | null;
}

const TYPES: { id: TxType; label: string; color: string }[] = [
  { id: "EXPENSE",      label: "Despesa",    color: "var(--danger)" },
  { id: "INCOME",       label: "Entrada",    color: "var(--success)" },
  { id: "SUBSCRIPTION", label: "Assinatura", color: "var(--warning)" },
  { id: "INVESTMENT",   label: "Investimento",color: "var(--invest)" },
];

const CATEGORIES = [
  "Alimentação","Transporte","Moradia","Saúde","Educação","Lazer",
  "Compras","Serviços","Streaming","Outros",
];

export default function AddTransactionModal({ isOpen, onClose, onSaved, defaultType, editing }: Props) {
  const isEdit = !!editing;

  const [type, setType]           = useState<TxType>("EXPENSE");
  const [amount, setAmount]       = useState("");
  const [category, setCategory]   = useState("Outros");
  const [description, setDesc]    = useState("");
  const [date, setDate]           = useState(new Date().toISOString().substring(0, 10));
  const [isRecurring, setRec]     = useState(false);
  const [installments, setInst]   = useState(1);
  const [investRate, setInvRate]   = useState("");
  const [accounts, setAccounts]   = useState<any[]>([]);
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!isOpen) return;
    // Fetch accounts
    fetch(`${API}/accounts`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(setAccounts).catch(() => {});
    // Pre-fill
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setDesc(editing.description || "");
      setDate(editing.date.substring(0, 10));
      setRec(editing.isRecurring || false);
      setInst(editing.installments || 1);
      setInvRate(editing.investmentRate ? String(editing.investmentRate) : "");
      setAccountId(editing.accountId || "");
    } else {
      setType(defaultType || "EXPENSE");
      setAmount(""); setCategory("Outros"); setDesc("");
      setDate(new Date().toISOString().substring(0, 10));
      setRec(false); setInst(1); setInvRate(""); setAccountId("");
    }
    setError("");
  }, [isOpen, editing, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body: any = {
        amount: Number(amount), type, category, description,
        date, isRecurring, accountId: accountId || null,
      };
      if (type === "EXPENSE" && installments > 1) {
        body.installments = installments;
        body.installmentCurrent = editing?.installmentCurrent || 1;
        body.installmentStartDate = date;
      }
      if (type === "INVESTMENT" && investRate) {
        body.investmentRate = Number(investRate);
      }

      const url    = isEdit ? `${API}/transactions/${editing!.id}` : `${API}/transactions`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: authH(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      onSaved();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    }
    setLoading(false);
  };

  const typeCfg = TYPES.find(t => t.id === type)!;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
      padding: "24px 16px",
    }}>
      <div className="animate-slide-up" style={{
        background: "var(--surface)", borderRadius: 24,
        maxWidth: 480, width: "100%", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)" }}>
            {isEdit ? "Editar" : "Nova"} Transação
          </h2>
          <button onClick={onClose} style={{ background: "var(--surface-2)", border: "none", borderRadius: 12, padding: 8, cursor: "pointer", color: "var(--text-2)" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", maxHeight: "80vh" }}>
          {/* Type selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TYPES.map(t => (
              <button type="button" key={t.id} onClick={() => setType(t.id)}
                style={{
                  padding: "10px 8px", borderRadius: 14,
                  border: `2px solid ${type === t.id ? t.color : "var(--border)"}`,
                  background: type === t.id ? `${t.color}22` : "var(--surface-2)",
                  color: type === t.id ? t.color : "var(--text-2)",
                  fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Valor (R$)</label>
            <input required value={amount} onChange={e => setAmount(e.target.value)}
              type="number" step="0.01" min="0.01" placeholder="0,00" className="input-base"
              style={{ fontSize: 24, fontWeight: 800, color: typeCfg.color, height: 56 }} />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Categoria</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map(c => (
                <button type="button" key={c} onClick={() => setCategory(c)}
                  style={{
                    padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: `1.5px solid ${category === c ? "var(--accent)" : "var(--border)"}`,
                    background: category === c ? "var(--accent)" : "var(--surface-2)",
                    color: category === c ? "#fff" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Descrição</label>
            <input value={description} onChange={e => setDesc(e.target.value)}
              placeholder="Ex: Supermercado, Netflix..." className="input-base" />
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-base" style={{ fontSize: 13 }} />
          </div>

          {/* Account */}
          {accounts.length > 0 && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Conta (opcional)</label>
              <select value={accountId} onChange={e => setAccountId(e.target.value)} className="input-base" style={{ fontSize: 13 }}>
                <option value="">Nenhuma</option>
                {accounts.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>
          )}

          {/* Installments slider (expenses only) */}
          {type === "EXPENSE" && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
                Parcelas: <span style={{ color: "var(--accent)", fontSize: 15, fontWeight: 800 }}>{installments}×</span>
              </label>
              <input type="range" min={1} max={48} value={installments} onChange={e => setInst(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)", height: 4 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                <span>À vista</span><span>12×</span><span>24×</span><span>48×</span>
              </div>
            </div>
          )}

          {/* Recurring toggle (subscriptions only) */}
          {type === "SUBSCRIPTION" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button type="button" onClick={() => setRec(r => !r)}
                style={{
                  width: 48, height: 28, borderRadius: 99, border: "none", cursor: "pointer",
                  background: isRecurring ? "var(--accent)" : "var(--surface-3)",
                  position: "relative", transition: "background 0.2s",
                }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 99, background: "#fff",
                  position: "absolute", top: 3,
                  left: isRecurring ? 23 : 3,
                  transition: "left 0.2s",
                }} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Recorrente (mensal)</span>
            </div>
          )}

          {/* Investment rate */}
          {type === "INVESTMENT" && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Taxa anual (%)</label>
              <input value={investRate} onChange={e => setInvRate(e.target.value)}
                type="number" step="0.01" placeholder="12.5" className="input-base" />
            </div>
          )}

          {error && (
            <div style={{ display: "flex", gap: 8, padding: 12, background: "var(--danger-bg)", color: "var(--danger)", borderRadius: 12, fontSize: 13 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ height: 52, fontSize: 15 }}>
            {loading ? "Salvando..." : isEdit ? "Salvar Alterações" : "Adicionar"}
          </button>
        </form>
      </div>
    </div>
  );
}
