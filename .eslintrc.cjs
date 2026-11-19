module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist/"],
  overrides: [
    { files: ["**/*.cjs"], env: { browser: false, node: true } },
    {
      files: ["tests/**/*.test.ts"],
      env: { browser: false, node: true, jest: true },
    },
  ],
};
