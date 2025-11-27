import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Garante que o process.env.API_KEY funcione no ambiente local se configurado
    'process.env': process.env
  }
});