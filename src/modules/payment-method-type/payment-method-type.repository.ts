import { IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { PaymentMethodTypeEntity } from './payment-method-type.entity'

export class PaymentMethodTypeRepository {
  private readonly repository =
    AppDataSource.getRepository(PaymentMethodTypeEntity)

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
        code: code.toUpperCase(),
        deletedAt: IsNull(),
      },
    })
  }

  findByCodeIncludingDeleted(code: string) {
    return this.repository.findOne({
      where: {
        code: code.toUpperCase(),
      },
      withDeleted: true,
    })
  }

  async restoreByCode(code: string) {
    await this.repository.restore(code.toUpperCase())
  }

  softDeleteByCode(code: string) {
    return this.repository.softDelete(code.toUpperCase())
  }
}