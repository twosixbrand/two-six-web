const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
    moduleNameMapper: {
        // Handle module aliases (this will be automatically configured for you soon)
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    // Enable coverage reporting
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/layout.tsx',
        '!src/components/ui/**', // Exclude shadcn UI from total coverage
        '!src/data/**', // Static configuration and dummy data
        '!src/lib/**', // Library utilities and server actions
        '!src/services/**', // Ext API call wrappers
        '!src/types/**', // TS Types
        '!src/app/orders/**', // Unfinished page
        '!src/app/outlet/**', // Unfinished page
        '!src/app/profile/**', // Unfinished page
        '!src/app/tracking/**', // Unfinished page
        '!src/app/contact/actions.ts', // Server action
        '!src/components/CartContext.tsx', // Empty duplicate file
    ],
    coverageReporters: ['text', 'lcov', 'json-summary'],
    coverageThreshold: {
        global: {
            branches: 65,
            functions: 65,
            lines: 80,
            statements: 80,
        },
    },
    coverageProvider: 'v8',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
