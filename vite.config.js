import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/fastcashC1-react/',
  plugins: [
    react(),
    nodePolyfills(),
    VitePWA({
      registerType: 'autoUpdate', 
      injectRegister: 'auto',
      includeAssets: ['logo-192.png', 'logo-512.png'], 
      manifest: {
        name: 'Rojas Super - Sistema POS',
        short_name: 'Rojas Super',
        description: 'Sistema de Punto de Venta y Gestión de Caja para Rojas Super',
        theme_color: '#111827', 
        background_color: '#f8fafc', 
        display: 'standalone', 
        orientation: 'portrait',
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' 
          }
        ]
      }
    })
  ]
});