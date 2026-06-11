import { Between, IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { ClosingItemType, ClosingStatus, TransactionStatus } from '../../shared/enums'
import { ExpenseEntity } from '../expenses/expense.entity'
import { IncomeEntity } from '../incomes/income.entity'
import { MonthlyClosingItemEntity } from './monthly-closing-item.entity'
import { MonthlyClosingEntity } from './monthly-closing.entity'
import { MonthlyClosingFilters } from './interfaces/monthly-closing-filters.interface'

export class MonthlyClosingRepository {
    private closingRepository = AppDataSource.getRepository(MonthlyClosingEntity)
    private itemRepository = AppDataSource.getRepository(MonthlyClosingItemEntity)
    private incomeRepository = AppDataSource.getRepository(IncomeEntity)
    private expenseRepository = AppDataSource.getRepository(ExpenseEntity)

    createEntity(payload: Partial<MonthlyClosingEntity>) {
        return this.closingRepository.create(payload)
    }

    save(closing: MonthlyClosingEntity) {
        return this.closingRepository.save(closing)
    }

    findExistingPeriod(companyId: number, year: number, month: number) {
        return this.closingRepository.findOne({
        where: { companyId, year, month, deletedAt: IsNull() },
        })
    }

    findAll(filters: MonthlyClosingFilters) {
        const query = this.closingRepository
        .createQueryBuilder('closing')
        .where('closing.companyId = :companyId', { companyId: filters.companyId })
        .andWhere('closing.deletedAt IS NULL')

        if (filters.year) {
        query.andWhere('closing.year = :year', { year: filters.year })
        }

        if (filters.month) {
        query.andWhere('closing.month = :month', { month: filters.month })
        }

        if (filters.status) {
        query.andWhere('closing.status = :status', { status: filters.status })
        }

        return query.orderBy('closing.year', 'DESC').addOrderBy('closing.month', 'DESC').getMany()
    }

    findByPublicId(publicId: string) {
        return this.closingRepository.findOne({
        where: { publicId, deletedAt: IsNull() },
        relations: { items: true },
        })
    }

    getPeriodRange(year: number, month: number) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const lastDay = new Date(year, month, 0).getDate()
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

        return { startDate, endDate }
    }

    findPaidIncomesForPeriod(companyId: number, year: number, month: number) {
        const { startDate, endDate } = this.getPeriodRange(year, month)

        return this.incomeRepository.find({
        where: {
            companyId,
            incomeDate: Between(startDate, endDate),
            status: TransactionStatus.PAID,
            deletedAt: IsNull(),
        },
        })
    }

    findPaidExpensesForPeriod(companyId: number, year: number, month: number) {
        const { startDate, endDate } = this.getPeriodRange(year, month)

        return this.expenseRepository.find({
        where: {
            companyId,
            expenseDate: Between(startDate, endDate),
            status: TransactionStatus.PAID,
            deletedAt: IsNull(),
        },
        })
    }

    async deleteItemsByClosingId(monthlyClosingId: number) {
        await this.itemRepository.delete({ monthlyClosingId })
    }

    createItems(items: Partial<MonthlyClosingItemEntity>[]) {
        return this.itemRepository.create(items)
    }

    saveItems(items: MonthlyClosingItemEntity[]) {
        return this.itemRepository.save(items)
    }
}