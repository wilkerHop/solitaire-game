import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enforce explicit return types on functions
      '@typescript-eslint/explicit-function-return-type': 'error',
      // No any type allowed
      '@typescript-eslint/no-explicit-any': 'error',
      // Require explicit member accessibility
      '@typescript-eslint/explicit-member-accessibility': 'error',
      // Prefer readonly for immutability
      '@typescript-eslint/prefer-readonly': 'error',
      // Ensure promises are handled
      '@typescript-eslint/no-floating-promises': 'error',
      // Require await in async functions
      '@typescript-eslint/require-await': 'error',
    },
  },
])
