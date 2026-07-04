import { useState } from 'react';

export function useToggle(initial: any): any {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((v: any) => !v);
  return { on, toggle };
}
