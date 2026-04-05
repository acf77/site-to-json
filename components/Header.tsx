"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/src/i18n/routing";

export function Header() {
  const t = useTranslations("header");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <a href="https://trapiche.cloud" style={styles.brand} aria-label="trapiche home">
          <img src="/logo.webp" alt="Trapiche logo" width={666} height={375} style={styles.logo} />
          <span style={styles.brandName}>trapiche</span>
        </a>

        <div style={styles.links}>
          <a href="https://trapiche.cloud/#infraestrutura" style={styles.link}>{t("products")}</a>
          <a href="https://trapiche.cloud/docs/quickstart" style={styles.link}>{t("documentation")}</a>
          <a href="https://trapiche.cloud/precos" style={styles.link}>{t("pricing")}</a>
          <a href="https://trapiche.cloud/sobre" style={styles.link}>{t("about")}</a>
        </div>

        <div style={styles.actions}>
          <a href="https://dashboard.trapiche.cloud" style={styles.linkSub}>{t("login")}</a>
          <a href="https://trapiche.cloud/new" style={styles.cta}>{t("deploy")}</a>
          
          {/* Language Switcher */}
          <div style={styles.langSwitcher}>
            <Link href={pathname} locale="en" style={styles.langLink}>
              EN
            </Link>
            <span style={styles.langDivider}>|</span>
            <Link href={pathname} locale="pt" style={styles.langLink}>
              PT
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={styles.menuBtn}
            aria-label={t("menuLabel")}
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
          <a href="https://trapiche.cloud/#infraestrutura" style={styles.drawerLink}>{t("products")}</a>
          <a href="https://trapiche.cloud/docs/quickstart" style={styles.drawerLink}>{t("documentation")}</a>
          <a href="https://trapiche.cloud/precos" style={styles.drawerLink}>{t("pricing")}</a>
          <a href="https://trapiche.cloud/sobre" style={styles.drawerLink}>{t("about")}</a>
          <a href="https://dashboard.trapiche.cloud" style={styles.drawerLink}>{t("login")}</a>
          
          {/* Language Switcher in Drawer */}
          <div style={styles.drawerLangSwitcher}>
            <Link href={pathname} locale="en" style={styles.drawerLangLink}>
              English
            </Link>
            <Link href={pathname} locale="pt" style={styles.drawerLangLink}>
              Português
            </Link>
          </div>
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
  langSwitcher: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 8px",
    borderRadius: 4,
    background: "rgba(255,255,255,0.05)",
  },
  langLink: {
    fontSize: 12,
    fontWeight: 600,
    color: "#c6c6c6",
    textDecoration: "none",
    padding: "2px 4px",
    transition: "color 0.15s",
  },
  langDivider: {
    color: "#525252",
    fontSize: 12,
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
  drawerLangSwitcher: {
    display: "flex",
    gap: 16,
    padding: "12px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  drawerLangLink: {
    fontSize: 14,
    color: "#c6c6c6",
    textDecoration: "none",
  },
};
