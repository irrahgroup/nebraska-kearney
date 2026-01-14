import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['nodes/Zapi/Zapi.node.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: false,
  minify: true,
  external: ['react', 'react-dom', 'next'],
  treeshake: true,
  splitting: false,
});