# EditorPage Integration Notes

This component implements the main playground UI:

- Split layout (editor left, output right) with a draggable divider.
- Navbar with Share and Settings.
- Live code execution on the client using `Function`, capturing console logs.
- Modern, light theme using colors:
  - primary: #20232a
  - secondary: #61dafb
  - accent: #f39c12

TODOs:
1) Replace the textarea with a proper code editor:
   - Monaco Editor: @monaco-editor/react
   - CodeMirror: @uiw/react-codemirror
2) Share action:
   - POST { code } to backend to get a shareable URL.
   - Copy link to clipboard and show a toast.
3) Secure execution:
   - Call backend sandbox for execution instead of client `Function`.

Styling:
All styles are inline within the component for simplicity and to avoid adding a CSS framework. Adapt as needed.
