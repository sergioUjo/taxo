/** @type {import("prettier").Config} */
module.exports = {
  // Basic formatting options
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: "es5",
  printWidth: 80,
  endOfLine: "lf",

  // JSX specific options
  jsxSingleQuote: true,
  bracketSameLine: false,

  // Plugin configurations
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],

  // Import sorting configuration
  importOrder: [
    "^(react/(.*)$)|^(react$)", // React imports first
    "^(next/(.*)$)|^(next$)", // Next.js imports second
    "<THIRD_PARTY_MODULES>", // Third party modules
    "^@/(.*)$", // Absolute imports with @ alias
    "^[./]", // Relative imports
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,

  // File type overrides
  overrides: [
    {
      files: ["*.json", "*.jsonc"],
      options: {
        printWidth: 200,
      },
    },
    {
      files: ["*.md", "*.mdx"],
      options: {
        printWidth: 100,
        proseWrap: "always",
      },
    },
  ],
};
