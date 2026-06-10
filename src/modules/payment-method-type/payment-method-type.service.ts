import { ApiError } from '../../shared/errors'
import { PaymentMethodTypeEntity } from './payment-method-type.entity'
import { PaymentMethodTypeRepository } from './payment-method-type.repository'

export class PaymentMethodTypeService {
    constructor(
        private readonly repository = new PaymentMethodTypeRepository()
    ) {}

    async create(payload: Partial<PaymentMethodTypeEntity>) {
        const existing = await this.repository.findByCode(payload.code!)

        if (existing) {
        throw new ApiError(
            409,
            'PAYMENT_METHOD_TYPE_ALREADY_EXISTS',
            'Payment method type already exists'
        )
        }

        const paymentMethodType = this.repository.createEntity(payload)

        return this.repository.save(paymentMethodType)
    }

    async findAll() {
        return this.repository.findAll()
    }

    async findByCode(code: string) {
        const paymentMethodType = await this.repository.findByCode(code)

        if (!paymentMethodType) {
        throw new ApiError(
            404,
            'PAYMENT_METHOD_TYPE_NOT_FOUND',
            'Payment method type not found'
        )
        }

        return paymentMethodType
    }

    async update(code: string, payload: Partial<PaymentMethodTypeEntity>) {
        const paymentMethodType = await this.findByCode(code)

        Object.assign(paymentMethodType, payload)

        return this.repository.save(paymentMethodType)
    }

    async softDelete(code: string) {
        const paymentMethodType = await this.findByCode(code)

        await this.repository.softDeleteByCode(paymentMethodType.code)

        return {
        code: paymentMethodType.code,
        deleted: true,
        }
    }
}