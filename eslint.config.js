// Minimal lint setup (no plugins needed): `npx eslint .`
const browser = Object.fromEntries([
  'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage', 'indexedDB',
  'performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'setInterval',
  'clearInterval', 'console', 'fetch', 'URL', 'Blob', 'File', 'FileReader', 'Image', 'Audio', 'MediaRecorder',
  'SpeechSynthesisUtterance', 'ResizeObserver', 'PointerEvent', 'crypto', 'caches', 'self', 'Response',
  'getComputedStyle', 'matchMedia', 'Node', 'createImageBitmap', 'process',
].map((name) => [name, 'readonly']));

export default [
  { ignores: ['node_modules/**'] },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: browser },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-imports': 'error',
      'eqeqeq': ['error', 'smart'],
      'prefer-const': 'error',
    },
  },
];
