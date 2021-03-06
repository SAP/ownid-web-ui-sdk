import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import camelCase from 'lodash.camelcase';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import { uglify } from 'rollup-plugin-uglify';

const pkg = require('./package.json');
const libraryName = 'sdk';
const gigyaLibraryName = 'gigya-sdk';

export default [
  {
    input: `src/index.ts`,
    output: [
      {
        file: pkg.main,
        name: camelCase(libraryName),
        format: 'umd',
        sourcemap: true,
      },
      { file: pkg.module, format: 'es', sourcemap: true },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: {
      include: 'src/**',
    },
    plugins: [
      // Allow json resolution
      json(),
      //eslint(),
      // Compile TypeScript files
      typescript({ useTsconfigDeclarationDir: true }),

      // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
      commonjs(),
      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve(),

      // Resolve source maps to the original source
      //sourceMaps(),
      uglify(),
    ],
  },
  {
    input: `src/gigya/index.ts`,
    output: [
      {
        file: 'dist/gigya-sdk.umd.js',
        name: camelCase(gigyaLibraryName),
        format: 'umd',
        sourcemap: true,
      },
      { file: 'dist/gigya-sdk.es5.js', format: 'es', sourcemap: true },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: {
      include: 'src/**',
    },
    plugins: [
      // Allow json resolution
      json(),
      //eslint(),
      // Compile TypeScript files
      typescript({ useTsconfigDeclarationDir: true }),

      // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
      commonjs(),
      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve(),

      // Resolve source maps to the original source
      //sourceMaps(),
      uglify(),
    ],
  },
];
