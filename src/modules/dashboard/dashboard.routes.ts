import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { DashboardController } from './dashboard.controller'
import { dashboardQuerySchema } from './dashboard.schemas'

const router = Router()
const controller = new DashboardController()

router.get(
  '/summary',
  validate(dashboardQuerySchema, 'query'),
  controller.summary
)

router.get(
  '/by-category',
  validate(dashboardQuerySchema, 'query'),
  controller.byCategory
)

router.get(
  '/monthly-trend',
  validate(dashboardQuerySchema, 'query'),
  controller.monthlyTrend
)

router.get(
  '/top-vendors',
  validate(dashboardQuerySchema, 'query'),
  controller.topVendors
)

router.get(
  '/top-income-categories',
  validate(dashboardQuerySchema, 'query'),
  controller.topIncomeCategories
)

router.get(
  '/top-expense-categories',
  validate(dashboardQuerySchema, 'query'),
  controller.topExpenseCategories
)

export default router