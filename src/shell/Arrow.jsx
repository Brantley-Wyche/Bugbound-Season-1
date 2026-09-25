// A drawn arrow, so every call to action shares one stroke instead of mixing text glyphs.
const paths = {
  right: 'M3 8h9.5M8.5 4l4 4-4 4',
  down: 'M8 3v9.5M4 8.5l4 4 4-4',
  left: 'M13 8H3.5M7.5 4l-4 4 4 4',
};

export default function Arrow({ direction = 'right' }) {
  return (
    <svg className="arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d={paths[direction]} />
    </svg>
  );
}
