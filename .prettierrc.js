// Some settings automatically inherited from .editorconfig

module.exports = {
  // Why include an unnecessary character at the end of every line? Break the habit (automatically)!
  semi: true,
  // Trailing commas help with git merging and conflict resolution
  trailingComma: 'all',
  singleQuote: true,
  bracketSpacing: true,
  endOfLine: 'lf',
  printWidth: 120,
  overrides: [
    {
      files: '.editorconfig',
      options: { parser: 'yaml' },
    },
    {
      files: 'LICENSE',
      options: { parser: 'markdown' },
    },
  ],
};
