import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

// Lightweight, no external editor dependency: we use a simple textarea to simulate code editing
// and basic layout/pane resizing logic with mouse events.

// PUBLIC_INTERFACE
function App() {
  /**
   * VS Code–like layout with:
   * - Top Navbar
   * - Main split: left code editor, right output
   * - Bottom collapsible chat assistant drawer
   * - Resizable vertical split
   */
  const [theme, setTheme] = useState('light');
  const [code, setCode] = useState(`// Welcome to the JavaScript Playground
// Type JavaScript here and click "Run ▶" or press Ctrl+Enter.
// Example:
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));`);
  const [output, setOutput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [split, setSplit] = useState(50); // percentage width of editor
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'system', content: 'Assistant ready. Ask about your code or JS behavior.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const containerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Mouse handlers for resizing
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(20, Math.min(80, (x / rect.width) * 100));
      setSplit(pct);
    };
    const onUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  const runCode = () => {
    // Run code safely in a sandboxed Function scope, capture console.log
    const logs = [];
    const originalLog = console.log;
    try {
      // Capture logs
      console.log = (...args) => {
        logs.push(args.map(String).join(' '));
      };
      // eslint-disable-next-line no-new-func
      const fn = new Function(code);
      fn();
      setOutput(logs.join('\n'));
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      console.log = originalLog;
    }
  };

  const handleKeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      runCode();
    }
  };

  const themeLabel = theme === 'light' ? '🌙 Dark' : '☀️ Light';

  return (
    <div className="ide-root" onKeyDown={handleKeydown}>
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
        onRun={runCode}
      />
      <main className={`ide-main ${chatOpen ? 'with-chat' : ''}`}>
        <div className="split-container" ref={containerRef}>
          <section className="pane pane-editor" style={{ width: `${split}%` }}>
            <Editor code={code} onChange={setCode} />
          </section>
          <div
            className={`gutter ${isDragging ? 'dragging' : ''}`}
            onMouseDown={() => setIsDragging(true)}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor and output panes"
          />
          <section className="pane pane-output" style={{ width: `${100 - split}%` }}>
            <OutputPane output={output} />
          </section>
        </div>
      </main>
      <ChatToggle open={chatOpen} onToggle={() => setChatOpen(o => !o)} />
      {chatOpen && (
        <ChatPanel
          messages={chatMessages}
          onSend={(text) => {
            if (!text.trim()) return;
            const user = { role: 'user', content: text.trim() };
            const assistant = {
              role: 'assistant',
              content: generateAssistantReply(text.trim(), code)
            };
            setChatMessages(prev => [...prev, user, assistant]);
            setChatInput('');
          }}
          value={chatInput}
          onChange={setChatInput}
        />
      )}
      <footer className="status-bar">
        <span>Theme: {themeLabel}</span>
        <span> | Split: {Math.round(split)}% / {Math.round(100 - split)}%</span>
        <span> | Chat: {chatOpen ? 'Open' : 'Closed'}</span>
        <span className="hint"> | Hint: Ctrl/Cmd + Enter to Run ▶</span>
      </footer>
    </div>
  );
}

// Simple heuristics for demo assistant behavior
function generateAssistantReply(question, currentCode) {
  // This is a placeholder logic that can be replaced by real backend or LLM integration.
  const lower = question.toLowerCase();
  if (lower.includes('error')) {
    return 'If you encountered an error, check recent console output for stack traces and ensure all variables/functions exist before use.';
  }
  if (lower.includes('optimize') || lower.includes('performance')) {
    return 'Consider avoiding repeated computations, cache results where possible, and prefer const/let over var for block scoping.';
  }
  if (lower.includes('explain') || lower.includes('what does')) {
    return 'Your code defines a function and logs its result. Use console.log to inspect values during execution. Try adding more logs.';
  }
  if (lower.includes('how to run') || lower.includes('run code')) {
    return 'Click the Run ▶ button in the navbar or press Ctrl/Cmd + Enter to execute the code.';
  }
  if (lower.includes('format') || lower.includes('style')) {
    return 'Use consistent indentation (2 spaces), semicolons where needed, and descriptive variable names for readability.';
  }
  // Reference current code modestly
  const lines = currentCode.split('\n').slice(0, 5).join('\n');
  return `I can help with your code. I see your first lines are:\n${lines}\nAsk a specific question like "How do I return a value from a function?"`;
}

// PUBLIC_INTERFACE
function Navbar({ theme, onToggleTheme, onRun }) {
  /** A simple top navbar with project title, run button, and theme toggle. */
  return (
    <header className="navbar">
      <div className="left">
        <span className="app-brand">JS Playground</span>
        <span className="divider" />
        <nav className="menu">
          <button className="menu-btn" title="File">File</button>
          <button className="menu-btn" title="Edit">Edit</button>
          <button className="menu-btn" title="View">View</button>
        </nav>
      </div>
      <div className="right">
        <button className="btn run" onClick={onRun} title="Run (Ctrl/Cmd + Enter)">
          ▶ Run
        </button>
        <button className="btn secondary" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </header>
  );
}

// PUBLIC_INTERFACE
function Editor({ code, onChange }) {
  /** Minimal code editor area based on textarea, VS Code–like colors via CSS. */
  const textAreaRef = useRef(null);

  // Tab insertion and Ctrl+Enter to run prevented here (run is handled at root)
  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textAreaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const value = ta.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="editor-root">
      <div className="editor-header">
        <span className="file-name">playground.js</span>
      </div>
      <textarea
        ref={textAreaRef}
        className="editor-textarea"
        value={code}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label="Code editor"
      />
    </div>
  );
}

// PUBLIC_INTERFACE
function OutputPane({ output }) {
  /** Shows execution output logs */
  return (
    <div className="output-root">
      <div className="output-header">
        <span>Output</span>
      </div>
      <pre className="output-pre" aria-live="polite">{output || 'No output yet. Run your code to see results.'}</pre>
    </div>
  );
}

// PUBLIC_INTERFACE
function ChatToggle({ open, onToggle }) {
  /** Toggle button like VS Code's bottom panel show/hide */
  return (
    <button
      className={`chat-toggle ${open ? 'open' : ''}`}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="chat-panel"
      title={open ? 'Hide Chat (Ctrl+J)' : 'Show Chat (Ctrl+J)'}
    >
      💬 Chat
    </button>
  );
}

// PUBLIC_INTERFACE
function ChatPanel({ messages, onSend, value, onChange }) {
  /** Bottom drawer chat assistant. */
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    onSend(value);
  };

  return (
    <aside className="chat-panel" id="chat-panel" role="complementary" aria-label="Chat assistant">
      <div className="chat-header">Assistant</div>
      <div className="chat-messages" ref={listRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-msg ${m.role}`}>
            <div className="chat-bubble">
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={submit}>
        <input
          className="chat-input"
          placeholder="Ask about your code…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button className="btn send" type="submit">Send</button>
      </form>
    </aside>
  );
}

export default App;
