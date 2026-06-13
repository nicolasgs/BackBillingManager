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


const router = Router()

router.use('/health', healthRoutes)
router.use('/billing-categories', billingCategoryRoutes)
router.use('/payment-method-type', paymentMethodTypeRoutes)
router.use('/incomes', incomeRoutes)
router.use('/vendors', vendorRoutes)
router.use('/expenses', expenseRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/monthly-closings', monthlyClosingRoutes)
router.use('/audit-logs', auditLogRoutes)

export default router