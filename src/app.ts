import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes'
import { errorMiddleware } from './middlewares/error.middleware'
import { notFoundMiddleware } from './middlewares/not-found.middleware'
import { env } from './config/env'

const app = express()

app.use(helmet())
const allowedOrigins = env.CORS_ORIGINS.split(',')

app.use(
  cors({
    origin(origin, callback) {
      // Permite herramientas como Postman o curl
      if (!origin) {
        return callback(null, true)
      }

      // Permite únicamente los dominios configurados
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(express.json())
if (
  env.NODE_ENV !== 'production' &&
  env.SWAGGER_ENABLED
) {
  // Swagger tooling is development-only. Keeping the require
  // inside this guard prevents production from loading optional
  // documentation dependencies.
  const { setupSwagger } =
    require('./bootstrap/swagger')

  setupSwagger(app)
}
app.use('/api/v1', routes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app