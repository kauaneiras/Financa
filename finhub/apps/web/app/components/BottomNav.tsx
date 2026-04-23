"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, CreditCard, Rss, Settings } from "lucide-react";

const tabs = [
  { href: "/",             icon: Home,       label: "Início"       },
  { href: "/historico",    icon: Clock,      label: "Histórico"    },
  { href: "/contas",       icon: CreditCard, label: "Contas"       },
  { href: "/assinaturas",  icon: Rss,        label: "Assinaturas"  },
  { href: "/configuracoes",icon: Settings,   label: "Config"       },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480, height: 64,
      background: "var(--nav-bg)", backdropFilter: "blur(16px)",
      borderTop: "1px solid var(--nav-border)",
      display: "flex", alignItems: "center", justifyContent: "space-around",
      zIndex: 100, padding: "0 4px",
    }}>
      {tabs.map(tab => {
        const active = path === tab.href || (tab.href !== "/" && path.startsWith(tab.href));
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={tab.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            textDecoration: "none", padding: "6px 0", position: "relative",
            flex: 1, maxWidth: 80,
          }}>
            {/* Active pill */}
            {active && (
              <div style={{
                position: "absolute", top: -1, width: 28, height: 3,
                borderRadius: "0 0 4px 4px", background: "var(--accent)",
              }} />
            )}
            <Icon
              size={20}
              color={active ? "var(--accent)" : "var(--text-3)"}
              strokeWidth={active ? 2.4 : 1.8}
            />
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? "var(--accent)" : "var(--text-3)",
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
