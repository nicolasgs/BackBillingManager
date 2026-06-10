import { Router } from 'express'
import healthRoutes from '../modules/health/health.routes'
import billingCategoryRoutes from '../modules/billing-categories/billing-category.routes'
import paymentMethodTypeRoutes from '../modules/payment-method-type/payment-method-type.routes'
import incomeRoutes from '../modules/incomes/income.routes'


const router = Router()

router.use('/health', healthRoutes)
router.use('/billing-categories', billingCategoryRoutes)
router.use('/payment-method-type', paymentMethodTypeRoutes)
router.use('/incomes', incomeRoutes)

export default router