import { AppDataSource } from '../../bootstrap/database'
import { TransactionStatus } from '../../shared/enums'
import { ExpenseEntity } from '../expenses/expense.entity'
import { IncomeEntity } from '../incomes/income.entity'
import { ReportFilters } from './interfaces/report-filters.interface'

export class ReportsRepository {
  private incomeRepository =
    AppDataSource.getRepository(IncomeEntity)

  private expenseRepository =
    AppDataSource.getRepository(ExpenseEntity)

  getIncomeQuery(filters: ReportFilters) {
    const query = this.incomeRepository
      .createQueryBuilder('income')
      .leftJoinAndSelect('income.category', 'category')
      .leftJoinAndSelect('income.paymentMethod', 'paymentMethod')
      .where('income.companyId = :companyId', {
        companyId: filters.companyId,
      })
      .andWhere('income.deletedAt IS NULL')
      .andWhere('income.status = :status', {
        status: TransactionStatus.PAID,
      })

    if (filters.companyPublicId) {
      query.andWhere(
        'income.companyPublicId = :companyPublicId',
        {
          companyPublicId: filters.companyPublicId,
        }
      )
    }

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

    return query.orderBy('income.incomeDate', 'ASC')
  }

  getExpenseQuery(filters: ReportFilters) {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .leftJoinAndSelect(
        'expense.paymentMethod',
        'paymentMethod'
      )
      .leftJoinAndSelect('expense.vendor', 'vendor')
      .where('expense.companyId = :companyId', {
        companyId: filters.companyId,
      })
      .andWhere('expense.deletedAt IS NULL')
      .andWhere('expense.status = :status', {
        status: TransactionStatus.PAID,
      })

    if (filters.companyPublicId) {
      query.andWhere(
        'expense.companyPublicId = :companyPublicId',
        {
          companyPublicId: filters.companyPublicId,
        }
      )
    }

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

    return query.orderBy('expense.expenseDate', 'ASC')
  }

  findPaidIncomes(filters: ReportFilters) {
    return this.getIncomeQuery(filters).getMany()
  }

  findPaidExpenses(filters: ReportFilters) {
    return this.getExpenseQuery(filters).getMany()
  }

  async getIncomeByCategory(filters: ReportFilters) {
    const query = this.incomeRepository
      .createQueryBuilder('income')
      .leftJoin('income.category', 'category')
      .select('category.name', 'categoryName')
      .addSelect(
        'COALESCE(SUM(income.amount), 0)',
        'total'
      )
      .addSelect('COUNT(income.id)', 'count')
      .where('income.companyId = :companyId', {
        companyId: filters.companyId,
      })
      .andWhere('income.deletedAt IS NULL')
      .andWhere('income.status = :status', {
        status: TransactionStatus.PAID,
      })

    if (filters.companyPublicId) {
      query.andWhere(
        'income.companyPublicId = :companyPublicId',
        {
          companyPublicId: filters.companyPublicId,
        }
      )
    }

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

    return query
      .groupBy('category.name')
      .orderBy('total', 'DESC')
      .getRawMany()
  }

  async getExpenseByCategory(filters: ReportFilters) {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.category', 'category')
      .select('category.name', 'categoryName')
      .addSelect(
        'COALESCE(SUM(expense.amount), 0)',
        'total'
      )
      .addSelect('COUNT(expense.id)', 'count')
      .where('expense.companyId = :companyId', {
        companyId: filters.companyId,
      })
      .andWhere('expense.deletedAt IS NULL')
      .andWhere('expense.status = :status', {
        status: TransactionStatus.PAID,
      })

    if (filters.companyPublicId) {
      query.andWhere(
        'expense.companyPublicId = :companyPublicId',
        {
          companyPublicId: filters.companyPublicId,
        }
      )
    }

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

    return query
      .groupBy('category.name')
      .orderBy('total', 'DESC')
      .getRawMany()
  }
}