import { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { levels } from '../levels/index.js';
import ErrorBoundary from './ErrorBoundary.jsx';
import { runCheck } from './harness.jsx';
import '../styles/global.css';

const params = new URLSearchParams(location.search);
const level = levels.find(item => item.id === params.get('level'));
const rootElement = document.getElementById('exercise-root');

if (level) {
  document.title = `${level.title} — preview`;
  if (params.get('mode') === 'check') {
    window.__bugboundCheck = index => {
      if (!level.checks[index]) throw new Error('Unknown exercise check.');
      return runCheck(level.Component, level.checks[index]);
    };
  } else {
    const Demo = level.Component;
    const boundary = createRef();
    createRoot(rootElement).render(<ErrorBoundary ref={boundary}><Demo /></ErrorBoundary>);
    // Fast Refresh cannot retry a boundary that failed before its first hot
    // update, so a lesson that crashes on load would keep a stale crash after
    // the fix. Retry once React Refresh's 16ms update debounce has applied the
    // new code; a still-broken component simply fails again.
    import.meta.hot?.on('vite:afterUpdate', () => setTimeout(() => boundary.current?.retry(), 50));
    const resize = new ResizeObserver(() => {
      parent.postMessage({ type: 'bugbound:preview-size', height: Math.ceil(rootElement.getBoundingClientRect().height) }, location.origin);
    });
    resize.observe(rootElement);
    window.addEventListener('pagehide', () => resize.disconnect(), { once: true });
  }
} else {
  rootElement.textContent = 'This incident could not be found.';
}
