import Component from './RsvpForm.jsx';

export default {
  id: '07-unresponsive-form',
  number: 7,
  title: 'The Unresponsive Form',
  concept: 'Controlled Forms',
  severity: 'Medium',
  Component,
  files: ['src/levels/07-unresponsive-form/RsvpForm.jsx'],
  symptom:
    'You cannot type into the name field — keystrokes just vanish. And picking a dietary preference doesn’t change the diet in the summary… it changes the NAME instead.',
  lesson: [
    'A controlled input is a two-way contract: `value={state}` makes React the single source of truth, and `onChange` is how the DOM reports keystrokes back. Provide `value` without `onChange` and React dutifully resets the field to state on every keypress — a read-only input that eats your typing.',
    'Every controlled field needs its own faithful pairing: this input’s `value` comes from this state, and its `onChange` calls THAT state’s setter. Copy-pasting a field and forgetting to swap the setter is one of the most common form bugs in real codebases — everything looks right until two fields start writing to the same place.',
    'When a form misbehaves, audit each field as a unit: what state feeds `value`? what setter does `onChange` call? Any mismatch in that loop is your bug.',
  ],
  checks: [
    {
      name: 'You can type into the name field',
      run: async (h) => {
        await h.type('[data-testid="name-input"]', 'Grace Hopper');
        const summary = h.text('[data-testid="summary-name"]');
        h.ok(
          summary === 'Grace Hopper',
          `Typed "Grace Hopper" but the summary shows "${summary}".`,
        );
        const inputValue = h.value('[data-testid="name-input"]');
        h.ok(
          inputValue === 'Grace Hopper',
          `The input field itself contains "${inputValue}" instead of what was typed.`,
        );
      },
    },
    {
      name: 'Choosing a diet updates the diet — and only the diet',
      run: async (h) => {
        await h.selectOption('[data-testid="diet-select"]', 'vegan');
        const diet = h.text('[data-testid="summary-diet"]');
        h.ok(diet === 'vegan', `Selected "vegan" but the summary diet shows "${diet}".`);
        const name = h.text('[data-testid="summary-name"]');
        h.ok(
          name === '—',
          `Selecting a diet changed the name to "${name}" — the two fields are cross-wired.`,
        );
      },
    },
  ],
};
