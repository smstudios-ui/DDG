import { defineConfig } from 'vite';

export default defineConfig({
  // Root is already current directory
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
        pricing: 'pricing.html',
        project: 'project.html'
      }
    }
  },
  server: {
    port: 3000
  }
});
