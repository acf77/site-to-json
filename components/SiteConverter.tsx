"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

type ConvertResult = {
  spec?: unknown;
  url?: string;
  raw?: string;
  error?: string;
};

const LS_KEY = "openai_api_key";

export function SiteConverter() {
  const t = useTranslations("converter");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setApiKey(saved);
    else setKeyOpen(true); // open by default if no key saved
  }, []);

  function saveKey(val: string) {
    setApiKey(val);
    if (val.trim()) localStorage.setItem(LS_KEY, val.trim());
    else localStorage.removeItem(LS_KEY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), apiKey: apiKey.trim() || undefined }),
      });

      const data: ConvertResult = await res.json();
      setResult(data);
    } catch {
      setResult({ error: t("messages.networkError") });
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    const text = result.spec
      ? JSON.stringify(result.spec, null, 2)
      : result.raw ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!result) return;
    const text = result.spec
      ? JSON.stringify(result.spec, null, 2)
      : result.raw ?? "";
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const hostname = result.url
      ? new URL(result.url).hostname.replace(/\./g, "-")
      : "output";
    a.download = `${hostname}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const jsonOutput = result?.spec ? JSON.stringify(result.spec, null, 2) : null;
  const hasKey = apiKey.trim().length > 0;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.badge}>{t("badge")}</div>
        <h1 style={styles.title}>{t("title")}</h1>
        <p style={styles.subtitle}>
          Enter any website URL and get back a fully structured{" "}
          <a
            href="https://github.com/vercel-labs/json-render"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            json-render
          </a>{" "}
          spec.
        </p>
      </header>

      {/* API Key */}
      <div style={styles.keySection}>
        <button onClick={() => setKeyOpen((o) => !o)} style={styles.keyToggle}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              ...styles.keyDot,
              background: hasKey ? "#42be65" : "#da1e28",
            }} />
            {t("apiKey.title")}
          </span>
          <span style={styles.keyChevron}>{keyOpen ? "▲" : "▼"}</span>
        </button>

        {keyOpen && (
          <div style={styles.keyBody}>
            <div style={styles.keyInputRow}>
              <input
                type={keyVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => saveKey(e.target.value)}
                placeholder={t("apiKey.placeholder")}
                style={styles.keyInput}
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setKeyVisible((v) => !v)}
                style={styles.keyVisBtn}
              >
                {keyVisible ? t("apiKey.hide") : t("apiKey.show")}
              </button>
            </div>
            <p style={styles.keyHint}>
              {t("apiKey.hint")}{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={styles.link}>
                {t("apiKey.getKey")}
              </a>
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputRow}>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("url.placeholder")}
            required
            disabled={loading}
            style={styles.input}
            autoFocus
          />
          <button type="submit" disabled={loading || !url.trim() || !hasKey} style={styles.button}>
            {loading ? <span className="spinner" /> : t("actions.convert")}
          </button>
        </div>
        {!hasKey && (
          <p style={styles.noKeyWarning}>{t("messages.noKeyWarning")}</p>
        )}
      </form>

      {loading && (
        <div style={styles.status}>
          <div style={styles.loadingDots}>
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
          <p style={styles.statusText}>{t("messages.fetching", { url })}</p>
        </div>
      )}

      {result?.error && (
        <div style={styles.errorBox}>
          <strong>{t("messages.error")}</strong> {result.error}
          {result.raw && (
            <pre style={{ ...styles.rawOutput, marginTop: 12 }}>{result.raw}</pre>
          )}
        </div>
      )}

      {jsonOutput && (
        <div style={styles.outputWrapper}>
          <div style={styles.outputHeader}>
            <div style={styles.outputMeta}>
              <span style={styles.outputLabel}>{t("messages.jsonSpec")}</span>
              {result?.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.outputUrl}
                >
                  {result.url}
                </a>
              )}
            </div>
            <div style={styles.outputActions}>
              <button onClick={handleCopy} style={styles.actionBtn}>
                {copied ? t("actions.copied") : t("actions.copy")}
              </button>
              <button onClick={handleDownload} style={styles.actionBtn}>
                {t("actions.download")}
              </button>
            </div>
          </div>
          <pre style={styles.jsonOutput}>{jsonOutput}</pre>
        </div>
      )}

      <div style={styles.seoDescription}>
        {t("messages.inputDescription")}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    maxWidth: 900,
    margin: "0 auto",
    padding: "48px 24px 80px",
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  badge: {
    display: "inline-block",
    alignSelf: "flex-start",
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-btn)",
    padding: "3px 12px",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.05em",
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: "var(--text)",
  },
  subtitle: {
    color: "var(--text-muted)",
    fontSize: 16,
    maxWidth: 520,
  },
  link: {
    color: "var(--accent)",
    textDecoration: "none",
  },
  keySection: {
    border: "1px solid var(--border)",
    background: "var(--surface)",
  },
  keyToggle: {
    width: "100%",
    background: "none",
    border: "none",
    color: "var(--text)",
    fontSize: 14,
    fontWeight: 600,
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "inherit",
  },
  keyDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  keyChevron: {
    fontSize: 10,
    color: "var(--text-muted)",
  },
  keyBody: {
    padding: "0 16px 16px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingTop: 14,
  },
  keyInputRow: {
    display: "flex",
    gap: 0,
    border: "1px solid var(--border)",
  },
  keyInput: {
    flex: 1,
    background: "var(--bg)",
    border: "none",
    color: "var(--text)",
    fontSize: 13,
    padding: "10px 14px",
    outline: "none",
    fontFamily: "var(--font-mono)",
  },
  keyVisBtn: {
    background: "none",
    border: "none",
    borderLeft: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 600,
    padding: "0 14px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  keyHint: {
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  inputRow: {
    display: "flex",
    gap: 0,
    border: "1px solid var(--border)",
  },
  input: {
    flex: 1,
    background: "var(--surface)",
    border: "none",
    borderRadius: 0,
    color: "var(--text)",
    fontSize: 15,
    padding: "12px 16px",
    outline: "none",
    fontFamily: "inherit",
  },
  button: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 0,
    padding: "12px 28px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
    transition: "background 0.15s",
  },
  noKeyWarning: {
    fontSize: 12,
    color: "var(--text-muted)",
  },
  seoDescription: {
    fontSize: 14,
    color: "var(--text)",
    lineHeight: 1.8,
    marginTop: 32,
    padding: "32px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    whiteSpace: "pre-line",
  },
  status: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "32px 0",
  },
  loadingDots: {
    display: "flex",
    gap: 6,
  },
  statusText: {
    color: "var(--text-muted)",
    fontSize: 14,
    textAlign: "center",
  },
  errorBox: {
    background: "#2d1b1b",
    border: "1px solid #4a2020",
    borderLeft: "4px solid var(--error)",
    borderRadius: 0,
    color: "var(--error)",
    padding: "16px 20px",
    fontSize: 14,
  },
  rawOutput: {
    color: "var(--text-muted)",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  outputWrapper: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  outputHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface-2)",
    gap: 12,
    flexWrap: "wrap",
  },
  outputMeta: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  outputLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-muted)",
  },
  outputUrl: {
    color: "var(--accent)",
    fontSize: 12,
    textDecoration: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 500,
  },
  outputActions: {
    display: "flex",
    gap: 8,
    flexShrink: 0,
  },
  actionBtn: {
    background: "transparent",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-btn)",
    color: "var(--text)",
    fontSize: 13,
    fontWeight: 600,
    padding: "6px 16px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  jsonOutput: {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    lineHeight: 1.65,
    color: "#78a9ff",
    padding: 20,
    overflow: "auto",
    maxHeight: "60vh",
    whiteSpace: "pre",
    background: "var(--bg)",
  },
};
