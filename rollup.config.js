import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import {uglify} from 'rollup-plugin-uglify';
import license from 'rollup-plugin-license';
import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/lazy-scripts.js',
    output: {
      name: pkg.scriptname,
      file: pkg.main,
      format: 'umd',
    },
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      license({
        banner:
          '/*! <%= pkg.scriptname || pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= moment().format("YYYY-MM-DD") + "\\n" %>' +
          '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
          '* Copyright (c) <%= moment().format("YYYY") %> <%= pkg.author.name %>;' +
          ' Licensed <%= _.map(pkg.licenses, "name").join(", ") %> */\n\n'
      }),
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              modules: false,
            },
          ],
        ],
      }),
      filesize(),
    ],
  },
  {
    input: 'src/lazy-scripts.js',
    output: {
      name: pkg.scriptname,
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      license({
        banner:
          '/*! <%= pkg.scriptname || pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= moment().format("YYYY-MM-DD") + "\\n" %>' +
          '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
          '* Copyright (c) <%= moment().format("YYYY") %> <%= pkg.author.name %>;' +
          ' Licensed <%= _.map(pkg.licenses, "name").join(", ") %> */\n\n'
      }),
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              modules: false,
            },
          ],
        ],
      }),
      uglify({
        output: {
          comments: false,
        },
      }),
      filesize(),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/lazy-scripts.js',
    output: [
      {file: pkg.module, format: 'es'},
    ],
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      license({
        banner:
          '/*! <%= pkg.scriptname || pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= moment().format("YYYY-MM-DD") + "\\n" %>' +
          '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
          '* Copyright (c) <%= moment().format("YYYY") %> <%= pkg.author.name %>;' +
          ' Licensed <%= _.map(pkg.licenses, "name").join(", ") %> */\n\n'
      }),
      filesize(),
    ],
  },
];
