import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:3201',
      '/uploads': 'http://localhost:3201'
    }
  },
  build: {
    // 设置构建目标为更兼容的浏览器版本
    target: 'es2015',
    // 确保CSS也兼容旧版浏览器
    cssTarget: 'chrome61',
    rollupOptions: {
      output: {
        // 使用时间戳确保文件名始终改变
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  }
})
