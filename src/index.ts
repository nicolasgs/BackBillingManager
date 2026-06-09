import app from './app'
import { env } from './config/env'
import { AppDataSource } from './bootstrap/database'

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected')

    app.listen(env.PORT, () => {
      console.log(`BackBillingManager running on port ${env.PORT}`)
    })
  })
  .catch((error) => {
    console.error('Database connection error:', error)
  })