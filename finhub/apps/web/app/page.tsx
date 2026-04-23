"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Check, Clock, CreditCard,
  TrendingDown, TrendingUp, Eye, EyeOff, ArrowRight,
  CalendarDays,
} from "lucide-react";

const API = "http://127.0.0.1:4000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "");
const fmt = (n: number) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtCompact = (n: number) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" as any });
const isoDate = (d: Date) => d.toISOString().substring(0, 10);

type Preset = "last30" | "thisMonth" | "lastMonth" | "custom";

function periodDates(preset: Preset, cf = "", ct = "") {
  const today = new Date();
  if (preset === "last30") {
    const f = new Date(today); f.setDate(f.getDate() - 29);
    return { from: isoDate(f), to: isoDate(today) };
  }
  if (preset === "thisMonth")
    return { from: isoDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: isoDate(today) };
  if (preset === "lastMonth") {
    const f = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const t = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: isoDate(f), to: isoDate(t) };
  }
  return {
    from: cf || isoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    to:   ct || isoDate(today),
  };
}

function addMonths(d: Date, n: number) {
  const r = new Date(d); r.setMonth(r.getMonth() + n); return r;
}

const PRESETS: { id: Preset; label: string }[] = [
  { id: "last30",    label: "30 dias"   },
  { id: "thisMonth", label: "Mês atual" },
  { id: "lastMonth", label: "Mês ant."  },
  { id: "custom",    label: "Custom"    },
];

export default function HomePage() {
  const router = useRouter();
  const [data,          setData]     = useState<any>(null);
  const [preset,        setPreset]   = useState<Preset>("last30");
  const [customFrom,    setCF]       = useState("");
  const [customTo,      setCT]       = useState("");
  const [balanceHidden, setHide]     = useState(false);
  const [vaExpanded,    setVaExp]    = useState(false);
  const [loading,       setLoading]  = useState(true);

  const { from, to } = periodDates(preset, customFrom, customTo);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push("/auth"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/dashboard?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.push("/auth"); return; }
      setData(await res.json());
    } catch { router.push("/auth"); }
    setLoading(false);
  }, [from, to, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Refresh when FAB adds something
  useEffect(() => {
    const el = document.getElementById("main-content");
    if (!el) return;
    const obs = new MutationObserver(() => fetchData());
    obs.observe(el, { attributes: true, attributeFilter: ["data-refresh"] });
    return () => obs.disconnect();
  }, [fetchData]);

  const shiftPeriod = (dir: -1 | 1) => {
    const f = new Date(from + "T00:00:00");
    const t = new Date(to   + "T00:00:00");
    setPreset("custom");
    setCF(isoDate(addMonths(f, dir)));
    setCT(isoDate(addMonths(t, dir)));
  };

  const ps       = data?.periodSummary;
  const forecast = data?.forecast ?? [];

  /* ──────────────────────── LOADING ──────────────────────── */
  if (!data && loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <p style={{ color: "var(--text-3)", fontSize: 14 }}>Carregando…</p>
    </div>
  );

  const balance     = ps ? ps.confirmedIncome - ps.totalExpense : 0;
  const vaBalance   = ps?.voucherBalances?.filter((v: any) => v.type === "VA").reduce((s: number, v: any) => s + v.balance, 0) ?? 0;
  const vrBalance   = ps?.voucherBalances?.filter((v: any) => v.type === "VR").reduce((s: number, v: any) => s + v.balance, 0) ?? 0;
  const hasVouchers = vaBalance > 0 || vrBalance > 0;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 80 }}>

      {/* ══════════════════ HERO ══════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
        padding: "52px 20px 100px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 2 }}>Financa</p>
            <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>Seu Painel</h1>
          </div>
          <button onClick={() => setHide(h => !h)}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 12, padding: 10, cursor: "pointer", color: "#fff" }}>
            {balanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Big balance */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
            SALDO DO PERÍODO
          </p>
          <p style={{ color: "#fff", fontSize: 38, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>
            {balanceHidden ? "••••••" : fmt(balance)}
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 6 }}>
            {from} → {to}
          </p>
        </div>

        {/* VA / VR expand */}
        {hasVouchers && (
          <button onClick={() => setVaExp(v => !v)}
            style={{
              width: "100%", marginTop: 14, padding: "9px 16px",
              background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 16,
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {vaExpanded ? "Ocultar saldos de vale" : "Ver saldo VA / VR"}
            <ChevronLeft size={13} style={{ transform: vaExpanded ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.2s" }} />
          </button>
        )}
        {vaExpanded && hasVouchers && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            {vaBalance > 0 && (
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 14px" }}>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>VALE ALIMENT.</p>
                <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{balanceHidden ? "••••" : fmt(vaBalance)}</p>
              </div>
            )}
            {vrBalance > 0 && (
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 14px" }}>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>VALE REFEIÇÃO</p>
                <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{balanceHidden ? "••••" : fmt(vrBalance)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════ STAT CARDS (overlap hero) ══════════════════ */}
      <div style={{ margin: "-60px 16px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, position: "relative", zIndex: 10 }}>
        {[
          { label: "Entrado",  value: ps?.confirmedIncome  ?? 0, color: "var(--success)", icon: <TrendingUp  size={13} /> },
          { label: "Saídas",   value: ps?.totalExpense     ?? 0, color: "var(--danger)",  icon: <TrendingDown size={13} /> },
          { label: "Investido",value: ps?.totalInvestments ?? 0, color: "var(--invest)", icon: <TrendingUp  size={13} /> },
        ].map(c => (
          <div key={c.label} style={{
            background: "var(--surface)", borderRadius: 16, padding: "12px 10px",
            border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: c.color, marginBottom: 8 }}>
              {c.icon}
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{c.label.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
              {balanceHidden ? "••••" : fmtCompact(c.value)}
            </p>
          </div>
        ))}
      </div>

      {/* ══════════════════ BODY ══════════════════ */}
      <div style={{ padding: "20px 16px 0" }}>

        {/* ── Period Selector ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <button onClick={() => shiftPeriod(-1)}
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 8px", cursor: "pointer", color: "var(--text-2)" }}>
              <ChevronLeft size={14} />
            </button>
            <div style={{ display: "flex", gap: 6, flex: 1, overflowX: "auto" }} className="scrollbar-none">
              {PRESETS.map(p => (
                <button key={p.id} onClick={() => setPreset(p.id)}
                  style={{
                    whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: `1.5px solid ${preset === p.id ? "var(--accent)" : "var(--border)"}`,
                    background: preset === p.id ? "var(--accent)" : "var(--surface-2)",
                    color: preset === p.id ? "#fff" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={() => shiftPeriod(1)}
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 8px", cursor: "pointer", color: "var(--text-2)" }}>
              <ChevronRight size={14} />
            </button>
          </div>
          {preset === "custom" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input type="date" value={customFrom} onChange={e => setCF(e.target.value)} className="input-base" style={{ fontSize: 12, height: 40 }} />
              <input type="date" value={customTo}   onChange={e => setCT(e.target.value)} className="input-base" style={{ fontSize: 12, height: 40 }} />
            </div>
          )}
        </div>

        {/* ── Health Bars ── */}
        {ps && (ps.projectedIncome > 0 || ps.totalExpense > 0) && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)", marginBottom: 14 }}>Saúde financeira</p>
            {[
              { label: "Entrado",   v: ps.confirmedIncome, total: Math.max(ps.projectedIncome, ps.totalExpense, 1), color: "var(--success)" },
              { label: "Projetado", v: ps.projectedIncome, total: Math.max(ps.projectedIncome, ps.totalExpense, 1), color: "var(--accent)", faded: true },
              { label: "Gastos",    v: ps.totalExpense,    total: Math.max(ps.projectedIncome, ps.totalExpense, 1), color: "var(--danger)" },
            ].map(bar => (
              <div key={bar.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-2)", fontWeight: 600 }}>{bar.label}</span>
                  <span style={{ color: bar.color, fontWeight: 700, opacity: bar.faded ? 0.7 : 1 }}>{fmt(bar.v)}</span>
                </div>
                <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99, background: bar.color,
                    opacity: bar.faded ? 0.45 : 1,
                    width: `${Math.min((bar.v / bar.total) * 100, 100)}%`,
                    transition: "width 0.6s cubic-bezier(.22,1,.36,1)",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Recurring Incomes ── */}
        {ps?.recurringIncomes?.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>Rendas do período</span>
              <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 700 }}>{fmt(ps.projectedIncome)} esperado</span>
            </div>
            {ps.recurringIncomes.map((ri: any) => (
              <div key={ri.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderTop: "1px solid var(--border)" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: ri.confirmed ? "var(--success-bg)" : "var(--warning-bg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {ri.confirmed
                    ? <Check  size={14} color="var(--success)" />
                    : <Clock  size={14} color="var(--warning)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{ri.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>Dia {ri.dayOfMonth} · {ri.type}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--success)" }}>{fmt(ri.amount)}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: ri.confirmed ? "var(--success)" : "var(--warning)" }}>
                    {ri.confirmed ? (ri.dayPassed ? "Recebido ✓" : "Recebido (manual)") : "Pendente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Installments this period ── */}
        {ps?.installments?.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>Parcelas este período</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>
                {fmt(ps.installments.reduce((s: number, i: any) => s + i.amount, 0))}
              </span>
            </div>
            {ps.installments.map((inst: any) => (
              <div key={inst.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderTop: "1px solid var(--border)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CreditCard size={13} color="var(--accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{inst.description}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>{inst.category} · {inst.installmentCurrent}/{inst.installments}×</p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)" }}>-{fmt(inst.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Category breakdown ── */}
        {ps?.categoryBreakdown?.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)", marginBottom: 14 }}>Gastos por categoria</p>
            {ps.categoryBreakdown.slice(0, 5).map((c: any, i: number) => {
              const pct = Math.max((c.total / ps.categoryBreakdown[0].total) * 100, 4);
              return (
                <div key={c.category} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--text)" }}>{c.category}</span>
                    <span style={{ color: "var(--text-2)", fontWeight: 600 }}>{fmt(c.total)}</span>
                  </div>
                  <div style={{ height: 4, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: `hsl(${260 - i * 22}, 68%, 62%)`, width: `${pct}%`, transition: "width 0.6s cubic-bezier(.22,1,.36,1)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════ PRÓXIMOS MESES ══════════════════ */}
        {forecast.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CalendarDays size={16} color="var(--accent)" />
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>Próximos meses (projeção)</p>
            </div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }} className="scrollbar-none">
              {forecast.map((m: any) => {
                const pos = m.projectedBalance >= 0;
                return (
                  <div key={m.month} style={{
                    flexShrink: 0,
                    minWidth: 150,
                    background: "var(--surface)",
                    border: `1px solid ${pos ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                    borderRadius: 18,
                    padding: 14,
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 10 }}>{m.label}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--text-3)" }}>Entrada</span>
                        <span style={{ color: "var(--success)", fontWeight: 700 }}>{fmtCompact(m.projectedIncome)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--text-3)" }}>Saídas</span>
                        <span style={{ color: "var(--danger)", fontWeight: 700 }}>{fmtCompact(m.projectedExpense)}</span>
                      </div>
                      {m.installmentsTotal > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span style={{ color: "var(--text-3)" }}>↳ Parcelas</span>
                          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{fmtCompact(m.installmentsTotal)}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "var(--text-2)", fontWeight: 600 }}>Saldo</span>
                        <span style={{ color: pos ? "var(--success)" : "var(--danger)", fontWeight: 800 }}>
                          {pos ? "+" : ""}{fmtCompact(m.projectedBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Link to history ── */}
        <button onClick={() => router.push("/historico")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", padding: "14px 18px",
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20,
            cursor: "pointer", color: "var(--text)", marginBottom: 16,
          }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Ver histórico completo</span>
          <ArrowRight size={16} color="var(--text-3)" />
        </button>
      </div>
    </div>
  );
}
