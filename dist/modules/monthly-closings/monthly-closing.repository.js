"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyClosingRepository = void 0;
const typeorm_1 = require("typeorm");
const database_1 = require("../../bootstrap/database");
const enums_1 = require("../../shared/enums");
const expense_entity_1 = require("../expenses/expense.entity");
const income_entity_1 = require("../incomes/income.entity");
const monthly_closing_item_entity_1 = require("./monthly-closing-item.entity");
const monthly_closing_entity_1 = require("./monthly-closing.entity");
class MonthlyClosingRepository {
    constructor() {
        this.closingRepository = database_1.AppDataSource.getRepository(monthly_closing_entity_1.MonthlyClosingEntity);
        this.itemRepository = database_1.AppDataSource.getRepository(monthly_closing_item_entity_1.MonthlyClosingItemEntity);
        this.incomeRepository = database_1.AppDataSource.getRepository(income_entity_1.IncomeEntity);
        this.expenseRepository = database_1.AppDataSource.getRepository(expense_entity_1.ExpenseEntity);
    }
    createEntity(payload) {
        return this.closingRepository.create(payload);
    }
    save(closing) {
        return this.closingRepository.save(closing);
    }
    findExistingPeriod(companyId, year, month) {
        return this.closingRepository.findOne({
            where: { companyId, year, month, deletedAt: (0, typeorm_1.IsNull)() },
        });
    }
    findAll(filters) {
        const query = this.closingRepository
            .createQueryBuilder('closing')
            .where('closing.companyId = :companyId', { companyId: filters.companyId })
            .andWhere('closing.deletedAt IS NULL');
        if (filters.year) {
            query.andWhere('closing.year = :year', { year: filters.year });
        }
        if (filters.month) {
            query.andWhere('closing.month = :month', { month: filters.month });
        }
        if (filters.status) {
            query.andWhere('closing.status = :status', { status: filters.status });
        }
        return query.orderBy('closing.year', 'DESC').addOrderBy('closing.month', 'DESC').getMany();
    }
    findByPublicId(publicId) {
        return this.closingRepository.findOne({
            where: { publicId, deletedAt: (0, typeorm_1.IsNull)() },
            relations: { items: true },
        });
    }
    getPeriodRange(year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        return { startDate, endDate };
    }
    findPaidIncomesForPeriod(companyId, year, month) {
        const { startDate, endDate } = this.getPeriodRange(year, month);
        return this.incomeRepository.find({
            where: {
                companyId,
                incomeDate: (0, typeorm_1.Between)(startDate, endDate),
                status: enums_1.TransactionStatus.PAID,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    findPaidExpensesForPeriod(companyId, year, month) {
        const { startDate, endDate } = this.getPeriodRange(year, month);
        return this.expenseRepository.find({
            where: {
                companyId,
                expenseDate: (0, typeorm_1.Between)(startDate, endDate),
                status: enums_1.TransactionStatus.PAID,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    async deleteItemsByClosingId(monthlyClosingId) {
        await this.itemRepository.delete({ monthlyClosingId });
    }
    createItems(items) {
        return this.itemRepository.create(items);
    }
    saveItems(items) {
        return this.itemRepository.save(items);
    }
}
exports.MonthlyClosingRepository = MonthlyClosingRepository;
