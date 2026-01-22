import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 3000,
        proxy: {
            '/auth-service': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/auth-service/, '')
            },
            '/invocation-service': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/invocation-service/, '')
            }
        }
    }
})
