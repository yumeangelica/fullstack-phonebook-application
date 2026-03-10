const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.jest,
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      indent: ['error', 2],
      eqeqeq: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'block-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-trailing-spaces': 'error',
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'capitalized-comments': [
        'error',
        'always',
        {
          ignorePattern: 'pragma|ignored|eslint',
          ignoreInlineComments: true,
          ignoreConsecutiveComments: true,
        },
      ],
      complexity: ['warn', { max: 40 }],
    },
  },
  {
    ignores: [
      'build/**',
      'node_modules/**',
      'coverage/**',
      'client/**',
      'dist/**',
      '.env',
      '.DS_Store',
      'stats.json',
    ],
  },
];
