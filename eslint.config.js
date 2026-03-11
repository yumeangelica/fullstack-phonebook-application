const js = require('@eslint/js');
const globals = require('globals');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
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
      complexity: ['warn', { max: 20 }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: [
      'build/**',
      'node_modules/**',
      'coverage/**',
      'dist/**',
      '.env',
      '.DS_Store',
      'stats.json',
    ],
  },
];
