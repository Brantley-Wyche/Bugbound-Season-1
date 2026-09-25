// Shared wording for dates and counts in the notebook's records.
const dayFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

const isToday = (date, now) => date.toDateString() === now.toDateString();

/** "today" or "Sep 24" */
export function formatDay(value, now = new Date()) {
  const date = new Date(value);
  return isToday(date, now) ? 'today' : dayFormat.format(date);
}

/** "9:14 PM" */
export const formatTime = (value) => timeFormat.format(new Date(value));

/** "today at 9:14 PM" or "Sep 24 at 9:14 PM" */
export const formatMoment = (value, now = new Date()) => `${formatDay(value, now)} at ${formatTime(value)}`;

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
