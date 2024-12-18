import * as path from 'path';
import { describe, test, expect } from 'vitest';

// Re-export test functions for use in test files
export { describe, test, expect };

// Export run function for VS Code test runner compatibility
export async function run(): Promise<void> {
    try {
        // Import Vitest node runner
        const { startVitest } = await import('vitest/node');

        // Create and configure Vitest instance
        const vitest = await startVitest('test', [], {
            watch: false,
            update: false,
            ui: false,
            api: true,
            reporters: ['default'],
            include: ['**/**.test.ts'],
            dir: path.resolve(__dirname, '.')
        });

        if (!vitest) {
            throw new Error('Failed to initialize Vitest');
        }

        // Run tests and check results
        await vitest.start();
        const failed = vitest.state.getCountOfFailedTests();

        if (failed > 0) {
            throw new Error(`${failed} tests failed`);
        }
    } catch (err) {
        if (err instanceof Error) {
            throw err;
        }
        throw new Error('Test execution failed');
    }
}
