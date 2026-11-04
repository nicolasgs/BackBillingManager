import app from './app'
import { AppDataSource } from './bootstrap/database'
import { env } from './config/env'
import { receiptPdfService } from './modules/receipts/receipt-pdf.service'

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected')

    const server = app.listen(env.PORT, () => {
      console.log(`BackBillingManager running on port ${env.PORT}`)
    })

    let shuttingDown = false

    const shutdown = async (signal: string) => {
      if (shuttingDown) {
        return
      }

      shuttingDown = true

      console.log(`Received ${signal}. Shutting down BackBillingManager...`)

      let failed = false

      try {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error)
              return
            }

            resolve()
          })
        })
      } catch (error) {
        failed = true
        console.error('HTTP server shutdown error:', error)
      }

      try {
        await receiptPdfService.close()
      } catch (error) {
        failed = true
        console.error('PDF service shutdown error:', error)
      }

      try {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy()
        }
      } catch (error) {
        failed = true
        console.error('Database shutdown error:', error)
      }

      if (failed) {
        process.exitCode = 1
      }

      console.log('BackBillingManager shutdown complete')
    }

    process.once('SIGTERM', () => {
      void shutdown('SIGTERM')
    })

    process.once('SIGINT', () => {
      void shutdown('SIGINT')
    })
  })
  .catch((error) => {
    console.error('Database connection error:', error)
    process.exitCode = 1
  })
