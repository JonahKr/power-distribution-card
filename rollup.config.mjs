import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

const dev = process.env.BUILD_DEV === 'true';
const devSuffix = dev ? '-dev' : '';

const plugins = [
  replace({
    __DEV_SUFFIX__: JSON.stringify(devSuffix),
    preventAssignment: true,
  }),
  nodeResolve({}),
  commonjs(),
  typescript(),
  json(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
  }),
  terser(),
];

export default [
  {
    input: 'src/power-distribution-card.ts',
    output: {
      file: `dist/power-distribution-card${devSuffix}.js`,
      format: 'es',
    },
    plugins: [...plugins],
  },
];
