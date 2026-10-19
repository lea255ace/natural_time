import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        // Matches `baseUrl: 'app'` in tsconfig.json for the modules under test.
        alias: [
            { find: /^types\//, replacement: fileURLToPath(new URL('./app/types/', import.meta.url)) },
        ],
    },
    test: {
        include: ['app/**/*.test.ts'],
        // The code should use the configured location's time zone, never the machine's. Pin the machine to one that
        // none of the tests use, so any accidental use of it fails.
        env: {
            TZ: 'Asia/Tokyo',
        },
    },
});
