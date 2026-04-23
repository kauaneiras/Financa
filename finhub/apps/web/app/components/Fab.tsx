"use client";

import { useState, useEffect } from "react";
import { Plus, X, ArrowDownCircle, CreditCard, Repeat2, TrendingUp, ReceiptText } from "lucide-react";

export type FabAction = "expense" | "income" | "account" | "recurring" | "subscription" | "investment";

interface Props { onAction: (action: FabAction) => void; }

const ITEMS: { action: FabAction; label: string; icon: React.ReactNode; color: string }[] = [
  { action: "expense",      label: "Lançamento",   icon: <ArrowDownCircle size={18} />, color: "#ef4444" },
  { action: "income",       label: "Entrada",      icon: <TrendingUp size={18} />,      color: "#10b981" },
  { action: "investment",   label: "Investimento", icon: <TrendingUp size={18} />,      color: "#6366f1" },
  { action: "subscription", label: "Assinatura",   icon: <ReceiptText size={18} />,     color: "#f59e0b" },
  { action: "recurring",    label: "Salário / Vale",icon: <Repeat2 size={18} />,        color: "#22c55e" },
  { action: "account",      label: "Cartão / Conta",icon: <CreditCard size={18} />,     color: "#7c3aed" },
];

export default function Fab({ onAction }: Props) {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          }}
          className="animate-fade-in"
        />
      )}

      {/* Speed dial items */}
      <div style={{
        position: "fixed", bottom: 148, right: 16,
        display: "flex", flexDirection: "column-reverse", alignItems: "flex-end", gap: 10,
        zIndex: 91, pointerEvents: open ? "auto" : "none",
      }}>
        {ITEMS.map((item, i) => (
          <div key={item.action}
            onClick={() => { onAction(item.action); setOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0) scale(1)" : "translateY(10px) scale(0.8)",
              transition: `all 0.2s cubic-bezier(.22,1,.36,1) ${open ? i * 0.04 : 0}s`,
            }}
          >
            <span style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "7px 14px", fontSize: 13, fontWeight: 600,
              color: "var(--text)", whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}>
              {item.label}
            </span>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: item.color, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 16px ${item.color}40`,
            }}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main FAB button */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 84, right: 16,
          width: 56, height: 56, borderRadius: 18,
          background: "var(--accent)", color: "#fff", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 92,
          boxShadow: "0 6px 24px rgba(99,102,241,0.4)",
          transform: `rotate(${open ? 45 : 0}deg)`,
          transition: "transform 0.25s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>
    </>
  );
}
