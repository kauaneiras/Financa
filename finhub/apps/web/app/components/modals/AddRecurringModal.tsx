"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

const API = "http://127.0.0.1:4000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type RType = "SALARY" | "VA" | "VR" | "OTHER";

export interface RecurringIncome {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  type: RType;
  active: boolean;
  startDate: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existing?: RecurringIncome | null;
}

const TYPES: { id: RType; label: string; emoji: string; color: string }[] = [
  { id: "SALARY", label: "Salário",    emoji: "💵", color: "#10b981" },
  { id: "VA",     label: "Vale Alim.", emoji: "🛒", color: "#f59e0b" },
  { id: "VR",     label: "Vale Ref.",  emoji: "🍽️", color: "#f97316" },
  { id: "OTHER",  label: "Outro",      emoji: "💰", color: "#6366f1" },
];

export default function AddRecurringModal({ isOpen, onClose, onSaved, existing }: Props) {
  const isEdit = !!existing;

  const [type, setType]         = useState<RType>("SALARY");
  const [name, setName]         = useState("");
  const [amount, setAmount]     = useState("");
  const [day, setDay]           = useState(5);
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (existing) {
      setType(existing.type);
      setName(existing.name);
      setAmount(String(existing.amount));
      setDay(existing.dayOfMonth);
      setStartDate(existing.startDate ? existing.startDate.substring(0, 10) : "");
    } else {
      setType("SALARY");
      setName("");
      setAmount("");
      setDay(5);
      setStartDate("");
    }
    setError("");
  }, [isOpen, existing]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        name,
        amount: Number(amount),
        dayOfMonth: day,
        type,
        category: "Renda",
        startDate: startDate || null,
      };

      const url    = isEdit ? `${API}/recurring/${existing!.id}` : `${API}/recurring`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: authH(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      onSaved();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    }
    setLoading(false);
  };

  const cfg = TYPES.find(t => t.id === type)!;

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
            {isEdit ? "Editar" : "Nova"} Renda Recorrente
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
                  padding: "12px 8px", borderRadius: 14,
                  border: `2px solid ${type === t.id ? t.color : "var(--border)"}`,
                  background: type === t.id ? `${t.color}22` : "var(--surface-2)",
                  color: type === t.id ? t.color : "var(--text-2)",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                <span style={{ fontSize: 20 }}>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Nome</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              placeholder={`Ex: ${cfg.label} Principal`} className="input-base" />
          </div>

          {/* Amount */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Valor (R$)</label>
            <input required value={amount} onChange={e => setAmount(e.target.value)}
              type="number" step="0.01" min="0.01" placeholder="0,00" className="input-base"
              style={{ fontSize: 22, fontWeight: 800, color: cfg.color }} />
          </div>

          {/* Start date */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
              Data de início <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 400 }}>(opcional — para gerenciar meses passados)</span>
            </label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="input-base" style={{ fontSize: 13 }} />
          </div>

          {/* Day slider */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
              Cai todo dia&nbsp;<span style={{ color: cfg.color, fontSize: 15, fontWeight: 800 }}>{day}</span>
            </label>
            <input type="range" min={1} max={31} value={day} onChange={e => setDay(Number(e.target.value))}
              style={{ width: "100%", accentColor: cfg.color, height: 4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
              <span>1</span><span>10</span><span>20</span><span>31</span>
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", gap: 8, padding: 12, background: "var(--danger-bg)", color: "var(--danger)", borderRadius: 12, fontSize: 13 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ height: 52, fontSize: 15, background: cfg.color }}>
            {loading ? "Salvando..." : isEdit ? "Salvar Alterações" : "Adicionar Renda"}
          </button>
        </form>
      </div>
    </div>
  );
}
