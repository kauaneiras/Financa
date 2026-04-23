"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

const API = "http://127.0.0.1:4000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type AccType = "PIX" | "CREDIT_CARD" | "DEBIT" | "CASH" | "VA" | "VR";

const ACC_TYPES: { id: AccType; label: string; emoji: string; color: string }[] = [
  { id: "PIX",         label: "PIX / Poupança",  emoji: "📱", color: "#6366f1" },
  { id: "CREDIT_CARD", label: "Cartão Crédito",  emoji: "💳", color: "#7c3aed" },
  { id: "DEBIT",       label: "Cartão Débito",   emoji: "💳", color: "#0284c7" },
  { id: "CASH",        label: "Dinheiro",        emoji: "💵", color: "#10b981" },
  { id: "VA",          label: "Vale Aliment.",    emoji: "🛒", color: "#f59e0b" },
  { id: "VR",          label: "Vale Refeição",   emoji: "🍽️", color: "#f97316" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddAccountModal({ isOpen, onClose, onSaved }: Props) {
  const [type, setType]       = useState<AccType>("PIX");
  const [name, setName]       = useState("");
  const [bankName, setBankName] = useState("");
  const [balance, setBalance] = useState("");
  const [closingDay, setCDay] = useState("");
  const [dueDay, setDDay]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setType("PIX"); setName(""); setBankName(""); setBalance("");
    setCDay(""); setDDay(""); setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const body: any = { name, bankName: bankName || "Meu Banco", type, balance: Number(balance) || 0 };
      if (type === "CREDIT_CARD") {
        body.closingDay = Number(closingDay) || null;
        body.dueDay     = Number(dueDay)     || null;
      }
      const res = await fetch(`${API}/accounts`, { method: "POST", headers: authH(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      onSaved();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    }
    setLoading(false);
  };

  const cfg = ACC_TYPES.find(t => t.id === type)!;

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
        <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Nova Conta / Cartão</h2>
          <button onClick={onClose} style={{ background: "var(--surface-2)", border: "none", borderRadius: 12, padding: 8, cursor: "pointer", color: "var(--text-2)" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", maxHeight: "80vh" }}>
          {/* Type grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {ACC_TYPES.map(t => (
              <button type="button" key={t.id} onClick={() => setType(t.id)}
                style={{
                  padding: "12px 4px", borderRadius: 14,
                  border: `2px solid ${type === t.id ? t.color : "var(--border)"}`,
                  background: type === t.id ? `${t.color}22` : "var(--surface-2)",
                  color: type === t.id ? t.color : "var(--text-2)",
                  fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Nome</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              placeholder={`Ex: ${cfg.label} Principal`} className="input-base" />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Banco / Instituição</label>
            <input value={bankName} onChange={e => setBankName(e.target.value)}
              placeholder="Ex: Nubank, Itaú..." className="input-base" />
          </div>

          {type !== "CREDIT_CARD" && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Saldo atual (R$)</label>
              <input value={balance} onChange={e => setBalance(e.target.value)}
                type="number" step="0.01" placeholder="0,00" className="input-base"
                style={{ fontSize: 22, fontWeight: 800, color: cfg.color }} />
            </div>
          )}

          {type === "CREDIT_CARD" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Dia fechamento</label>
                <input value={closingDay} onChange={e => setCDay(e.target.value)}
                  type="number" min="1" max="31" placeholder="10" className="input-base" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Dia vencimento</label>
                <input value={dueDay} onChange={e => setDDay(e.target.value)}
                  type="number" min="1" max="31" placeholder="20" className="input-base" />
              </div>
            </div>
          )}

          {error && (
            <div style={{ display: "flex", gap: 8, padding: 12, background: "var(--danger-bg)", color: "var(--danger)", borderRadius: 12, fontSize: 13 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ height: 52, fontSize: 15, background: cfg.color }}>
            {loading ? "Salvando..." : "Adicionar Conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
