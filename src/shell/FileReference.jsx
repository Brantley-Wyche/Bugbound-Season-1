import { useEffect, useRef, useState } from 'react';

// Vite's dev server can open a file in the learner's editor. Folders stay
// copy-only: incidents that name a folder ask the learner to investigate.
const canOpen = (path) => import.meta.env.DEV && !path.endsWith('/');

export default function FileReference({ path }) {
  const [notice, setNotice] = useState('');
  const timer = useRef(null);
  const code = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (message, duration = 2000) => {
    setNotice(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(''), duration);
  };

  // Vite always answers 200, so the shell cannot confirm the editor opened.
  const open = () => {
    fetch(`/__open-in-editor?file=${encodeURIComponent(path)}`).catch(() => {});
    flash('Sent to your editor. If nothing opens, copy the path.', 5000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(path);
      flash('Copied');
    } catch {
      // Some browsers deny clipboard access; leave the path selected for the keyboard instead.
      window.getSelection()?.selectAllChildren(code.current);
      flash('Path selected. Copy it with Ctrl+C or ⌘C.', 5000);
    }
  };

  return (
    <div className="file-ref">
      <code ref={code}>{path}</code>
      <span className="file-actions">
        {canOpen(path) && <button type="button" className="quiet-button file-open" onClick={open}>Open in editor</button>}
        <button type="button" className="quiet-button" onClick={copy}>Copy path</button>
        <span className="file-notice" role="status">{notice}</span>
      </span>
    </div>
  );
}
