import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App is the landing view of the JavaScript Playground frontend.
 * It renders a very simple, themed "Hello World" welcome screen using modern React best practices.
 * - Provides a light/dark theme toggle that respects the existing CSS variables and transitions.
 * - Serves as the initial UI, ready to be extended with playground features.
 */
function App() {
  const [theme, setTheme] = useState('light');

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
      <header className="App-header" role="banner">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <h1 className="title" style={{ margin: 0 }}>Hello World</h1>
        <p className="subtitle" style={{ marginTop: 12, opacity: 0.9 }}>
          Welcome to the JavaScript Playground
        </p>
        <p className="description" style={{ marginTop: 24, maxWidth: 560, lineHeight: 1.5 }}>
          This is a minimal landing screen. Use the theme toggle to switch between light and dark modes.
          The interface is ready to evolve into a live code playground with an editor and output panel.
        </p>
      </header>
    </div>
  );
}

export default App;
