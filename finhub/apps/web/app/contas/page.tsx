"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet, UtensilsCrossed, Coffee, Repeat2, Pencil, Trash2, PauseCircle, PlayCircle, Plus, AlertTriangle, X } from "lucide-react";
import AddAccountModal from "../components/modals/AddAccountModal";
import AddRecurringModal, { RecurringIncome } from "../components/modals/AddRecurringModal";

const API = "http://127.0.0.1:4000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "");
const fmt = (n: number) => n?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00";
const authH = (contentType = false): HeadersInit =>
  contentType
    ? { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }
    : { Authorization: `Bearer ${getToken()}` };

interface Account {
  id: string; name: string; bankName: string;
  type: "CREDIT_CARD" | "DEBIT" | "CASH" | "PIX" | "VA" | "VR";
  balance: number; closingDay?: number | null; dueDay?: number | null;
}

const ACC_ICON: Record<string, React.ReactNode> = {
  PIX: <Wallet size={18} />, CREDIT_CARD: <CreditCard size={18} />, DEBIT: <Wallet size={18} />,
  CASH: <Wallet size={18} />, VA: <UtensilsCrossed size={18} />, VR: <Coffee size={18} />,
};
const ACC_COLOR: Record<string, string> = {
  PIX: "#6366f1", CREDIT_CARD: "#7c3aed", DEBIT: "#0284c7",
  CASH: "#10b981", VA: "#f59e0b", VR: "#f97316",
};
const REC_COLOR: Record<string, string> = {
  SALARY: "#10b981", VA: "#f59e0b", VR: "#f97316", OTHER: "#6366f1",
};

export default function ContasPage() {
  const router = useRouter();
  const [accounts,         setAccounts]          = useState<Account[]>([]);
  const [recurrings,       setRecurrings]         = useState<RecurringIncome[]>([]);
  const [tab,              setTab]                = useState<"contas" | "rendas">("contas");
  const [accModal,         setAccModal]           = useState(false);
  const [recModal,         setRecModal]           = useState(false);
  const [editingRecurring, setEditingRecurring]   = useState<RecurringIncome | null>(null);
  const [loading,          setLoading]            = useState(true);
  const [deleteError,      setDeleteError]        = useState("");
  const [confirmDeleteId,  setConfirmDeleteId]    = useState<string | null>(null);
  const [confirmDeleteAccId, setConfirmDeleteAccId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push("/auth"); return; }
    setLoading(true);
    try {
      const [aRes, rRes] = await Promise.all([
        fetch(`${API}/accounts`,  { headers: authH() }),
        fetch(`${API}/recurring`, { headers: authH() }),
      ]);
      if (aRes.ok)  setAccounts(await aRes.json());
      if (rRes.ok)  setRecurrings(await rRes.json());
    } catch { router.push("/auth"); }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const el = document.getElementById("main-content");
    if (!el) return;
    const obs = new MutationObserver(() => fetchAll());
    obs.observe(el, { attributes: true, attributeFilter: ["data-refresh"] });
    return () => obs.disconnect();
  }, [fetchAll]);

  const deleteAccount = async (id: string) => {
    try {
      await fetch(`${API}/accounts/${id}`, { method: "DELETE", headers: authH() });
      setAccounts(prev => prev.filter(a => a.id !== id));
      setConfirmDeleteAccId(null);
    } catch { alert("Erro ao remover conta"); }
  };

  const toggleRecurring = async (r: RecurringIncome) => {
    try {
      const res = await fetch(`${API}/recurring/${r.id}`, {
        method: "PUT",
        headers: authH(true),
        body: JSON.stringify({ active: !r.active }),
      });
      if (res.ok) {
        const updated: RecurringIncome = await res.json();
        setRecurrings(prev => prev.map(x => x.id === r.id ? updated : x));
      }
    } catch { alert("Erro ao atualizar"); }
  };

  const deleteRecurring = async (id: string) => {
    setDeleteError("");
    try {
      const res = await fetch(`${API}/recurring/${id}`, {
        method: "DELETE",
        headers: authH(),
      });
      if (res.ok || res.status === 204) {
        setRecurrings(prev => prev.filter(r => r.id !== id));
        setConfirmDeleteId(null);
      } else {
        const txt = await res.text();
        setDeleteError(`Erro ${res.status}: ${txt}`);
      }
    } catch (err: any) {
      setDeleteError(err.message || "Erro de rede ao deletar");
    }
  };

  const handleRecurringModalClose = () => {
    setRecModal(false);
    setEditingRecurring(null);
  };

  const handleRecurringSaved = () => {
    handleRecurringModalClose();
    fetchAll();
  };

  // Balance calculation: accounts + active salary/other recurrings
  const accountBalance = accounts.filter(a => !["CREDIT_CARD","VA","VR"].includes(a.type)).reduce((s, a) => s + a.balance, 0);
  const salaryTotal    = recurrings.filter(r => r.active && (r.type === "SALARY" || r.type === "OTHER")).reduce((s, r) => s + r.amount, 0);
  const totalBalance   = accountBalance + salaryTotal;
  const vaBalance      = accounts.filter(a => a.type === "VA").reduce((s, a) => s + a.balance, 0)
                       + recurrings.filter(r => r.active && r.type === "VA").reduce((s, r) => s + r.amount, 0);
  const vrBalance      = accounts.filter(a => a.type === "VR").reduce((s, a) => s + a.balance, 0)
                       + recurrings.filter(r => r.active && r.type === "VR").reduce((s, r) => s + r.amount, 0);
  const monthlyIncome  = recurrings.filter(r => r.active).reduce((s, r) => s + r.amount, 0);

  const fmtDate = (d: string | null) => {
    if (!d) return "";
    try {
      const date = new Date(d.length === 10 ? d + "T12:00:00" : d);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    } catch { return ""; }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ background: "var(--surface)", padding: "52px 16px 0", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", marginBottom: 16 }}>Contas &amp; Rendas</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Saldo", value: totalBalance, color: "var(--success)" },
            { label: "VA",    value: vaBalance,    color: "#f59e0b" },
            { label: "VR",    value: vrBalance,    color: "#f97316" },
          ].map(c => (
            <div key={c.label} style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: 14, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: 0.8 }}>{c.label}</p>
              <p style={{ fontSize: 15, fontWeight: 800, color: c.color, marginTop: 3 }}>{fmt(c.value)}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 0, borderRadius: 12, background: "var(--surface-2)", padding: 3 }}>
          {(["contas", "rendas"] as const).map(id => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                flex: 1, padding: "9px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700,
                background: tab === id ? "var(--accent)" : "transparent",
                color: tab === id ? "#fff" : "var(--text-2)", transition: "all 0.15s",
              }}>
              {id === "contas" ? "Contas e Cartões" : "Rendas Recorrentes"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>
        {deleteError && (
          <div style={{ background: "var(--danger-bg)", color: "var(--danger)", borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} /> {deleteError}
            <button onClick={() => setDeleteError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><X size={14} /></button>
          </div>
        )}

        <button onClick={() => tab === "contas" ? setAccModal(true) : setRecModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "13px 16px",
            background: "var(--surface)", border: "1.5px dashed var(--accent)", borderRadius: 16,
            cursor: "pointer", color: "var(--accent)", fontWeight: 700, fontSize: 14, marginBottom: 14,
            justifyContent: "center",
          }}>
          <Plus size={16} /> {tab === "contas" ? "Adicionar conta ou cartão" : "Adicionar renda recorrente"}
        </button>

        {loading && <p style={{ textAlign: "center", color: "var(--text-3)", padding: 40 }}>Carregando...</p>}

        {tab === "contas" && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {accounts.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-3)", padding: "40px 0", fontSize: 14 }}>Nenhuma conta cadastrada.</p>
            )}
            {accounts.map(acc => {
              const color = ACC_COLOR[acc.type] || "#6366f1";
              const isConfirming = confirmDeleteAccId === acc.id;
              return (
                <div key={acc.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}22`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {ACC_ICON[acc.type]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{acc.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-3)" }}>{acc.bankName} · {acc.type}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {acc.type !== "CREDIT_CARD" && (
                        <p style={{ fontSize: 17, fontWeight: 800, color }}>{fmt(acc.balance)}</p>
                      )}
                      {acc.type === "CREDIT_CARD" && acc.closingDay && (
                        <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>
                          Fecha dia {acc.closingDay}<br />Vence dia {acc.dueDay}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    {!isConfirming ? (
                      <button onClick={() => setConfirmDeleteAccId(acc.id)}
                        style={{ background: "var(--danger-bg)", border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: "var(--danger)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                        <Trash2 size={13} /> Remover
                      </button>
                    ) : (
                      <>
                        <button onClick={() => deleteAccount(acc.id)}
                          style={{ background: "var(--danger)", border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                          Confirmar
                        </button>
                        <button onClick={() => setConfirmDeleteAccId(null)}
                          style={{ background: "var(--surface-2)", border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: "var(--text-2)", fontSize: 12, fontWeight: 600 }}>
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "rendas" && !loading && (
          <div>
            <div style={{
              background: "var(--surface)", border: "1.5px solid rgba(16,185,129,0.3)",
              borderRadius: 18, padding: "14px 16px", marginBottom: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 3 }}>Entrada mensal esperada</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: "var(--success)" }}>{fmt(monthlyIncome)}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Repeat2 size={18} color="var(--success)" />
                <span style={{ fontSize: 13, color: "var(--text-3)" }}>{recurrings.filter(r => r.active).length} ativas</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recurrings.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--text-3)", padding: "40px 0", fontSize: 14 }}>
                  Nenhuma renda recorrente cadastrada.
                </p>
              )}
              {recurrings.map(r => {
                const color = REC_COLOR[r.type] || "#6366f1";
                const isConfirming = confirmDeleteId === r.id;
                const dateStr = fmtDate(r.startDate);
                return (
                  <div key={r.id} style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 18, padding: "14px 16px",
                    opacity: r.active ? 1 : 0.55,
                    transition: "opacity 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}22`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
                        {r.type === "SALARY" ? "💵" : r.type === "VA" ? "🛒" : r.type === "VR" ? "🍽️" : "💰"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{r.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                          Dia {r.dayOfMonth}
                          {dateStr ? ` · desde ${dateStr}` : ""}
                          {" · "}{r.active ? "Ativa" : "Pausada"}
                        </p>
                      </div>
                      <p style={{ fontSize: 17, fontWeight: 800, color, marginRight: 4 }}>{fmt(r.amount)}</p>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => { setEditingRecurring(r); setRecModal(true); }}
                          style={{ background: "var(--surface-2)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "var(--text-2)" }}
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => toggleRecurring(r)}
                          style={{ background: r.active ? "var(--warning-bg)" : "var(--success-bg)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: r.active ? "var(--warning)" : "var(--success)" }}
                          title={r.active ? "Pausar" : "Retomar"}
                        >
                          {r.active ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                        </button>
                        <button onClick={() => setConfirmDeleteId(r.id)}
                          style={{ background: "var(--danger-bg)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "var(--danger)" }}
                          title="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Inline delete confirmation */}
                    {isConfirming && (
                      <div style={{
                        marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)",
                        display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end",
                      }}>
                        <span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600, marginRight: "auto" }}>
                          Tem certeza que deseja remover?
                        </span>
                        <button onClick={() => deleteRecurring(r.id)}
                          style={{ background: "var(--danger)", border: "none", borderRadius: 10, padding: "6px 14px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                          Confirmar
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          style={{ background: "var(--surface-2)", border: "none", borderRadius: 10, padding: "6px 14px", cursor: "pointer", color: "var(--text-2)", fontSize: 12, fontWeight: 600 }}>
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AddAccountModal  isOpen={accModal} onClose={() => setAccModal(false)} onSaved={() => { setAccModal(false); fetchAll(); }} />
      <AddRecurringModal
        isOpen={recModal}
        existing={editingRecurring}
        onClose={handleRecurringModalClose}
        onSaved={handleRecurringSaved}
      />
    </div>
  );
}
