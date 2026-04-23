"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Palette, Accessibility, Info, LogOut, Moon, Sun, Zap, Waves, Leaf, Heart, Skull, Trees, Monitor, Crown, Flame } from "lucide-react";
import { useTheme, THEMES, ThemeName } from "../components/ThemeProvider";

const THEME_ICONS: Record<ThemeName, React.ReactNode> = {
  escuro:    <Moon size={16} />,
  claro:     <Sun size={16} />,
  amoled:    <Zap size={16} />,
  oceano:    <Waves size={16} />,
  floresta:  <Leaf size={16} />,
  barbie:    <Heart size={16} />,
  lavigne:   <Skull size={16} />,
  bamboo:    <Trees size={16} />,
  neon:      <Monitor size={16} />,
  gold:      <Crown size={16} />,
  dangerous: <Flame size={16} />,
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/auth");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--surface)", padding: "52px 16px 20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>Configurações</h1>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>
        {/* Theme section */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 4 }}>
            Aparência
          </p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Palette size={18} color="var(--accent)" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Tema</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxHeight: 320, overflowY: "auto", paddingRight: 4 }} className="scrollbar-none">
                {THEMES.map(t => {
                  const active = theme === t.id;
                  return (
                    <button key={t.id} onClick={() => setTheme(t.id)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: "12px 4px", borderRadius: 16, cursor: "pointer",
                        border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "var(--accent-bg)" : "var(--surface-2)",
                        transition: "all 0.15s",
                      }}>
                      {/* Theme preview dot */}
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: t.bg,
                        border: `2px solid ${t.accent}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: t.accent,
                      }}>
                        {THEME_ICONS[t.id]}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: active ? 700 : 500,
                        color: active ? "var(--accent)" : "var(--text-3)",
                      }}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 4 }}>
            Preferências
          </p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
            {[
              { icon: <Accessibility size={18} />, label: "Acessibilidade", color: "var(--accent)" },
              { icon: <Info size={18} />, label: "Sobre o Financa", color: "var(--text-2)" },
            ].map((item, i) => (
              <button key={item.label}
                style={{
                  display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 18px",
                  background: "transparent", border: "none", cursor: "pointer",
                  borderTop: i > 0 ? "1px solid var(--border)" : "none",
                }}>
                <div style={{ color: item.color }}>{item.icon}</div>
                <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{item.label}</span>
                <ChevronRight size={16} color="var(--text-3)" />
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 4 }}>
            Conta
          </p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
            <button onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 18px",
                background: "transparent", border: "none", cursor: "pointer",
              }}>
              <LogOut size={18} color="var(--danger)" />
              <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, color: "var(--danger)" }}>Sair da conta</span>
              <ChevronRight size={16} color="var(--text-3)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
