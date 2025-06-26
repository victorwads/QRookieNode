import globals from "globals";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "node_modules/",
      "build/",
      "dist/",
      ".craco/",
      "public/",
      "eslint.config.mjs",
      "craco.config.ts",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/*.spec.ts",
      "src/**/*.spec.tsx",
    ],
  },
  // Configuration for React code (src/react)
  {
    files: ["src/**/*.{js,jsx,ts,tsx}", "!src/server/**/*"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs["eslint-recommended"].rules,
      ...tsPlugin.configs["recommended-requiring-type-checking"]?.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      eqeqeq: "error",
      "import/first": "error",
      "import/no-duplicates": "error",
      "no-unused-vars": "off",
      "prettier/prettier": "warn",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {},
      },
    },
  },
  // Configuration for Server code (src/server)
  {
    files: ["src/server/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.server.json",
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs["eslint-recommended"].rules,
      ...tsPlugin.configs["recommended-requiring-type-checking"]?.rules,
      ...prettierConfig.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      eqeqeq: "error",
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "no-unused-vars": "off",
      "prettier/prettier": "warn",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.server.json",
        },
      },
    },
  },
];
