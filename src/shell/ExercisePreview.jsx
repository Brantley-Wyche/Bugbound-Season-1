import { useEffect, useRef, useState } from 'react';
import { exerciseURL } from './exercise-frame.js';

export default function ExercisePreview({ level }) {
  const frame = useRef(null);
  const [height, setHeight] = useState(160);
  useEffect(() => {
    const resize = event => {
      if (event.source !== frame.current?.contentWindow || event.origin !== location.origin) return;
      if (event.data?.type === 'bugbound:preview-size' && Number.isFinite(event.data.height)) {
        setHeight(Math.max(60, Math.min(100000, event.data.height)));
      }
    };
    window.addEventListener('message', resize);
    return () => window.removeEventListener('message', resize);
  }, []);
  return <iframe ref={frame} className="exercise-frame" src={exerciseURL(level.id, 'preview')} title={`${level.title}: interactive exercise preview`} style={{ height }} />;
}
