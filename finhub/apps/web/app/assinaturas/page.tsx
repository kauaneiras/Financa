"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Rss, ToggleLeft, ToggleRight } from "lucide-react";
import AddTransactionModal from "../components/modals/AddTransactionModal";

const API = "http://127.0.0.1:4000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "");
const fmt = (n: number) => n?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00";

export default function AssinaturasPage() {
  const router = useRouter();
  const [subs, setSubs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubs = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push("/auth"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { router.push("/auth"); return; }
      const data = await res.json();
      setSubs(data.filter((t: any) => t.type === "SUBSCRIPTION").sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch { router.push("/auth"); }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  useEffect(() => {
    const el = document.getElementById("main-content");
    if (!el) return;
    const obs = new MutationObserver(() => fetchSubs());
    obs.observe(el, { attributes: true, attributeFilter: ["data-refresh"] });
    return () => obs.disconnect();
  }, [fetchSubs]);

  const deleteSub = async (id: string) => {
    if (!confirm("Remover esta assinatura?")) return;
    await fetch(`${API}/transactions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setSubs(prev => prev.filter(s => s.id !== id));
  };

  const totalCost = subs.reduce((s, t) => s + t.amount, 0);
  const recurringTotal = subs.filter(s => s.isRecurring).reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ background: "var(--surface)", padding: "52px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", marginBottom: 14 }}>Assinaturas</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ padding: "12px 14px", background: "var(--warning-bg)", borderRadius: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: 0.8, marginBottom: 4 }}>TOTAL</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: "var(--warning)" }}>{fmt(totalCost)}</p>
          </div>
          <div style={{ padding: "12px 14px", background: "var(--accent-bg)", borderRadius: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: 0.8, marginBottom: 4 }}>RECORRENTE</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>{fmt(recurringTotal)}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>
        {loading && <p style={{ textAlign: "center", color: "var(--text-3)", padding: 40 }}>Carregando...</p>}
        {!loading && subs.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-3)", padding: "60px 20px", fontSize: 14 }}>
            Nenhuma assinatura encontrada. Use o botão + para adicionar.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subs.map(sub => (
            <div key={sub.id} style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18,
              display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: "var(--warning-bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Rss size={18} color="var(--warning)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{sub.description || sub.category}</p>
                <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {sub.category}
                  {sub.isRecurring && (
                    <span style={{ marginLeft: 6, color: "var(--accent)", fontWeight: 600 }}>
                      · Recorrente
                    </span>
                  )}
                </p>
              </div>
              <p style={{ fontSize: 17, fontWeight: 800, color: "var(--warning)", marginRight: 8 }}>{fmt(sub.amount)}</p>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditing(sub)}
                  style={{ background: "var(--surface-2)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "var(--text-2)" }}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => deleteSub(sub.id)}
                  style={{ background: "var(--danger-bg)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "var(--danger)" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddTransactionModal
        isOpen={!!editing}
        editing={editing as any}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); fetchSubs(); }}
      />
    </div>
  );
}
