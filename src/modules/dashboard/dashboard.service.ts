import { DashboardRepository } from './dashboard.repository'
import { DashboardFilters } from './interfaces/dashboard-filters.interface'

export class DashboardService {
  constructor(
    private readonly repository = new DashboardRepository()
  ) {}

  async getSummary(filters: DashboardFilters) {
    const [income, expense] = await Promise.all([
      this.repository.getIncomeSummary(filters),
      this.repository.getExpenseSummary(filters),
    ])

    const totalIncome = Number(income?.total || 0)
    const totalExpense = Number(expense?.total || 0)

    return {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      netAmount: Number((totalIncome - totalExpense).toFixed(2)),
      incomeCount: Number(income?.count || 0),
      expenseCount: Number(expense?.count || 0),
    }
  }

  async getByCategory(filters: DashboardFilters) {
    const [incomes, expenses] = await Promise.all([
      this.repository.getIncomesByCategory(filters),
      this.repository.getExpensesByCategory(filters),
    ])

    return {
      incomes: incomes.map((item) => ({
        categoryName: item.categoryName ?? 'Uncategorized',
        categoryType: item.categoryType ?? null,
        total: Number(item.total || 0),
        count: Number(item.count || 0),
      })),

      expenses: expenses.map((item) => ({
        categoryName: item.categoryName ?? 'Uncategorized',
        categoryType: item.categoryType ?? null,
        total: Number(item.total || 0),
        count: Number(item.count || 0),
      })),
    }
  }

  async getMonthlyTrend(filters: DashboardFilters) {
    const [incomes, expenses] = await Promise.all([
      this.repository.getMonthlyIncomeTrend(filters),
      this.repository.getMonthlyExpenseTrend(filters),
    ])

    const periods = new Map<
      string,
      {
        year: number
        month: number
        period: string
        income: number
        expense: number
        net: number
        incomeCount: number
        expenseCount: number
      }
    >()

    for (const item of incomes) {
      const year = Number(item.year)
      const month = Number(item.month)
      const income = Number(item.total || 0)
      const period = `${year}-${String(month).padStart(2, '0')}`

      periods.set(period, {
        year,
        month,
        period,
        income,
        expense: 0,
        net: income,
        incomeCount: Number(item.count || 0),
        expenseCount: 0,
      })
    }

    for (const item of expenses) {
      const year = Number(item.year)
      const month = Number(item.month)
      const expense = Number(item.total || 0)
      const period = `${year}-${String(month).padStart(2, '0')}`

      const current = periods.get(period) ?? {
        year,
        month,
        period,
        income: 0,
        expense: 0,
        net: 0,
        incomeCount: 0,
        expenseCount: 0,
      }

      current.expense = expense
      current.expenseCount = Number(item.count || 0)
      current.net = Number((current.income - expense).toFixed(2))

      periods.set(period, current)
    }

    return Array.from(periods.values())
      .map((item) => ({
        ...item,
        income: Number(item.income.toFixed(2)),
        expense: Number(item.expense.toFixed(2)),
        net: Number(item.net.toFixed(2)),
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  async getTopVendors(filters: DashboardFilters) {
    const rows = await this.repository.getTopVendors(filters)

    return rows.map((item) => ({
      vendorId:
        item.vendorId !== null && item.vendorId !== undefined
          ? Number(item.vendorId)
          : null,
      vendorName: item.vendorName ?? 'Unknown vendor',
      total: Number(item.total || 0),
      count: Number(item.count || 0),
    }))
  }

  async getTopIncomeCategories(filters: DashboardFilters) {
    const rows = await this.repository.getTopIncomeCategories(filters)

    return rows.map((item) => ({
      categoryName: item.categoryName ?? 'Uncategorized',
      categoryType: item.categoryType ?? null,
      total: Number(item.total || 0),
      count: Number(item.count || 0),
    }))
  }

  async getTopExpenseCategories(filters: DashboardFilters) {
    const rows = await this.repository.getTopExpenseCategories(filters)

    return rows.map((item) => ({
      categoryName: item.categoryName ?? 'Uncategorized',
      categoryType: item.categoryType ?? null,
      total: Number(item.total || 0),
      count: Number(item.count || 0),
    }))
  }
}