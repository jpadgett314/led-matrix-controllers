import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/led-matrix-controllers.browser.mjs',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    resolve(),
    terser(),
  ]
};
