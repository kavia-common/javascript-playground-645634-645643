import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Split from 'react-split';
import CodeEditor from './components/CodeEditor';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [code, setCode] = useState('');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <div className="App">
      <nav className="navbar">
        <div className="brand">
          <span className="dot" />
          <span>JS Playground</span>
        </div>
        <div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </nav>

      <main className="main">
        <Split
          className="split split-vertical"
          sizes={[55, 45]}
          minSize={240}
          gutterSize={8}
          direction="horizontal"
          cursor="col-resize"
        >
          <div className="Pane">
            <div className="pane-header">
              <span className="pane-title">Editor (JavaScript)</span>
            </div>
            <div className="pane-content">
              <CodeEditor
                value={code}
                onChange={setCode}
                language="javascript"
                theme={theme}
                height="100%"
              />
            </div>
          </div>
          <div className="Pane">
            <div className="pane-header">
              <span className="pane-title">Preview / Output</span>
            </div>
            <div className="pane-content" style={{ padding: 12 }}>
              <p style={{ opacity: 0.7, margin: 0 }}>
                Output preview will appear here in a later step.
              </p>
            </div>
          </div>
        </Split>
      </main>
    </div>
  );
}

export default App;
