import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App is the landing view of the JavaScript Playground frontend.
 * It now renders a modern, light-themed split layout with an editable JavaScript
 * code interface on the left and a placeholder output pane on the right.
 * This version focuses only on editable input (no execution yet).
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [code, setCode] = useState(`// Welcome to the JavaScript Playground!
// Start typing your JavaScript here...
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`);

  // Apply theme to the document element for CSS variable scoping.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      {/* Top Navigation Bar */}
      <header className="navbar" role="banner" aria-label="Top Navigation">
        <div className="nav-left">
          <span className="brand">JS Playground</span>
        </div>
        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      {/* Split Layout */}
      <main className="workspace" role="main">
        <section className="pane editor-pane" aria-label="Code editor">
          <div className="pane-header">
            <span className="pane-title">Editor</span>
          </div>
          {/* PUBLIC_INTERFACE */}
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            aria-label="JavaScript code editor"
            placeholder="// Type your JS code here"
          />
        </section>

        <section className="pane output-pane" aria-label="Output preview">
          <div className="pane-header">
            <span className="pane-title">Output</span>
          </div>
          <div className="output-placeholder">
            <p className="description">
              Code execution output will appear here in a future step.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
