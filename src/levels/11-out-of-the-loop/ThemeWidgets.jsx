import { useTheme } from './ThemeContext.jsx';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="lv-btn" data-testid="theme-toggle" onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}

export function StatusPanel() {
  const { theme } = useTheme();
  return (
    <div
      className={theme === 'light' ? 'lv-panel-light' : 'lv-panel-dark'}
      data-testid="status-panel"
      data-theme={theme}
    >
      <p>
        Current theme: <strong data-testid="theme-label">{theme}</strong>
      </p>
      <p className="lv-muted">All systems operational.</p>
    </div>
  );
}
