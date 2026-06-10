import { IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { PaymentMethodTypeEntity } from './payment-method-type.entity'

export class PaymentMethodTypeRepository {
    private repository = AppDataSource.getRepository(PaymentMethodTypeEntity)

    createEntity(payload: Partial<PaymentMethodTypeEntity>) {
        return this.repository.create(payload)
    }

    save(paymentMethodType: PaymentMethodTypeEntity) {
        return this.repository.save(paymentMethodType)
    }

    findAll() {
        return this.repository.find({
        where: {
            deletedAt: IsNull(),
        },
        order: {
            code: 'ASC',
        },
        })
    }

    findByCode(code: string) {
        return this.repository.findOne({
        where: {
            code,
            deletedAt: IsNull(),
        },
        })
    }

    softDeleteByCode(code: string) {
        return this.repository.softDelete(code)
    }
}