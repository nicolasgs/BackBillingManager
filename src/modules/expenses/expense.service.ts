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

export class ExpenseService {
    constructor(
        private readonly expenseRepository = new ExpenseRepository(),
        private readonly categoryRepository = new BillingCategoryRepository(),
        private readonly paymentMethodRepository = new PaymentMethodTypeRepository(),
        private readonly vendorRepository = new VendorRepository(),
        private readonly periodLockService = new PeriodLockService()
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

        const expense = this.expenseRepository.createEntity({
        ...payload,
        vendorName,
        vendorPublicId,
        amount: Number(Number(payload.amount).toFixed(2)),
        })

        return this.expenseRepository.save(expense)
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

        return this.expenseRepository.save(expense)
    }

    async softDelete(publicId: string) {
        const expense = await this.findByPublicId(publicId)

        await this.periodLockService.validateOpenPeriod(
        expense.companyId,
        expense.expenseDate
        )

        await this.expenseRepository.softDeleteById(expense.id)

        return {
        publicId: expense.publicId,
        deleted: true,
        }
    }
}