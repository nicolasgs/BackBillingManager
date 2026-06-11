import { DashboardQueryDto } from './dto/dashboard.dto'
import { DashboardRepository } from './dashboard.repository'

export class DashboardService {
    constructor(
        private readonly repository = new DashboardRepository()
    ) {}

    async getSummary(filters: DashboardQueryDto) {
        const income = await this.repository.getIncomeSummary(filters)
        const expense = await this.repository.getExpenseSummary(filters)

        const totalIncome = Number(income.total || 0)
        const totalExpense = Number(expense.total || 0)

        return {
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        incomeCount: Number(income.count || 0),
        expenseCount: Number(expense.count || 0),
        }
    }

    async getByCategory(filters: DashboardQueryDto) {
        const incomes = await this.repository.getIncomesByCategory(filters)
        const expenses = await this.repository.getExpensesByCategory(filters)

        return {
        incomes: incomes.map((item) => ({
            categoryName: item.categoryName,
            categoryType: item.categoryType,
            total: Number(item.total || 0),
            count: Number(item.count || 0),
        })),
        expenses: expenses.map((item) => ({
            categoryName: item.categoryName,
            categoryType: item.categoryType,
            total: Number(item.total || 0),
            count: Number(item.count || 0),
        })),
        }
    }

    async getMonthlyTrend(filters: DashboardQueryDto) {
        const incomes = await this.repository.getMonthlyIncomeTrend(filters)
        const expenses = await this.repository.getMonthlyExpenseTrend(filters)

        const map = new Map<string, any>()

        for (const item of incomes) {
            const year = Number(item.year)
            const month = Number(item.month)
            const key = `${year}-${String(month).padStart(2, '0')}`

            map.set(key, {
            year,
            month,
            period: key,
            income: Number(item.total || 0),
            expense: 0,
            net: Number(item.total || 0),
            incomeCount: Number(item.count || 0),
            expenseCount: 0,
            })
        }

        for (const item of expenses) {
            const year = Number(item.year)
            const month = Number(item.month)
            const key = `${year}-${String(month).padStart(2, '0')}`

            const existing = map.get(key) || {
            year,
            month,
            period: key,
            income: 0,
            expense: 0,
            net: 0,
            incomeCount: 0,
            expenseCount: 0,
            }

            existing.expense = Number(item.total || 0)
            existing.expenseCount = Number(item.count || 0)
            existing.net = existing.income - existing.expense

            map.set(key, existing)
        }

        return Array.from(map.values()).sort((a, b) =>
            a.period.localeCompare(b.period)
        )
    }

    async getTopVendors(filters: DashboardQueryDto) {
        const rows = await this.repository.getTopVendors(filters)

        return rows.map((item) => ({
            vendorId: item.vendorId ? Number(item.vendorId) : null,
            vendorName: item.vendorName,
            total: Number(item.total || 0),
            count: Number(item.count || 0),
        }))
    }

    async getTopIncomeCategories(filters: DashboardQueryDto) {
        const rows = await this.repository.getTopIncomeCategories(filters)

        return rows.map((item) => ({
            categoryName: item.categoryName,
            categoryType: item.categoryType,
            total: Number(item.total || 0),
            count: Number(item.count || 0),
        }))
    }

    async getTopExpenseCategories(filters: DashboardQueryDto) {
        const rows = await this.repository.getTopExpenseCategories(filters)

        return rows.map((item) => ({
            categoryName: item.categoryName,
            categoryType: item.categoryType,
            total: Number(item.total || 0),
            count: Number(item.count || 0),
        }))
    }
}