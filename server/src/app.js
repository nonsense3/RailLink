import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { config } from './config/env.js'

import authRouter from './routes/auth.js'
import sectionsRouter from './routes/sections.js'
import defectsRouter from './routes/defects.js'
import blocksRouter from './routes/blocks.js'
import plansRouter from './routes/plans.js'
import analyticsRouter from './routes/analytics.js'
import syncRouter from './routes/sync.js'
import simulatorsRouter from './routes/simulators.js'
import railwayRouter from './routes/railway.js'
import uploadRouter from './routes/upload.js'
import aiRouter from './routes/ai.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(morgan('dev'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RailLink Express API Gateway',
    environment: config.nodeEnv,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Route Handlers
app.use('/api/auth', authRouter)
app.use('/api/sections', sectionsRouter)
app.use('/api/defects', defectsRouter)
app.use('/api/blocks', blocksRouter)
app.use('/api/plans', plansRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/sync', syncRouter)
app.use('/api/sim', simulatorsRouter)
app.use('/api/railway', railwayRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/ai', aiRouter)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve built frontend assets if present (Render / Monorepo deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist')
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[RailLink API Error]:', err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  })
})

// Start server (only if not running in serverless / Vercel environment)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚆 RailLink API Gateway running on port ${config.port} [${config.nodeEnv}]`)
    console.log(`🔗 Health check available at: http://localhost:${config.port}/api/health`)
  })
}

export default app
