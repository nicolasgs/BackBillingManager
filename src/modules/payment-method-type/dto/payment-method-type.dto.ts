import { z } from 'zod'
import {
  createPaymentMethodTypeSchema,
  updatePaymentMethodTypeSchema,
} from '../payment-method-type.schemas'

export type CreatePaymentMethodTypeDto = z.infer<
  typeof createPaymentMethodTypeSchema
>

export type UpdatePaymentMethodTypeDto = z.infer<
  typeof updatePaymentMethodTypeSchema
>