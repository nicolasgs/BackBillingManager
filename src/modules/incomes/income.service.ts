import { ApiError } from '../../shared/errors'
import { BillingCategoryType } from '../../shared/enums'
import { BillingCategoryRepository } from '../billing-categories/billing-category.repository'
import { PaymentMethodTypeRepository } from '../payment-method-type/payment-method-type.repository'
import { IncomeEntity } from './income.entity'
import { IncomeRepository } from './income.repository'
import {
    CreateIncomeDto,
    ListIncomesQueryDto,
    UpdateIncomeDto,
} from './dto/income.dto'

export class IncomeService {
    constructor(
        private readonly incomeRepository = new IncomeRepository(),
        private readonly categoryRepository = new BillingCategoryRepository(),
        private readonly paymentMethodRepository = new PaymentMethodTypeRepository()
    ) {}

    async create(payload: CreateIncomeDto) {
        const category = await this.categoryRepository.findByIdAndCompanyAndType({
        id: payload.categoryId,
        companyId: payload.companyId,
        type: BillingCategoryType.INCOME,
        })

        if (!category) {
        throw new ApiError(
            400,
            'INVALID_INCOME_CATEGORY',
            'Invalid income category'
        )
        }

        const paymentMethod = await this.paymentMethodRepository.findByCode(
        payload.paymentMethodCode
        )

        if (!paymentMethod) {
        throw new ApiError(
            400,
            'INVALID_PAYMENT_METHOD',
            'Invalid payment method'
        )
        }

        const income = this.incomeRepository.createEntity({
        ...payload,
        amount: Number(Number(payload.amount).toFixed(2)),
        })

        return this.incomeRepository.save(income)
    }

    async findAll(filters: ListIncomesQueryDto) {
        return this.incomeRepository.findAll(filters)
    }

    async findByPublicId(publicId: string) {
        const income = await this.incomeRepository.findByPublicId(publicId)

        if (!income) {
        throw new ApiError(404, 'INCOME_NOT_FOUND', 'Income not found')
        }

        return income
    }

    async update(publicId: string, payload: UpdateIncomeDto) {
        const income = await this.findByPublicId(publicId)

        const normalizedPayload = {
            ...payload,
            amount:
                payload.amount !== undefined
                ? Number(Number(payload.amount).toFixed(2))
                : undefined,
            }

        Object.assign(income, normalizedPayload)

        return this.incomeRepository.save(income)
    }

    async softDelete(publicId: string) {
        const income = await this.findByPublicId(publicId)

        await this.incomeRepository.softDeleteById(income.id)

        return {
        publicId: income.publicId,
        deleted: true,
        }
    }
}