import { AppDataSource } from '../../bootstrap/database'
import { TransactionStatus } from '../../shared/enums'
import { ExpenseEntity } from '../expenses/expense.entity'
import { IncomeEntity } from '../incomes/income.entity'
import { DashboardQueryDto } from './dto/dashboard.dto'

export class DashboardRepository {
    private incomeRepository = AppDataSource.getRepository(IncomeEntity)
    private expenseRepository = AppDataSource.getRepository(ExpenseEntity)

    async getIncomeSummary(filters: DashboardQueryDto) {
        const query = this.incomeRepository
        .createQueryBuilder('income')
        .select('COALESCE(SUM(income.amount), 0)', 'total')
        .addSelect('COUNT(income.id)', 'count')
        .where('income.companyId = :companyId', { companyId: filters.companyId })
        .andWhere('income.deletedAt IS NULL')
        .andWhere('income.status = :status', { status: TransactionStatus.PAID })

        if (filters.fromDate) {
        query.andWhere('income.incomeDate >= :fromDate', {
            fromDate: filters.fromDate,
        })
        }

        if (filters.toDate) {
        query.andWhere('income.incomeDate <= :toDate', {
            toDate: filters.toDate,
        })
        }

        return query.getRawOne()
    }

    async getExpenseSummary(filters: DashboardQueryDto) {
        const query = this.expenseRepository
        .createQueryBuilder('expense')
        .select('COALESCE(SUM(expense.amount), 0)', 'total')
        .addSelect('COUNT(expense.id)', 'count')
        .where('expense.companyId = :companyId', { companyId: filters.companyId })
        .andWhere('expense.deletedAt IS NULL')
        .andWhere('expense.status = :status', { status: TransactionStatus.PAID })

        if (filters.fromDate) {
        query.andWhere('expense.expenseDate >= :fromDate', {
            fromDate: filters.fromDate,
        })
        }

        if (filters.toDate) {
        query.andWhere('expense.expenseDate <= :toDate', {
            toDate: filters.toDate,
        })
        }

        return query.getRawOne()
    }

    async getIncomesByCategory(filters: DashboardQueryDto) {
        const query = this.incomeRepository
        .createQueryBuilder('income')
        .leftJoin('income.category', 'category')
        .select('category.name', 'categoryName')
        .addSelect('category.type', 'categoryType')
        .addSelect('COALESCE(SUM(income.amount), 0)', 'total')
        .addSelect('COUNT(income.id)', 'count')
        .where('income.companyId = :companyId', { companyId: filters.companyId })
        .andWhere('income.deletedAt IS NULL')
        .andWhere('income.status = :status', { status: TransactionStatus.PAID })
        .groupBy('category.name')
        .addGroupBy('category.type')
        .orderBy('total', 'DESC')

        if (filters.fromDate) {
        query.andWhere('income.incomeDate >= :fromDate', {
            fromDate: filters.fromDate,
        })
        }

        if (filters.toDate) {
        query.andWhere('income.incomeDate <= :toDate', {
            toDate: filters.toDate,
        })
        }

        return query.getRawMany()
    }

    async getExpensesByCategory(filters: DashboardQueryDto) {
        const query = this.expenseRepository
        .createQueryBuilder('expense')
        .leftJoin('expense.category', 'category')
        .select('category.name', 'categoryName')
        .addSelect('category.type', 'categoryType')
        .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
        .addSelect('COUNT(expense.id)', 'count')
        .where('expense.companyId = :companyId', { companyId: filters.companyId })
        .andWhere('expense.deletedAt IS NULL')
        .andWhere('expense.status = :status', { status: TransactionStatus.PAID })
        .groupBy('category.name')
        .addGroupBy('category.type')
        .orderBy('total', 'DESC')

        if (filters.fromDate) {
        query.andWhere('expense.expenseDate >= :fromDate', {
            fromDate: filters.fromDate,
        })
        }

        if (filters.toDate) {
        query.andWhere('expense.expenseDate <= :toDate', {
            toDate: filters.toDate,
        })
        }

        return query.getRawMany()
    }


    async getMonthlyIncomeTrend(filters: DashboardQueryDto) {
        const query = this.incomeRepository
            .createQueryBuilder('income')
            .select("EXTRACT(YEAR FROM income.incomeDate)", 'year')
            .addSelect("EXTRACT(MONTH FROM income.incomeDate)", 'month')
            .addSelect('COALESCE(SUM(income.amount), 0)', 'total')
            .addSelect('COUNT(income.id)', 'count')
            .where('income.companyId = :companyId', { companyId: filters.companyId })
            .andWhere('income.deletedAt IS NULL')
            .andWhere('income.status = :status', { status: TransactionStatus.PAID })
            .groupBy("EXTRACT(YEAR FROM income.incomeDate)")
            .addGroupBy("EXTRACT(MONTH FROM income.incomeDate)")
            .orderBy("EXTRACT(YEAR FROM income.incomeDate)", 'ASC')
            .addOrderBy("EXTRACT(MONTH FROM income.incomeDate)", 'ASC')

        if (filters.fromDate) {
            query.andWhere('income.incomeDate >= :fromDate', {
            fromDate: filters.fromDate,
            })
        }

        if (filters.toDate) {
            query.andWhere('income.incomeDate <= :toDate', {
            toDate: filters.toDate,
            })
        }

        return query.getRawMany()
    }

    async getMonthlyExpenseTrend(filters: DashboardQueryDto) {
        const query = this.expenseRepository
            .createQueryBuilder('expense')
            .select("EXTRACT(YEAR FROM expense.expenseDate)", 'year')
            .addSelect("EXTRACT(MONTH FROM expense.expenseDate)", 'month')
            .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
            .addSelect('COUNT(expense.id)', 'count')
            .where('expense.companyId = :companyId', { companyId: filters.companyId })
            .andWhere('expense.deletedAt IS NULL')
            .andWhere('expense.status = :status', { status: TransactionStatus.PAID })
            .groupBy("EXTRACT(YEAR FROM expense.expenseDate)")
            .addGroupBy("EXTRACT(MONTH FROM expense.expenseDate)")
            .orderBy("EXTRACT(YEAR FROM expense.expenseDate)", 'ASC')
            .addOrderBy("EXTRACT(MONTH FROM expense.expenseDate)", 'ASC')

        if (filters.fromDate) {
            query.andWhere('expense.expenseDate >= :fromDate', {
            fromDate: filters.fromDate,
            })
        }

        if (filters.toDate) {
            query.andWhere('expense.expenseDate <= :toDate', {
            toDate: filters.toDate,
            })
        }

        return query.getRawMany()
    }

    async getTopVendors(filters: DashboardQueryDto) {
        const query = this.expenseRepository
            .createQueryBuilder('expense')
            .select('expense.vendorId', 'vendorId')
            .addSelect('expense.vendorName', 'vendorName')
            .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
            .addSelect('COUNT(expense.id)', 'count')
            .where('expense.companyId = :companyId', { companyId: filters.companyId })
            .andWhere('expense.deletedAt IS NULL')
            .andWhere('expense.status = :status', { status: TransactionStatus.PAID })
            .andWhere('expense.vendorName IS NOT NULL')
            .groupBy('expense.vendorId')
            .addGroupBy('expense.vendorName')
            .orderBy('total', 'DESC')
            .limit(10)

        if (filters.fromDate) {
            query.andWhere('expense.expenseDate >= :fromDate', {
            fromDate: filters.fromDate,
            })
        }

        if (filters.toDate) {
            query.andWhere('expense.expenseDate <= :toDate', {
            toDate: filters.toDate,
            })
        }

        return query.getRawMany()
    }

    async getTopIncomeCategories(filters: DashboardQueryDto) {
        const rows = await this.getIncomesByCategory(filters)

        return rows.slice(0, 10)
        }

        async getTopExpenseCategories(filters: DashboardQueryDto) {
        const rows = await this.getExpensesByCategory(filters)

        return rows.slice(0, 10)
    }
}