import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { ReportsController } from './reports.controller'
import { reportDateRangeQuerySchema } from './reports.schemas'

const router = Router()
const controller = new ReportsController()

router.get(
  '/profit-loss',
  validate(reportDateRangeQuerySchema, 'query'),
  controller.profitLoss
)

router.get(
  '/incomes/export',
  validate(reportDateRangeQuerySchema, 'query'),
  controller.exportIncomes
)

router.get(
  '/expenses/export',
  validate(reportDateRangeQuerySchema, 'query'),
  controller.exportExpenses
)

export default router