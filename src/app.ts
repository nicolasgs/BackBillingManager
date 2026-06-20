import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes'
import { errorMiddleware } from './middlewares/error.middleware'
import { setupSwagger } from './bootstrap/swagger'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
setupSwagger(app)

app.use('/api/v1', routes)

app.use(errorMiddleware)

export default app