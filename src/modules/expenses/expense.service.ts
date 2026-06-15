import { ApiError } from '../../shared/errors'
import { BillingCategoryType } from '../../shared/enums'
import { BillingCategoryRepository } from '../billing-categories/billing-category.repository'
import { PaymentMethodTypeRepository } from '../payment-method-type/payment-method-type.repository'
import { VendorRepository } from '../vendors/vendor.repository'
import {
    CreateExpenseDto,
    ListExpensesQueryDto,
    UpdateExpenseDto,
} from './dto/expense.dto'
import { ExpenseRepository } from './expense.repository'
import { PeriodLockService } from '../monthly-closings/services/period-lock.service'
import { AuditLogService } from '../audit-logs/audit-log.service'
import {
  AuditAction,
  AuditEntityType
} from '../../shared/enums'

export class ExpenseService {
    constructor(
        private readonly expenseRepository = new ExpenseRepository(),
        private readonly categoryRepository = new BillingCategoryRepository(),
        private readonly paymentMethodRepository = new PaymentMethodTypeRepository(),
        private readonly vendorRepository = new VendorRepository(),
        private readonly periodLockService = new PeriodLockService(),
        private readonly auditLogService = new AuditLogService()
    ) {}

   async create(payload: CreateExpenseDto) {
        const category = await this.categoryRepository.findByIdAndCompanyAndType({
            id: payload.categoryId,
            companyId: payload.companyId,
            type: BillingCategoryType.EXPENSE,
        })

        await this.periodLockService.validateOpenPeriod(
            payload.companyId,
            payload.expenseDate
        )

        if (!category) {
            throw new ApiError(
            400,
            'INVALID_EXPENSE_CATEGORY',
            'Invalid expense category'
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

        let vendorName = payload.vendorName ?? null
        let vendorPublicId = payload.vendorPublicId ?? null

        if (payload.vendorId) {
            const vendor = await this.vendorRepository.findByIdAndCompany({
            id: payload.vendorId,
            companyId: payload.companyId,
            })

            if (!vendor) {
            throw new ApiError(400, 'INVALID_VENDOR', 'Invalid vendor')
            }

            vendorName = vendor.name
            vendorPublicId = vendor.publicId
        }

        const expenseEntity = this.expenseRepository.createEntity({
            ...payload,
            vendorName,
            vendorPublicId,
            amount: Number(Number(payload.amount).toFixed(2)),
        })

        const expense = await this.expenseRepository.save(expenseEntity)

        await this.auditLogService.log({
            companyId: expense.companyId,
            companyPublicId: expense.companyPublicId,

            entityType: AuditEntityType.EXPENSE,
            entityId: expense.id,
            entityPublicId: expense.publicId,

            action: AuditAction.CREATE,

            newValues: expense,

            authContext: {
            userId: expense.createdBy ?? null,
            companyId: expense.companyId,
            companyPublicId: expense.companyPublicId ?? null,
            },
        })

        return expense
    }

    async findAll(filters: ListExpensesQueryDto) {
        return this.expenseRepository.findAll(filters)
    }

    async findByPublicId(publicId: string) {
        const expense = await this.expenseRepository.findByPublicId(publicId)

        if (!expense) {
        throw new ApiError(404, 'EXPENSE_NOT_FOUND', 'Expense not found')
        }

        return expense
    }

    async update(publicId: string, payload: UpdateExpenseDto) {
        const expense = await this.findByPublicId(publicId)

        const originalExpense = {
            ...expense,
        }

        const transactionDate = payload.expenseDate ?? expense.expenseDate

        await this.periodLockService.validateOpenPeriod(
            expense.companyId,
            transactionDate
        )

        const normalizedPayload = {
            ...payload,
            amount:
            payload.amount !== undefined
                ? Number(Number(payload.amount).toFixed(2))
                : undefined,
        }

        Object.assign(expense, normalizedPayload)

        const updatedExpense = await this.expenseRepository.save(expense)

        await this.auditLogService.log({
            companyId: updatedExpense.companyId,
            companyPublicId: updatedExpense.companyPublicId,

            entityType: AuditEntityType.EXPENSE,
            entityId: updatedExpense.id,
            entityPublicId: updatedExpense.publicId,

            action: AuditAction.UPDATE,

            oldValues: originalExpense,
            newValues: updatedExpense,

            authContext: {
            userId: updatedExpense.createdBy ?? null,
            companyId: updatedExpense.companyId,
            companyPublicId: updatedExpense.companyPublicId ?? null,
            },
        })

        return updatedExpense
    }

    async softDelete(publicId: string) {
        const expense = await this.findByPublicId(publicId)

        await this.periodLockService.validateOpenPeriod(
            expense.companyId,
            expense.expenseDate
        )

        await this.expenseRepository.softDeleteById(expense.id)

        await this.auditLogService.log({
            companyId: expense.companyId,
            companyPublicId: expense.companyPublicId,

            entityType: AuditEntityType.EXPENSE,
            entityId: expense.id,
            entityPublicId: expense.publicId,

            action: AuditAction.DELETE,

            oldValues: expense,

            authContext: {
            userId: expense.createdBy ?? null,
            companyId: expense.companyId,
            companyPublicId: expense.companyPublicId ?? null,
            },
        })

        return {
            publicId: expense.publicId,
            deleted: true,
        }
    }
}