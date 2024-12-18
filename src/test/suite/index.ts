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
        const vitestInstance = await startVitest('test', [], {
            watch: false,
            update: false,
            ui: false,
            reporters: ['default'],
            include: ['**/**.test.ts'],
            root: path.resolve(__dirname, '.')
        });

        if (!vitestInstance) {
            throw new Error('Failed to initialize Vitest');
        }

        // Run tests and wait for completion
        await vitestInstance.start();

        // Clean up
        await vitestInstance.close();
    } catch (err) {
        if (err instanceof Error) {
            throw err;
        }
        throw new Error('Test execution failed');
    }
}
