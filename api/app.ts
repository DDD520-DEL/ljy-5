/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import booksRoutes from './routes/books.js'
import meetupsRoutes from './routes/meetups.js'
import traceRoutes from './routes/trace.js'
import reservationsRoutes from './routes/reservations.js'
import donationsRoutes from './routes/donations.js'

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/books', booksRoutes)
app.use('/api/meetups', meetupsRoutes)
app.use('/api/trace', traceRoutes)
app.use('/api/reservations', reservationsRoutes)
app.use('/api/donations', donationsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
