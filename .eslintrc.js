module.exports = {
  env: {
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-shadow': 'off',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
  },
  plugins: [
    'mocha',
  ],
};
