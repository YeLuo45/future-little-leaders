import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://fxgppxgpnkvf.sealoshzh.site/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 500, // V27: Lower warning limit for better visibility
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // V27: Rollup manual chunks for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // V27: Vendor chunk separation
          'vendor-vue': ['vue', '@vue/runtime-core', '@vue/shared'],
          'vendor-echarts': ['echarts', 'echarts-for-uniapp'],
          'vendor-pinia': ['pinia'],
          // V27: Separate large dependencies
          'vendor-charts': ['@visactor/vchart'],
        }
      }
    }
  }
})
