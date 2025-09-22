import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

export default {
  input: 'dist/esm/index.js',
  external: [
    '@capacitor/core',
  ],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: pkg.unpkg,
      format: 'iife',
      name: 'capacitorAirbridge',
      globals: {
        '@capacitor/core': 'capacitorExports',
      },
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
};