import { Router } from 'express'
import { AppDataSource } from '../../bootstrap/database'
import { sendSuccess } from '../../shared/responses'

const router = Router()

router.get('/', (req, res) => {
    return sendSuccess({
        res,
        req,
        code: 'HEALTH_OK',
        message: 'BackBillingManager is running',
        data: {
        service: 'BackBillingManager',
        status: 'OK',
        },
    })
})

    router.get('/database', async (req, res, next) => {
    try {
        const isConnected = AppDataSource.isInitialized

        return sendSuccess({
        res,
        req,
        code: 'DATABASE_HEALTH_OK',
        message: 'Database health checked successfully',
        data: {
            connected: isConnected,
        },
        })
    } catch (error) {
        next(error)
    }
})

export default router