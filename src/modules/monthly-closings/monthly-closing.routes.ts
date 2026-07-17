import { Router } from 'express'
import { injectAuthContextToBody } from '../../middlewares/inject-auth-context.middleware'
import { validate } from '../../middlewares/validation.middleware'
import { MonthlyClosingController } from './monthly-closing.controller'
import {
  closeMonthlyClosingSchema,
  createMonthlyClosingSchema,
  listMonthlyClosingsQuerySchema,
  monthlyClosingParamsSchema,
  reopenMonthlyClosingSchema,
} from './monthly-closing.schemas'

const router = Router()
const controller = new MonthlyClosingController()

router.post(
  '/',
  injectAuthContextToBody,
  validate(createMonthlyClosingSchema),
  controller.create
)

router.get(
  '/',
  validate(listMonthlyClosingsQuerySchema, 'query'),
  controller.findAll
)

router.get(
  '/:publicId',
  validate(monthlyClosingParamsSchema, 'params'),
  controller.findOne
)

router.post(
  '/:publicId/close',
  validate(monthlyClosingParamsSchema, 'params'),
  validate(closeMonthlyClosingSchema),
  controller.close
)

router.post(
  '/:publicId/reopen',
  validate(monthlyClosingParamsSchema, 'params'),
  validate(reopenMonthlyClosingSchema),
  controller.reopen
)

export default router