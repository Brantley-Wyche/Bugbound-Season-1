import { createRoot } from 'react-dom/client';
import App from './shell/App.jsx';
import './styles/global.css';

// No <StrictMode> on purpose: the check harness counts renders and effect
// firings, and StrictMode's intentional double-invocation would make level
// checks report false failures.
createRoot(document.getElementById('root')).render(<App />);
