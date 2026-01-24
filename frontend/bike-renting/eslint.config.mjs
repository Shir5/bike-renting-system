import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,

  {
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": "error",

      // запрет any
      "@typescript-eslint/no-explicit-any": "error",

      // неиспользуемые переменные/аргументы
      // (импорты будут подхватываться как "использованные/неиспользованные" на уровне no-unused-vars)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },

  {
    ignores: ["node_modules/", "dist/", "build/", ".expo/", "coverage/"],
  },
];
