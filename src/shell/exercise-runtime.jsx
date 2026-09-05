import { createRoot } from 'react-dom/client';
import { levels } from '../levels/index.js';
import ErrorBoundary from './ErrorBoundary.jsx';
import { runCheck } from './harness.jsx';
import '../styles/global.css';

const params = new URLSearchParams(location.search);
const level = levels.find(item => item.id === params.get('level'));
const rootElement = document.getElementById('exercise-root');

if (level) {
  document.title = `${level.title} — exercise`;
  if (params.get('mode') === 'check') {
    window.__bugboundCheck = index => {
      if (!level.checks[index]) throw new Error('Unknown exercise check.');
      return runCheck(level.Component, level.checks[index]);
    };
  } else {
    const Demo = level.Component;
    createRoot(rootElement).render(<ErrorBoundary><Demo /></ErrorBoundary>);
    const resize = new ResizeObserver(() => {
      parent.postMessage({ type: 'bugbound:preview-size', height: Math.ceil(rootElement.getBoundingClientRect().height) }, location.origin);
    });
    resize.observe(rootElement);
    window.addEventListener('pagehide', () => resize.disconnect(), { once: true });
  }
} else {
  rootElement.textContent = 'This exercise could not be found.';
}
