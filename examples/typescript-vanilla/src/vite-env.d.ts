declare module '*.css';
declare module '*.json' {
  const value: any;
  export default value;
}
declare module 'vitest';
declare module 'vitest/config' {
  export const defineConfig: any;
}
