// @ts-check

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig({
	ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'],
	files: ['**/*.{js,ts}'],
	extends: [js.configs.recommended, tseslint.configs.recommended],
	rules: {
		'no-undef': 'off',
		'no-unused-vars': 'off',
		'no-tabs': 'off',
		indent: ['error', 'tab'],
		'no-prototype-builtins': 'off',
		'@typescript-eslint/no-use-before-define': [
			'error',
			{ functions: false, classes: false },
		],
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
	},
});
