import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
      '@services': path.resolve(__dirname, './src/app/services'),
      '@modules': path.resolve(__dirname, './src/app/modules'),
      '@shared': path.resolve(__dirname, './src/app/shared'),
      '@components': path.resolve(__dirname, './src/app/components'),
      '@models': path.resolve(__dirname, './src/app/models'),
      '@pipes': path.resolve(__dirname, './src/app/pipes'),
      '@stubs': path.resolve(__dirname, './src/app/stubs'),
      '@helpers': path.resolve(__dirname, './src/app/helpers'),
      '@interceptors': path.resolve(__dirname, './src/app/interceptors'),
      '@guards': path.resolve(__dirname, './src/app/guards'),
      'ng2-google-charts': path.resolve(__dirname, './src/app/stubs/ng2-google-charts.mock.ts'),
    },
  },
  optimizeDeps: {
    include: [
      '@angular/common',
      '@angular/core',
      'ng2-charts',
      'ngx-lottie',
      'rxjs',
      'tslib',
    ],
  },
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    css: false,
    server: {
      deps: {
        inline: [
          /(\/|\\)@angular(\/|\\)/,
          'ng2-google-charts',
          'ng2-charts',
          'ngx-lottie',
          'rxjs',
          'tslib',
        ],
      },
    },
  },
  ssr: {
    noExternal: [
      /(\/|\\)@angular(\/|\\)/,
      'ng2-google-charts',
      'ng2-charts',
      'ngx-lottie',
      'rxjs',
      'tslib',
    ],
  },
}));
