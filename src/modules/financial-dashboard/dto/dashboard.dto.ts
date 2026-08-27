import { z } from 'zod'
import { dashboardQuerySchema } from '../dashboard.schemas'

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>