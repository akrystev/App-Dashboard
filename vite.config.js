import { defineConfig } from 'vite'

export default defineConfig({
    root: '.',
    server: {
        port: 5173,
        open: true
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]'
            }
        }
    }
})
