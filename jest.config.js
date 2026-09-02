module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.test.ts'],
	testPathIgnorePatterns: [
		'/node_modules/',
		'/\\.d\\.ts$',
		'/__tests__/.+\\.js$',
	],
};
