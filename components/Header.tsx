"use client";

import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <a href="/" style={styles.brand} aria-label="trapiche home">
          <img src="/logo.webp" alt="Trapiche logo" width={666} height={375} style={styles.logo} />
          <span style={styles.brandName}>trapiche</span>
        </a>

        <div style={styles.links}>
          <a href="https://trapiche.cloud/#infraestrutura" style={styles.link}>Produtos</a>
          <a href="https://trapiche.cloud/docs/quickstart" style={styles.link}>Documentação</a>
          <a href="https://trapiche.cloud/precos" style={styles.link}>Preços</a>
          <a href="https://trapiche.cloud/sobre" style={styles.link}>Sobre</a>
        </div>

        <div style={styles.actions}>
          <a href="https://dashboard.trapiche.cloud" style={styles.linkSub}>Entrar</a>
          <a href="https://trapiche.cloud/new" style={styles.cta}>Fazer deploy</a>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={styles.menuBtn}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" />
              <rect y="9" width="20" height="2" />
              <rect y="15" width="20" height="2" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={styles.drawer}>
          <a href="https://trapiche.cloud/#infraestrutura" style={styles.drawerLink}>Produtos</a>
          <a href="https://trapiche.cloud/docs/quickstart" style={styles.drawerLink}>Documentação</a>
          <a href="https://trapiche.cloud/precos" style={styles.drawerLink}>Preços</a>
          <a href="https://trapiche.cloud/sobre" style={styles.drawerLink}>Sobre</a>
          <a href="https://dashboard.trapiche.cloud" style={styles.drawerLink}>Entrar</a>
        </div>
      )}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    background: "rgba(22,22,22,0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  inner: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "0 24px",
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    flexShrink: 0,
  },
  logo: {
    height: 32,
    width: "auto",
  },
  brandName: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    color: "#f4f4f4",
  },
  links: {
    display: "flex",
    gap: 24,
    alignItems: "center",
  },
  link: {
    fontSize: 14,
    color: "#c6c6c6",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  linkSub: {
    fontSize: 14,
    fontWeight: 500,
    color: "#c6c6c6",
    textDecoration: "none",
  },
  cta: {
    padding: "6px 16px",
    fontSize: 14,
    fontWeight: 500,
    color: "#ffffff",
    background: "#0f62fe",
    textDecoration: "none",
    transition: "background 0.15s",
  },
  menuBtn: {
    display: "none",
    background: "none",
    border: "none",
    color: "#c6c6c6",
    cursor: "pointer",
    padding: 8,
  },
  drawer: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "#161616",
    padding: "8px 16px",
    display: "flex",
    flexDirection: "column",
  },
  drawerLink: {
    display: "block",
    fontSize: 14,
    padding: "12px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#c6c6c6",
    textDecoration: "none",
  },
};
