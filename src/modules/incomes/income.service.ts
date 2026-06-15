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
import { PeriodLockService } from '../monthly-closings/services/period-lock.service'
import { AuditLogService } from '../audit-logs/audit-log.service'
import {
  AuditAction,
  AuditEntityType
} from '../../shared/enums'

export class IncomeService {
    constructor(
        private readonly incomeRepository = new IncomeRepository(),
        private readonly categoryRepository = new BillingCategoryRepository(),
        private readonly paymentMethodRepository = new PaymentMethodTypeRepository(),
        private readonly periodLockService = new PeriodLockService(),
        private readonly auditLogService = new AuditLogService()
    ) {}

    async create(payload: CreateIncomeDto) {
        const category = await this.categoryRepository.findByIdAndCompanyAndType({
        id: payload.categoryId,
        companyId: payload.companyId,
        type: BillingCategoryType.INCOME,
        })

        await this.periodLockService.validateOpenPeriod(
        payload.companyId,
        payload.incomeDate
        )

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

        const incomeEntity  = this.incomeRepository.createEntity({
        ...payload,
        amount: Number(Number(payload.amount).toFixed(2)),
        })

        const income = this.incomeRepository.save(incomeEntity)

         await this.auditLogService.log({
            companyId: incomeEntity .companyId,
            companyPublicId: incomeEntity .companyPublicId,

            entityType: AuditEntityType.INCOME,
            entityId: incomeEntity .id,
            entityPublicId: incomeEntity .publicId,

            action: AuditAction.CREATE,

            newValues: incomeEntity ,

            authContext: {
                userId: incomeEntity .createdBy ?? null,
                companyId: incomeEntity .companyId,
                companyPublicId: incomeEntity .companyPublicId ?? null,
            },
        })   

        return income 
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

        const originalIncome = {
            ...income,
        }

        const transactionDate = payload.incomeDate ?? income.incomeDate

        await this.periodLockService.validateOpenPeriod(
            income.companyId,
            transactionDate
        )

        const normalizedPayload = {
            ...payload,
            amount:
            payload.amount !== undefined
                ? Number(Number(payload.amount).toFixed(2))
                : undefined,
        }

        Object.assign(income, normalizedPayload)

        const updatedIncome = await this.incomeRepository.save(income)

        await this.auditLogService.log({
            companyId: updatedIncome.companyId,
            companyPublicId: updatedIncome.companyPublicId,

            entityType: AuditEntityType.INCOME,
            entityId: updatedIncome.id,
            entityPublicId: updatedIncome.publicId,

            action: AuditAction.UPDATE,

            oldValues: originalIncome,
            newValues: updatedIncome,

            authContext: {
            userId: updatedIncome.createdBy ?? null,
            companyId: updatedIncome.companyId,
            companyPublicId: updatedIncome.companyPublicId ?? null,
            },
        })

        return updatedIncome
    }

    async softDelete(publicId: string) {
        const income = await this.findByPublicId(publicId)

        await this.periodLockService.validateOpenPeriod(
            income.companyId,
            income.incomeDate
        )

        await this.incomeRepository.softDeleteById(income.id)

        await this.auditLogService.log({
            companyId: income.companyId,
            companyPublicId: income.companyPublicId,

            entityType: AuditEntityType.INCOME,
            entityId: income.id,
            entityPublicId: income.publicId,

            action: AuditAction.DELETE,

            oldValues: income,

            authContext: {
            userId: income.createdBy ?? null,
            companyId: income.companyId,
            companyPublicId: income.companyPublicId ?? null,
            },
        })

        return {
            publicId: income.publicId,
            deleted: true,
        }
    }
}