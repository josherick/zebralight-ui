module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'implicit-arrow-linebreak': 'off',
    'no-else-return': ['error', { allowElseIf: true }],
  },
};
