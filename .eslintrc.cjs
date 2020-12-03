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
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/jsx-filename-extension': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'implicit-arrow-linebreak': 'off',
    'no-else-return': ['error', { allowElseIf: true }],
    'import/extensions': ['error', 'always'],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
};
