import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The folder the site is served from. "/" locally; the GitHub Pages deploy sets
  // BASE_PATH=/training-repo/ because the site lives at <user>.github.io/training-repo/.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // The page tests render the whole app in jsdom. On a busy machine or a slow CI runner
    // that can pass the 5 s default, so give them room.
    testTimeout: 15_000,
  },
})
