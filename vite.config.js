import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative assets keep the React build portable on simple static hosting.
  base: './',
  plugins: [react()],
  server: {
    // Em desenvolvimento, o Vite faz proxy das chamadas de API para o backend
    // Fastify (porta 3333). O browser enxerga tudo na mesma origem (5173),
    // o que elimina problemas de CORS e garante que cookies HttpOnly
    // (refresh token) funcionem corretamente sem configuração extra.
    proxy: {
      '/auth': 'http://localhost:3333',
      '/user': 'http://localhost:3333',
    },
  },
  build: {
    outDir: 'dist-react',
    rollupOptions: {
      input: {
        app: 'app.html',
        react: 'react.html'
      }
    }
  }
});
