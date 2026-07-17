"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const database_1 = require("../../bootstrap/database");
const enums_1 = require("../../shared/enums");
const expense_entity_1 = require("../expenses/expense.entity");
const income_entity_1 = require("../incomes/income.entity");
class DashboardRepository {
    constructor() {
        this.incomeRepository = database_1.AppDataSource.getRepository(income_entity_1.IncomeEntity);
        this.expenseRepository = database_1.AppDataSource.getRepository(expense_entity_1.ExpenseEntity);
    }
    async getIncomeSummary(filters) {
        const query = this.incomeRepository
            .createQueryBuilder('income')
            .select('COALESCE(SUM(income.amount), 0)', 'total')
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
        this.applyIncomeDateFilters(query, filters);
        return query.getRawOne();
    }
    async getExpenseSummary(filters) {
        const query = this.expenseRepository
            .createQueryBuilder('expense')
            .select('COALESCE(SUM(expense.amount), 0)', 'total')
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
        this.applyExpenseDateFilters(query, filters);
        return query.getRawOne();
    }
    async getIncomesByCategory(filters) {
        const query = this.incomeRepository
            .createQueryBuilder('income')
            .leftJoin('income.category', 'category')
            .select('category.name', 'categoryName')
            .addSelect('category.type', 'categoryType')
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
        this.applyIncomeDateFilters(query, filters);
        return query
            .groupBy('category.name')
            .addGroupBy('category.type')
            .orderBy('total', 'DESC')
            .getRawMany();
    }
    async getExpensesByCategory(filters) {
        const query = this.expenseRepository
            .createQueryBuilder('expense')
            .leftJoin('expense.category', 'category')
            .select('category.name', 'categoryName')
            .addSelect('category.type', 'categoryType')
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
        this.applyExpenseDateFilters(query, filters);
        return query
            .groupBy('category.name')
            .addGroupBy('category.type')
            .orderBy('total', 'DESC')
            .getRawMany();
    }
    async getMonthlyIncomeTrend(filters) {
        const query = this.incomeRepository
            .createQueryBuilder('income')
            .select('EXTRACT(YEAR FROM income.incomeDate)', 'year')
            .addSelect('EXTRACT(MONTH FROM income.incomeDate)', 'month')
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
        this.applyIncomeDateFilters(query, filters);
        return query
            .groupBy('EXTRACT(YEAR FROM income.incomeDate)')
            .addGroupBy('EXTRACT(MONTH FROM income.incomeDate)')
            .orderBy('EXTRACT(YEAR FROM income.incomeDate)', 'ASC')
            .addOrderBy('EXTRACT(MONTH FROM income.incomeDate)', 'ASC')
            .getRawMany();
    }
    async getMonthlyExpenseTrend(filters) {
        const query = this.expenseRepository
            .createQueryBuilder('expense')
            .select('EXTRACT(YEAR FROM expense.expenseDate)', 'year')
            .addSelect('EXTRACT(MONTH FROM expense.expenseDate)', 'month')
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
        this.applyExpenseDateFilters(query, filters);
        return query
            .groupBy('EXTRACT(YEAR FROM expense.expenseDate)')
            .addGroupBy('EXTRACT(MONTH FROM expense.expenseDate)')
            .orderBy('EXTRACT(YEAR FROM expense.expenseDate)', 'ASC')
            .addOrderBy('EXTRACT(MONTH FROM expense.expenseDate)', 'ASC')
            .getRawMany();
    }
    async getTopVendors(filters) {
        const query = this.expenseRepository
            .createQueryBuilder('expense')
            .select('expense.vendorId', 'vendorId')
            .addSelect('expense.vendorName', 'vendorName')
            .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
            .addSelect('COUNT(expense.id)', 'count')
            .where('expense.companyId = :companyId', {
            companyId: filters.companyId,
        })
            .andWhere('expense.deletedAt IS NULL')
            .andWhere('expense.status = :status', {
            status: enums_1.TransactionStatus.PAID,
        })
            .andWhere('expense.vendorName IS NOT NULL');
        if (filters.companyPublicId) {
            query.andWhere('expense.companyPublicId = :companyPublicId', {
                companyPublicId: filters.companyPublicId,
            });
        }
        this.applyExpenseDateFilters(query, filters);
        return query
            .groupBy('expense.vendorId')
            .addGroupBy('expense.vendorName')
            .orderBy('total', 'DESC')
            .limit(10)
            .getRawMany();
    }
    async getTopIncomeCategories(filters) {
        const rows = await this.getIncomesByCategory(filters);
        return rows.slice(0, 10);
    }
    async getTopExpenseCategories(filters) {
        const rows = await this.getExpensesByCategory(filters);
        return rows.slice(0, 10);
    }
    applyIncomeDateFilters(query, filters) {
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
    }
    applyExpenseDateFilters(query, filters) {
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
    }
}
exports.DashboardRepository = DashboardRepository;
