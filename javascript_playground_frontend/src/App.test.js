import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Editor pane title', () => {
  render(<App />);
  const editorTitle = screen.getByText(/editor/i);
  expect(editorTitle).toBeInTheDocument();
});

test('renders a code editor textarea', () => {
  render(<App />);
  const textarea = screen.getByLabelText(/javascript code editor/i);
  expect(textarea).toBeInTheDocument();
});
