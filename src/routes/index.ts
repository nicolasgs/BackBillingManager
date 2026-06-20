import { Router } from 'express'
import healthRoutes from '../modules/health/health.routes'
import billingCategoryRoutes from '../modules/billing-categories/billing-category.routes'
import paymentMethodTypeRoutes from '../modules/payment-method-type/payment-method-type.routes'
import incomeRoutes from '../modules/incomes/income.routes'
import vendorRoutes from '../modules/vendors/vendor.routes'
import expenseRoutes from '../modules/expenses/expense.routes'
import dashboardRoutes from '../modules/dashboard/dashboard.routes'
import monthlyClosingRoutes from '../modules/monthly-closings/monthly-closing.routes'
import auditLogRoutes from '../modules/audit-logs/audit-log.routes'
import reportsRoutes from '../modules/report/reports.routes'

import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.use('/health', healthRoutes)

router.use(authMiddleware)

router.use('/vendors', authMiddleware, vendorRoutes)
router.use('/incomes', authMiddleware, incomeRoutes)
router.use('/expenses', authMiddleware, expenseRoutes)
router.use('/dashboard', authMiddleware, dashboardRoutes)
router.use('/reports', authMiddleware, reportsRoutes)
router.use('/audit-logs', authMiddleware, auditLogRoutes)
router.use('/monthly-closings', authMiddleware, monthlyClosingRoutes)
router.use('/billing-categories', authMiddleware, billingCategoryRoutes)
router.use('/payment-method-type', authMiddleware, paymentMethodTypeRoutes)








export default router