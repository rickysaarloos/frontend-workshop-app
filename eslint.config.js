import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Markeert variabelen die alléén in JSX voorkomen als "gebruikt" — zoals
      // `motion` in <motion.div> of een als prop doorgegeven component `Icon`.
      // Zonder deze regel geeft no-unused-vars daar onterechte fouten op.
      'react/jsx-uses-vars': 'error',
    },
  },
  {
    // Build-/configbestanden draaien in Node, niet in de browser (bv. __dirname).
    files: ['*.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
