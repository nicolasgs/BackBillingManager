import { Router } from 'express'
import { validate } from '../../middlewares/validation.middleware'
import { AuditLogController } from './audit-log.controller'
import { listAuditLogsQuerySchema } from './audit-log.schemas'

const router = Router()
const controller = new AuditLogController()

router.get('/', validate(listAuditLogsQuerySchema, 'query'), controller.findAll)

export default router