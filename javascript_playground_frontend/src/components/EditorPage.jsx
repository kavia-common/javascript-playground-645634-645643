import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * EditorPage
 * The main editor interface for the JavaScript playground.
 * - Split layout: editor (left) and output (right)
 * - Navbar: app title, share button, settings menu
 * - Monaco-like editor area using a simple textarea fallback (replace with Monaco/CodeMirror)
 * - Real-time code execution (sandboxed via Function, client-side)
 * - Resizable panes via draggable divider
 * 
 * TODO: Replace the textarea editor with Monaco Editor or CodeMirror.
 * TODO: Wire Share action to backend-generated shareable link.
 * TODO: Wire Execute (server-side) to backend sandbox for secure code execution.
 */

// Simple inline SVG icons for UI
const ShareIcon = ({ color = "#20232a" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 0 6c.53 0 1.03-.14 1.47-.38l-7.02 4.07A3 3 0 0 0 6 13a3 3 0 1 0 2.83 4H9a3 3 0 0 0 0-6c-.53 0-1.03.14-1.47.38l7.02-4.07C14.69 7.13 14.34 7 14 7a3 3 0 0 0 4 1Z" fill={color}/>
  </svg>
);

const SettingsIcon = ({ color = "#20232a" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.41l-.36 2.54c-.58.22-1.12.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L.8 7.98a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L.92 13.66a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.41 1.05.73 1.63.94l.36 2.54c.04.24.25.41.49.41h3.8c.24 0 .45-.17.49-.41l.36-2.54c.58-.22 1.12-.53 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z" fill={color}/>
  </svg>
);

// Utility to throttle resize updates
function useEventListener(event, handler, element = typeof window !== "undefined" ? window : undefined) {
  const savedHandler = useRef(handler);
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const target = element;
    if (!(target && target.addEventListener)) return;
    const listener = (e) => savedHandler.current(e);
    target.addEventListener(event, listener);
    return () => target.removeEventListener(event, listener);
  }, [event, element]);
}

const INITIAL_CODE = `// Welcome to JavaScript Playground
// Write JS on the left. Output appears on the right.
// console.log will print in the console below.

function greet(name) {
  return \`Hello, \${name} 👋\`;
}

console.log(greet("World"));

// Try throwing an error to see error handling:
// throw new Error("Something went wrong!");
`;

export default function EditorPage() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [leftWidth, setLeftWidth] = useState(55); // percent
  const [isDragging, setIsDragging] = useState(false);
  const dividerRef = useRef(null);
  const containerRef = useRef(null);
  const [isAutoRun, setIsAutoRun] = useState(true);

  // Run code safely in a Function sandbox; capture console logs
  const runCode = useCallback((src) => {
    const logs = [];
    const captureLog = (...args) => {
      try {
        const line = args.map((a) => {
          if (typeof a === "object") return JSON.stringify(a, null, 2);
          return String(a);
        }).join(" ");
        logs.push(line);
      } catch {
        logs.push(args.map(String).join(" "));
      }
    };
    setError("");
    setOutput("");

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", src);
      fn({ log: captureLog, error: captureLog, warn: captureLog, info: captureLog });
      setOutput(logs.join("\n"));
    } catch (err) {
      setError(String(err));
      setOutput(logs.join("\n"));
    }
  }, []);

  // Auto-run code on change when enabled
  useEffect(() => {
    if (!isAutoRun) return;
    const t = setTimeout(() => runCode(code), 300);
    return () => clearTimeout(t);
  }, [code, isAutoRun, runCode]);

  // Drag handlers for resizable split
  const onMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEventListener("mousemove", (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(80, Math.max(20, newLeftWidth));
    setLeftWidth(clamped);
  });

  useEventListener("mouseup", () => {
    if (isDragging) setIsDragging(false);
  });

  const onRunClick = () => runCode(code);

  const onShareClick = async () => {
    // PUBLIC_INTERFACE
    // TODO: Implement backend integration to create a shareable link for the current code.
    // Example flow:
    // 1) POST { code } to /api/share -> returns { id, url }
    // 2) Copy url to clipboard and show a toast
    try {
      // Placeholder client-only behavior: copy current URL with code encoded in hash (not for production)
      const shareURL = `${window.location.origin}${window.location.pathname}#code=${encodeURIComponent(code)}`;
      await navigator.clipboard.writeText(shareURL);
      // Basic alert in lieu of a toast system
      alert("Shareable link copied to clipboard! (Temporary client-side link)");
    } catch (e) {
      console.error("Share failed", e);
      alert("Share failed. See console for details.");
    }
  };

  // Settings: toggle autorun and theme placeholder
  const [settingsOpen, setSettingsOpen] = useState(false);

  const themeVars = useMemo(() => ({
    primary: "#20232a",
    secondary: "#61dafb",
    accent: "#f39c12",
  }), []);

  return (
    <div className="editor-root" style={styles.root}>
      <nav style={{ ...styles.navbar, borderBottom: `1px solid ${colors.border}` }}>
        <div style={styles.brand}>
          <span style={styles.brandDot} />
          <span style={styles.brandText}>JS Playground</span>
        </div>
        <div style={styles.navActions}>
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={() => setIsAutoRun((v) => !v)}
            title="Toggle auto-run"
          >
            {isAutoRun ? "Auto-run: On" : "Auto-run: Off"}
          </button>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={onRunClick} title="Run code now">
            ▶ Run
          </button>
          <button style={{ ...styles.iconBtn }} onClick={onShareClick} title="Share">
            <ShareIcon color={colors.primary} />
            <span style={{ marginLeft: 8 }}>Share</span>
          </button>
          <div style={{ position: "relative" }}>
            <button
              style={{ ...styles.iconBtn }}
              onClick={() => setSettingsOpen((s) => !s)}
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
              title="Settings"
            >
              <SettingsIcon color={colors.primary} />
              <span style={{ marginLeft: 8 }}>Settings</span>
            </button>
            {settingsOpen && (
              <div role="menu" style={styles.menu}>
                {/* PUBLIC_INTERFACE
                    TODO: Wire settings to backend or persisted preferences if required.
                 */}
                <div style={styles.menuItem}>
                  <label style={styles.menuLabel}>
                    <input
                      type="checkbox"
                      checked={isAutoRun}
                      onChange={(e) => setIsAutoRun(e.target.checked)}
                    />
                    <span style={{ marginLeft: 8 }}>Auto-run</span>
                  </label>
                </div>
                <div style={{ ...styles.menuItem, color: colors.muted }}>
                  Editor: Monaco (recommended) or CodeMirror
                  {/* TODO: Replace textarea with Monaco/CodeMirror initialization here. */}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div ref={containerRef} style={styles.splitContainer}>
        <section style={{ ...styles.paneLeft, width: `${leftWidth}%` }}>
          <header style={styles.paneHeader}>
            <h3 style={styles.paneTitle}>Editor</h3>
          </header>
          <div style={styles.editorWrapper}>
            {/* PUBLIC_INTERFACE
              TODO: Swap this textarea for Monaco Editor or CodeMirror for richer editing:
              - Monaco: @monaco-editor/react
              - CodeMirror: @uiw/react-codemirror
            */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={styles.textarea}
              aria-label="JavaScript editor"
            />
          </div>
        </section>

        <div
          ref={dividerRef}
          onMouseDown={onMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor and output panes"
          style={{ ...styles.divider, background: colors.border }}
        />

        <section style={styles.paneRight}>
          <header style={styles.paneHeader}>
            <h3 style={styles.paneTitle}>Output</h3>
          </header>
          <div style={styles.outputWrapper}>
            {error ? (
              <pre style={styles.errorBox} aria-live="polite">{error}</pre>
            ) : null}
            <pre style={styles.consoleBox} aria-live="polite">
              {output || "Console output will appear here..."}
            </pre>
          </div>
        </section>
      </div>

      <footer style={styles.footer}>
        <span style={{ color: colors.muted }}>
          Colors: primary {themeVars.primary}, secondary {themeVars.secondary}, accent {themeVars.accent}
        </span>
      </footer>
    </div>
  );
}

const colors = {
  bg: "#ffffff",
  surface: "#f8f9fa",
  primary: "#20232a",
  secondary: "#61dafb",
  accent: "#f39c12",
  border: "#e9ecef",
  muted: "#6c757d",
  codeBg: "#f5f7fb",
  codeBorder: "#e3e7ee",
  errorBg: "#fff5f5",
  errorText: "#b00020",
};

const styles = {
  root: {
    height: "100vh",
    width: "100vw",
    background: colors.bg,
    color: colors.primary,
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    height: 56,
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    color: colors.primary,
  },
  brandDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
    boxShadow: `0 0 0 2px ${colors.border}`,
  },
  brandText: {
    letterSpacing: 0.3,
  },
  navActions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  btn: {
    borderRadius: 10,
    padding: "8px 12px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontWeight: 600,
    background: colors.surface,
    color: colors.primary,
    transition: "all .2s ease",
  },
  btnPrimary: {
    background: colors.secondary,
    color: "#101214",
    borderColor: "transparent",
  },
  btnSecondary: {
    background: "#ffffff",
    borderColor: colors.border,
  },
  iconBtn: {
    background: "#ffffff",
    color: colors.primary,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 600,
  },
  menu: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    background: "#ffffff",
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  },
  menuItem: {
    padding: "8px 10px",
    borderRadius: 8,
  },
  menuLabel: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  splitContainer: {
    flex: 1,
    display: "flex",
    position: "relative",
    background: colors.surface,
  },
  paneLeft: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${colors.border}`,
    minWidth: 0,
  },
  paneRight: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  paneHeader: {
    height: 44,
    padding: "0 12px",
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
  },
  paneTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
    letterSpacing: 0.2,
  },
  divider: {
    width: 6,
    cursor: "col-resize",
    background: colors.border,
  },
  editorWrapper: {
    flex: 1,
    position: "relative",
    padding: 12,
  },
  textarea: {
    width: "100%",
    height: "100%",
    resize: "none",
    outline: "none",
    borderRadius: 10,
    border: `1px solid ${colors.codeBorder}`,
    background: colors.codeBg,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: 14,
    lineHeight: 1.5,
    color: colors.primary,
    padding: 12,
    boxSizing: "border-box",
  },
  outputWrapper: {
    flex: 1,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  consoleBox: {
    flex: 1,
    background: "#ffffff",
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: 12,
    margin: 0,
    overflow: "auto",
    fontSize: 14,
    whiteSpace: "pre-wrap",
    color: colors.primary,
  },
  errorBox: {
    background: colors.errorBg,
    border: `1px solid ${colors.border}`,
    color: colors.errorText,
    borderRadius: 10,
    padding: 12,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  footer: {
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderTop: `1px solid ${colors.border}`,
    background: "#ffffff",
  },
};
