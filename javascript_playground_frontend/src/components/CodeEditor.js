import React, { useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * CodeEditor component renders a Monaco-powered editor with JavaScript syntax highlighting.
 * It is designed to be used in a split-pane layout (left pane).
 *
 * Props:
 * - value: string - current code value
 * - onChange: function(newCode: string) - callback when code changes
 * - language: string - language for syntax highlighting (default: 'javascript')
 * - theme: 'light' | 'dark' - editor theme (default: 'light')
 * - height: string | number - height of the editor container (default: '100%')
 */
function CodeEditor({ value, onChange, language = 'javascript', theme = 'light', height = '100%' }) {
  // Map app theme to monaco theme id
  const monacoTheme = useMemo(() => (theme === 'dark' ? 'vs-dark' : 'vs'), [theme]);

  const handleChange = useCallback(
    (val) => {
      if (typeof onChange === 'function') {
        onChange(val ?? '');
      }
    },
    [onChange]
  );

  const defaultValue = value ?? `// Welcome to the JavaScript Playground!
function greet(name) {
  return \`Hello, \${name} 👋\`;
}

console.log(greet('World'));
`;

  return (
    <div className="code-editor-container" style={{ height, width: '100%' }} aria-label="JavaScript code editor">
      <Editor
        value={value}
        defaultValue={defaultValue}
        language={language}
        theme={monacoTheme}
        onChange={handleChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          smoothScrolling: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}

CodeEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  language: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark']),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default CodeEditor;
