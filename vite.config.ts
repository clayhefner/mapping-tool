import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['jsonpath'],
  },
  build: {
    commonjsOptions: {
      include: [/jsonpath/, /node_modules/],
    },
  },
});
