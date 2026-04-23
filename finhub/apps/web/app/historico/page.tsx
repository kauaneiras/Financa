"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Search, X, TrendingDown, TrendingUp, Repeat, BarChart2 } from "lucide-react";
import AddTransactionModal, { Transaction } from "../components/modals/AddTransactionModal";

const API = "http://127.0.0.1:4000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "");
const fmt = (n: number) => n?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00";

const TYPE_CONF: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  INCOME:       { label: "Entrada",     color: "var(--success)", icon: <TrendingUp size={14} /> },
  EXPENSE:      { label: "Despesa",     color: "var(--danger)",  icon: <TrendingDown size={14} /> },
  SUBSCRIPTION: { label: "Assinatura",  color: "var(--warning)", icon: <Repeat size={14} /> },
  INVESTMENT:   { label: "Investimento",color: "var(--invest)",  icon: <BarChart2 size={14} /> },
};

export default function HistoricoPage() {
  const router = useRouter();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTxs = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push("/auth"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { router.push("/auth"); return; }
      const data = await res.json();
      setTxs(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch { router.push("/auth"); }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchTxs(); }, [fetchTxs]);

  useEffect(() => {
    const el = document.getElementById("main-content");
    if (!el) return;
    const obs = new MutationObserver(() => fetchTxs());
    obs.observe(el, { attributes: true, attributeFilter: ["data-refresh"] });
    return () => obs.disconnect();
  }, [fetchTxs]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteTx = async (id: string) => {
    await fetch(`${API}/transactions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setTxs(prev => prev.filter(t => t.id !== id));
    setConfirmDeleteId(null);
  };

  const filtered = txs.filter(t => {
    if (filterType && t.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.category.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
    }
    return true;
  });

  // Group by date
  const groups: Record<string, Transaction[]> = {};
  filtered.forEach(t => {
    const d = t.date.substring(0, 10);
    if (!groups[d]) groups[d] = [];
    groups[d].push(t);
  });
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const totalIncome  = filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "EXPENSE" || t.type === "SUBSCRIPTION").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--surface)", padding: "52px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", marginBottom: 14 }}>Histórico</h1>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar transações..."
            style={{
              width: "100%", height: 42, paddingLeft: 42, paddingRight: search ? 40 : 14,
              background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14,
              color: "var(--text)", fontSize: 13, outline: "none",
            }} />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }} className="scrollbar-none">
          <button onClick={() => setFilterType("")}
            style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${!filterType ? "var(--accent)" : "var(--border)"}`,
              background: !filterType ? "var(--accent)" : "var(--surface-2)",
              color: !filterType ? "#fff" : "var(--text-2)",
              whiteSpace: "nowrap",
            }}>
            Todos
          </button>
          {Object.entries(TYPE_CONF).map(([id, c]) => (
            <button key={id} onClick={() => setFilterType(id)}
              style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: `1.5px solid ${filterType === id ? c.color : "var(--border)"}`,
                background: filterType === id ? `${c.color}` : "var(--surface-2)",
                color: filterType === id ? "#fff" : "var(--text-2)",
                whiteSpace: "nowrap",
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        {(totalIncome > 0 || totalExpense > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            <div style={{ padding: "10px 12px", background: "var(--success-bg)", borderRadius: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={14} color="var(--success)" />
              <div>
                <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600 }}>Entradas</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: "var(--success)" }}>{fmt(totalIncome)}</p>
              </div>
            </div>
            <div style={{ padding: "10px 12px", background: "var(--danger-bg)", borderRadius: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingDown size={14} color="var(--danger)" />
              <div>
                <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600 }}>Saídas</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: "var(--danger)" }}>{fmt(totalExpense)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ padding: "16px 16px 100px" }}>
        {loading && <p style={{ textAlign: "center", color: "var(--text-3)", padding: 40 }}>Carregando...</p>}
        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-3)", padding: "60px 20px", fontSize: 14 }}>
            Nenhuma transação encontrada.
          </p>
        )}

        {sortedDates.map(date => (
          <div key={date} style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 8, letterSpacing: 0.5 }}>
              {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {groups[date].map(tx => {
                const conf = TYPE_CONF[tx.type] || TYPE_CONF.EXPENSE;
                return (
                  <div key={tx.id} style={{
                    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                      background: `${conf.color}18`, color: conf.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {conf.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {tx.description || tx.category}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {tx.category}
                        {tx.installments && tx.installments > 1 ? ` · ${tx.installmentCurrent}/${tx.installments}×` : ""}
                        {tx.isRecurring ? " · Recorrente" : ""}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", marginRight: 8 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: tx.type === "INCOME" ? "var(--success)" : "var(--danger)" }}>
                        {tx.type === "INCOME" ? "+" : "-"}{fmt(tx.amount)}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setEditing(tx)}
                        style={{ background: "var(--surface-2)", border: "none", borderRadius: 10, padding: 7, cursor: "pointer", color: "var(--text-2)" }}>
                        <Pencil size={13} />
                      </button>
                      {confirmDeleteId !== tx.id ? (
                        <button onClick={() => setConfirmDeleteId(tx.id)}
                          style={{ background: "var(--danger-bg)", border: "none", borderRadius: 10, padding: 7, cursor: "pointer", color: "var(--danger)" }}>
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => deleteTx(tx.id)}
                            style={{ background: "var(--danger)", border: "none", borderRadius: 10, padding: "4px 10px", cursor: "pointer", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                            Sim
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)}
                            style={{ background: "var(--surface-2)", border: "none", borderRadius: 10, padding: "4px 10px", cursor: "pointer", color: "var(--text-2)", fontSize: 11, fontWeight: 600 }}>
                            Não
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <AddTransactionModal
        isOpen={!!editing}
        editing={editing as any}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); fetchTxs(); }}
      />
    </div>
  );
}
