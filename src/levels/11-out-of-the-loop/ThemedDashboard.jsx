import { ThemeProvider } from './ThemeContext.jsx';
import { ThemeToggle, StatusPanel } from './ThemeWidgets.jsx';

export default function ThemedDashboard() {
  return (
    <div className="lv-card">
      <div className="lv-row spread">
        <h4 className="lv-heading">🎛️ Mission Control</h4>
        <ThemeToggle />
      </div>
      <ThemeProvider>
        <StatusPanel />
      </ThemeProvider>
    </div>
  );
}
