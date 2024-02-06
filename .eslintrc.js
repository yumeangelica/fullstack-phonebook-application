module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'xo',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    indent: ['error', 2],
    eqeqeq: ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'block-spacing': ['error', 'always'],
    'arrow-spacing': [
      'error', { before: true, after: true },
    ],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-trailing-spaces': 'error',
    'no-console': 0,
    'capitalized-comments': [
      'error',
      'always',
      {
        ignorePattern: 'pragma|ignored',
        ignoreInlineComments: true,
        ignoreConsecutiveComments: true,
      },
    ],
    complexity: ['warn', { max: 40 }],
  },
};
