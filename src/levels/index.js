import l01 from './01-broken-badge/manifest.js';
import l02 from './02-now-you-see-me/manifest.js';
import l03 from './03-lost-in-transit/manifest.js';
import l04 from './04-frozen-scoreboard/manifest.js';
import l05 from './05-triple-trouble/manifest.js';
import l06 from './06-musical-chairs/manifest.js';
import l07 from './07-unresponsive-form/manifest.js';
import l08 from './08-stuck-in-the-past/manifest.js';
import l09 from './09-haunted-stopwatch/manifest.js';
import l10 from './10-photo-finish/manifest.js';
import l11 from './11-out-of-the-loop/manifest.js';
import l12 from './12-render-storm/manifest.js';
import l13 from './13-any-port/manifest.js';
import l14 from './14-hook-line-sinker/manifest.js';
import l15 from './15-final-boss/manifest.js';

export const levels = [
  l01, l02, l03, l04, l05, l06, l07, l08, l09, l10, l11, l12, l13, l14, l15,
].sort((a, b) => a.number - b.number);
