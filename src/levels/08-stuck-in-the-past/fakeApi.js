export const TEAM = [
  { id: 'u1', name: 'Priya' },
  { id: 'u2', name: 'Jonas' },
  { id: 'u3', name: 'Amara' },
];

const PROFILES = {
  u1: {
    name: 'Priya Sharma',
    title: 'Frontend Engineer',
    bio: 'Ships pixel-perfect UIs and strong opinions about keyboard shortcuts.',
  },
  u2: {
    name: 'Jonas Weber',
    title: 'Design Systems Lead',
    bio: 'Believes every problem is a token naming problem in disguise.',
  },
  u3: {
    name: 'Amara Okafor',
    title: 'Accessibility Specialist',
    bio: 'Navigates the whole product with a screen reader before every release.',
  },
};

// Simulated network request — this file is bug-free.
export function fetchProfile(id) {
  return new Promise((resolve) => setTimeout(() => resolve(PROFILES[id]), 40));
}
