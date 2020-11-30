module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb'],
  parser: 'babel-eslint',
  plugins: ['react', 'flowtype'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'react/jsx-filename-extension': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'implicit-arrow-linebreak': 'off',
    'no-else-return': ['error', { allowElseIf: true }],
    'import/extensions': ['error', 'never'],
  },
};
