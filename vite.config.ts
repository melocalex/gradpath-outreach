import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { cpSync, createReadStream, existsSync, statSync } from 'node:fs'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(rootDir, 'data')

function serveTrackerData(): Plugin {
  return {
    name: 'gradpath-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? ''
        if (!raw.startsWith('/data/')) {
          next()
          return
        }
        const rel = decodeURIComponent(raw.slice('/data/'.length))
        if (!rel || rel.includes('\0') || rel.includes('..')) {
          res.statusCode = 400
          res.end('Bad path')
          return
        }
        const file = path.join(dataDir, rel)
        if (!file.startsWith(dataDir + path.sep) || !existsSync(file) || !statSync(file).isFile()) {
          res.statusCode = 404
          res.end('Not found')
          return
        }
        const ext = path.extname(file)
        const type =
          ext === '.json'
            ? 'application/json; charset=utf-8'
            : ext === '.md'
              ? 'text/markdown; charset=utf-8'
              : 'text/plain; charset=utf-8'
        res.setHeader('Content-Type', type)
        res.setHeader('Cache-Control', 'no-cache')
        createReadStream(file).pipe(res)
      })
    },
    closeBundle() {
      cpSync(dataDir, path.join(rootDir, 'dist', 'data'), { recursive: true })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), serveTrackerData()],
  resolve: {
    alias: {
      '@': path.join(rootDir, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4731,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4731,
    strictPort: true,
  },
})
