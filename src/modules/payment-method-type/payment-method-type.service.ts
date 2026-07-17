import { ApiError } from '../../shared/errors'
import {
  CreatePaymentMethodTypeDto,
  UpdatePaymentMethodTypeDto,
} from './dto/payment-method-type.dto'
import { PaymentMethodTypeRepository } from './payment-method-type.repository'

export class PaymentMethodTypeService {
  constructor(
    private readonly repository = new PaymentMethodTypeRepository()
  ) {}

  async create(payload: CreatePaymentMethodTypeDto) {
    const code = payload.code.trim().toUpperCase()

    const existing =
      await this.repository.findByCodeIncludingDeleted(code)

    if (existing && !existing.deletedAt) {
      throw new ApiError(
        409,
        'PAYMENT_METHOD_TYPE_ALREADY_EXISTS',
        'Payment method type already exists'
      )
    }

    if (existing?.deletedAt) {
      await this.repository.restoreByCode(code)

      existing.description = payload.description.trim()
      existing.deletedAt = null

      return this.repository.save(existing)
    }

    const paymentMethodType = this.repository.createEntity({
      code,
      description: payload.description.trim(),
    })

    return this.repository.save(paymentMethodType)
  }

  async findAll() {
    return this.repository.findAll()
  }

  async findByCode(code: string) {
    const normalizedCode = code.trim().toUpperCase()

    const paymentMethodType =
      await this.repository.findByCode(normalizedCode)

    if (!paymentMethodType) {
      throw new ApiError(
        404,
        'PAYMENT_METHOD_TYPE_NOT_FOUND',
        'Payment method type not found'
      )
    }

    return paymentMethodType
  }

  async update(
    code: string,
    payload: UpdatePaymentMethodTypeDto
  ) {
    const paymentMethodType = await this.findByCode(code)

    if (payload.description !== undefined) {
      paymentMethodType.description = payload.description.trim()
    }

    return this.repository.save(paymentMethodType)
  }

  async softDelete(code: string) {
    const paymentMethodType = await this.findByCode(code)

    await this.repository.softDeleteByCode(
      paymentMethodType.code
    )

    return {
      code: paymentMethodType.code,
      deleted: true,
    }
  }
}