import { ApiError } from '../../shared/errors'
import { ClosingItemType, ClosingStatus } from '../../shared/enums'
import {
    CloseMonthlyClosingDto,
    CreateMonthlyClosingDto,
    ListMonthlyClosingsQueryDto,
    ReopenMonthlyClosingDto,
} from './dto/monthly-closing.dto'
import { MonthlyClosingRepository } from './monthly-closing.repository'

export class MonthlyClosingService {
    constructor(
        private readonly repository = new MonthlyClosingRepository()
    ) {}

    async create(payload: CreateMonthlyClosingDto) {
        const existing = await this.repository.findExistingPeriod(
        payload.companyId,
        payload.year,
        payload.month
        )

        if (existing) {
        throw new ApiError(
            409,
            'MONTHLY_CLOSING_ALREADY_EXISTS',
            'Monthly closing already exists for this company and period'
        )
        }

        const closing = this.repository.createEntity({
        ...payload,
        status: ClosingStatus.DRAFT,
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        })

        return this.repository.save(closing)
    }

    async findAll(filters: ListMonthlyClosingsQueryDto) {
        return this.repository.findAll(filters as any)
    }

    async findByPublicId(publicId: string) {
        const closing = await this.repository.findByPublicId(publicId)

        if (!closing) {
        throw new ApiError(404, 'MONTHLY_CLOSING_NOT_FOUND', 'Monthly closing not found')
        }

        return closing
    }

    async close(publicId: string, payload: CloseMonthlyClosingDto) {
        const closing = await this.findByPublicId(publicId)

        if (closing.status === ClosingStatus.CLOSED) {
        throw new ApiError(400, 'MONTHLY_CLOSING_ALREADY_CLOSED', 'Monthly closing is already closed')
        }

        const incomes = await this.repository.findPaidIncomesForPeriod(
        closing.companyId,
        closing.year,
        closing.month
        )

        const expenses = await this.repository.findPaidExpensesForPeriod(
        closing.companyId,
        closing.year,
        closing.month
        )

        const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0)
        const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
        const netAmount = totalIncome - totalExpense

        await this.repository.deleteItemsByClosingId(closing.id)

        const incomeItems = incomes.map((income) => ({
        monthlyClosingId: closing.id,
        companyId: closing.companyId,
        companyPublicId: closing.companyPublicId,
        entityType: ClosingItemType.INCOME,
        entityId: income.id,
        entityPublicId: income.publicId,
        amount: Number(income.amount),
        transactionDate: income.incomeDate,
        categoryId: income.categoryId,
        }))

        const expenseItems = expenses.map((expense) => ({
        monthlyClosingId: closing.id,
        companyId: closing.companyId,
        companyPublicId: closing.companyPublicId,
        entityType: ClosingItemType.EXPENSE,
        entityId: expense.id,
        entityPublicId: expense.publicId,
        amount: Number(expense.amount),
        transactionDate: expense.expenseDate,
        categoryId: expense.categoryId,
        }))

        const items = this.repository.createItems([...incomeItems, ...expenseItems])
        await this.repository.saveItems(items)

        closing.totalIncome = Number(totalIncome.toFixed(2))
        closing.totalExpense = Number(totalExpense.toFixed(2))
        closing.netAmount = Number(netAmount.toFixed(2))
        closing.status = ClosingStatus.CLOSED
        closing.closedBy = payload.closedBy
        closing.closedAt = new Date()

        return this.repository.save(closing)
    }

    async reopen(publicId: string, payload: ReopenMonthlyClosingDto) {
        const closing = await this.findByPublicId(publicId)

        if (closing.status !== ClosingStatus.CLOSED) {
        throw new ApiError(
            400,
            'MONTHLY_CLOSING_NOT_CLOSED',
            'Only closed monthly closings can be reopened'
        )
        }

        closing.status = ClosingStatus.REOPENED
        closing.notes = payload.notes ?? closing.notes

        return this.repository.save(closing)
    }
}