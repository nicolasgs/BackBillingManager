"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRepository = void 0;
const database_1 = require("../../bootstrap/database");
const enums_1 = require("../../shared/enums");
const expense_entity_1 = require("../expenses/expense.entity");
const income_entity_1 = require("../incomes/income.entity");
class ReportsRepository {
    constructor() {
        this.incomeRepository = database_1.AppDataSource.getRepository(income_entity_1.IncomeEntity);
        this.expenseRepository = database_1.AppDataSource.getRepository(expense_entity_1.ExpenseEntity);
    }
    getIncomeQuery(filters) {
        const query = this.incomeRepository
            .createQueryBuilder('income')
            .leftJoinAndSelect('income.category', 'category')
            .leftJoinAndSelect('income.paymentMethod', 'paymentMethod')
            .where('income.companyId = :companyId', {
            companyId: filters.companyId,
        })
            .andWhere('income.deletedAt IS NULL')
            .andWhere('income.status = :status', {
            status: enums_1.TransactionStatus.PAID,
        });
        if (filters.companyPublicId) {
            query.andWhere('income.companyPublicId = :companyPublicId', {
                companyPublicId: filters.companyPublicId,
            });
        }
        if (filters.fromDate) {
            query.andWhere('income.incomeDate >= :fromDate', {
                fromDate: filters.fromDate,
            });
        }
        if (filters.toDate) {
            query.andWhere('income.incomeDate <= :toDate', {
                toDate: filters.toDate,
            });
        }
        return query.orderBy('income.incomeDate', 'ASC');
    }
    getExpenseQuery(filters) {
        const query = this.expenseRepository
            .createQueryBuilder('expense')
            .leftJoinAndSelect('expense.category', 'category')
            .leftJoinAndSelect('expense.paymentMethod', 'paymentMethod')
            .leftJoinAndSelect('expense.vendor', 'vendor')
            .where('expense.companyId = :companyId', {
            companyId: filters.companyId,
        })
            .andWhere('expense.deletedAt IS NULL')
            .andWhere('expense.status = :status', {
            status: enums_1.TransactionStatus.PAID,
        });
        if (filters.companyPublicId) {
            query.andWhere('expense.companyPublicId = :companyPublicId', {
                companyPublicId: filters.companyPublicId,
            });
        }
        if (filters.fromDate) {
            query.andWhere('expense.expenseDate >= :fromDate', {
                fromDate: filters.fromDate,
            });
        }
        if (filters.toDate) {
            query.andWhere('expense.expenseDate <= :toDate', {
                toDate: filters.toDate,
            });
        }
        return query.orderBy('expense.expenseDate', 'ASC');
    }
    findPaidIncomes(filters) {
        return this.getIncomeQuery(filters).getMany();
    }
    findPaidExpenses(filters) {
        return this.getExpenseQuery(filters).getMany();
    }
    async getIncomeByCategory(filters) {
        const query = this.incomeRepository
            .createQueryBuilder('income')
            .leftJoin('income.category', 'category')
            .select('category.name', 'categoryName')
            .addSelect('COALESCE(SUM(income.amount), 0)', 'total')
            .addSelect('COUNT(income.id)', 'count')
            .where('income.companyId = :companyId', {
            companyId: filters.companyId,
        })
            .andWhere('income.deletedAt IS NULL')
            .andWhere('income.status = :status', {
            status: enums_1.TransactionStatus.PAID,
        });
        if (filters.companyPublicId) {
            query.andWhere('income.companyPublicId = :companyPublicId', {
                companyPublicId: filters.companyPublicId,
            });
        }
        if (filters.fromDate) {
            query.andWhere('income.incomeDate >= :fromDate', {
                fromDate: filters.fromDate,
            });
        }
        if (filters.toDate) {
            query.andWhere('income.incomeDate <= :toDate', {
                toDate: filters.toDate,
            });
        }
        return query
            .groupBy('category.name')
            .orderBy('total', 'DESC')
            .getRawMany();
    }
    async getExpenseByCategory(filters) {
        const query = this.expenseRepository
            .createQueryBuilder('expense')
            .leftJoin('expense.category', 'category')
            .select('category.name', 'categoryName')
            .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
            .addSelect('COUNT(expense.id)', 'count')
            .where('expense.companyId = :companyId', {
            companyId: filters.companyId,
        })
            .andWhere('expense.deletedAt IS NULL')
            .andWhere('expense.status = :status', {
            status: enums_1.TransactionStatus.PAID,
        });
        if (filters.companyPublicId) {
            query.andWhere('expense.companyPublicId = :companyPublicId', {
                companyPublicId: filters.companyPublicId,
            });
        }
        if (filters.fromDate) {
            query.andWhere('expense.expenseDate >= :fromDate', {
                fromDate: filters.fromDate,
            });
        }
        if (filters.toDate) {
            query.andWhere('expense.expenseDate <= :toDate', {
                toDate: filters.toDate,
            });
        }
        return query
            .groupBy('category.name')
            .orderBy('total', 'DESC')
            .getRawMany();
    }
}
exports.ReportsRepository = ReportsRepository;
