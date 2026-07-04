import { Component as ReactComponent, createElement } from 'react';
import { createRoot } from 'react-dom/client';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Catches render-phase crashes in the component under test so a broken
 *  level produces a readable check failure instead of a blank page. */
class CheckBoundary extends ReactComponent {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    this.props.onError(error);
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}

function makeHelpers(host, getCrash) {
  const crashMessage = () => {
    const crash = getCrash();
    return crash ? String(crash.message || crash) : null;
  };

  const resolve = (target) => {
    if (typeof target !== 'string') return target;
    const el = host.querySelector(target);
    if (!el) {
      const crash = crashMessage();
      throw new Error(
        crash
          ? `Could not find ${target} — the component crashed while rendering: ${crash}`
          : `Expected to find ${target} in the rendered output, but it isn't there.`,
      );
    }
    return el;
  };

  const setNativeValue = (el, value) => {
    const proto = Object.getPrototypeOf(el);
    const descriptor =
      Object.getOwnPropertyDescriptor(proto, 'value') ||
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor.set.call(el, value);
  };

  return {
    pause,

    ok(condition, message) {
      if (!condition) throw new Error(message);
    },

    ensureNoCrash() {
      const crash = crashMessage();
      if (crash) throw new Error(`The component crashed while rendering: ${crash}`);
    },

    get: resolve,
    query: (selector) => host.querySelector(selector),
    all: (selector) => [...host.querySelectorAll(selector)],
    text: (target) => resolve(target).textContent.trim(),
    value: (target) => resolve(target).value,
    attr: (target, name) => resolve(target).getAttribute(name),

    async click(target) {
      resolve(target).click();
      await pause(25);
    },

    /** Types character-by-character through the native value setter so
     *  React's synthetic onChange fires exactly like real user input. */
    async type(target, textToType) {
      const el = resolve(target);
      for (const ch of textToType) {
        setNativeValue(el, el.value + ch);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await pause(5);
      }
      await pause(25);
    },

    async selectOption(target, optionValue) {
      const el = resolve(target);
      setNativeValue(el, optionValue);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await pause(25);
    },
  };
}

/** Mounts the level component in a hidden, isolated DOM node, runs one
 *  check against it with real events, then tears everything down. */
export async function runCheck(Target, check) {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;top:0;left:-10000px;width:900px;';
  document.body.appendChild(host);

  const root = createRoot(host);
  let crash = null;
  root.render(
    createElement(CheckBoundary, { onError: (e) => (crash = e) }, createElement(Target)),
  );
  await pause(60);

  const helpers = makeHelpers(host, () => crash);
  try {
    await check.run(helpers);
    return { name: check.name, pass: true };
  } catch (err) {
    return { name: check.name, pass: false, message: String(err?.message || err) };
  } finally {
    root.unmount();
    host.remove();
  }
}
