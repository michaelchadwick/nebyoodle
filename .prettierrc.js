'use strict';

module.exports = {
  overrides: [
    {
      files: '*.{js,ts}',
      options: {
        semi: false,
        singleQuote: true,
        printWidth: 100,
        trailingComma: 'es5',
      },
    },
  ],
};
