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
import { AuthContext } from '../audit-logs/interfaces/auth-context.interface'
import { IncomeFilters } from './interfaces/income-filters.interface'

export class IncomeService {
    constructor(
        private readonly incomeRepository = new IncomeRepository(),
        private readonly categoryRepository = new BillingCategoryRepository(),
        private readonly paymentMethodRepository = new PaymentMethodTypeRepository(),
        private readonly periodLockService = new PeriodLockService(),
        private readonly auditLogService = new AuditLogService()
    ) {}

    async create(payload: CreateIncomeDto, authContext?: AuthContext) {
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

        const incomeEntity = this.incomeRepository.createEntity({
            ...payload,
            amount: Number(Number(payload.amount).toFixed(2)),
        })

        const income = await this.incomeRepository.save(incomeEntity)

        await this.auditLogService.log({
            companyId: income.companyId,
            companyPublicId: income.companyPublicId,

            entityType: AuditEntityType.INCOME,
            entityId: income.id,
            entityPublicId: income.publicId,

            action: AuditAction.CREATE,

            newValues: income,

            authContext,
        })

        return income
    }

    async findAll(filters: IncomeFilters) {
        return this.incomeRepository.findAll(filters)
    }

    async findByPublicId(publicId: string, companyId: number) {
        const income = await this.incomeRepository.findByPublicId(publicId)

        if (!income || income.companyId !== companyId) {
            throw new ApiError(
            404,
            'INCOME_NOT_FOUND',
            'Income not found'
            )
        }

        return income
    }

    async update(
        publicId: string,
        payload: UpdateIncomeDto,
        companyId: number,
        authContext?: AuthContext
        ) {
        const income = await this.findByPublicId(publicId, companyId)

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
            authContext,
        })

        return updatedIncome
    }

    async softDelete(
        publicId: string,
        companyId: number,
        authContext?: AuthContext
        ) {
        const income = await this.findByPublicId(publicId, companyId)

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
            authContext,
        })

        return {
            publicId: income.publicId,
            deleted: true,
        }
    }
}