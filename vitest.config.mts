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
        // Date math depends on the local timezone, so pin it to one with US DST rules.
        env: {
            TZ: 'America/New_York',
        },
    },
});
