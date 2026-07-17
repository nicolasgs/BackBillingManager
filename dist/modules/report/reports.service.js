"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const reports_repository_1 = require("./reports.repository");
class ReportsService {
    constructor(repository = new reports_repository_1.ReportsRepository()) {
        this.repository = repository;
    }
    async getProfitLoss(filters) {
        const [incomes, expenses, incomeByCategory, expenseByCategory,] = await Promise.all([
            this.repository.findPaidIncomes(filters),
            this.repository.findPaidExpenses(filters),
            this.repository.getIncomeByCategory(filters),
            this.repository.getExpenseByCategory(filters),
        ]);
        const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
        return {
            companyId: filters.companyId,
            fromDate: filters.fromDate ?? null,
            toDate: filters.toDate ?? null,
            totalIncome: Number(totalIncome.toFixed(2)),
            totalExpense: Number(totalExpense.toFixed(2)),
            netProfit: Number((totalIncome - totalExpense).toFixed(2)),
            incomeCount: incomes.length,
            expenseCount: expenses.length,
            incomeByCategory: incomeByCategory.map((item) => ({
                categoryName: item.categoryName ?? 'Uncategorized',
                total: Number(item.total || 0),
                count: Number(item.count || 0),
            })),
            expenseByCategory: expenseByCategory.map((item) => ({
                categoryName: item.categoryName ?? 'Uncategorized',
                total: Number(item.total || 0),
                count: Number(item.count || 0),
            })),
        };
    }
    async exportIncomesCsv(filters) {
        const incomes = await this.repository.findPaidIncomes(filters);
        const rows = [
            [
                'Date',
                'Category',
                'Amount',
                'Currency',
                'Payment Method',
                'Reference Number',
                'Description',
                'Status',
                'Source',
            ],
            ...incomes.map((income) => [
                income.incomeDate,
                income.category?.name ?? '',
                Number(income.amount).toFixed(2),
                income.currency,
                income.paymentMethodCode,
                income.referenceNumber ?? '',
                income.description ?? '',
                income.status,
                income.source,
            ]),
        ];
        return this.toCsv(rows);
    }
    async exportExpensesCsv(filters) {
        const expenses = await this.repository.findPaidExpenses(filters);
        const rows = [
            [
                'Date',
                'Vendor',
                'Category',
                'Amount',
                'Currency',
                'Payment Method',
                'Reference Number',
                'Description',
                'Status',
                'Source',
            ],
            ...expenses.map((expense) => [
                expense.expenseDate,
                expense.vendorName ?? expense.vendor?.name ?? '',
                expense.category?.name ?? '',
                Number(expense.amount).toFixed(2),
                expense.currency,
                expense.paymentMethodCode,
                expense.referenceNumber ?? '',
                expense.description ?? '',
                expense.status,
                expense.source,
            ]),
        ];
        return this.toCsv(rows);
    }
    toCsv(rows) {
        return rows
            .map((row) => row
            .map((value) => {
            const stringValue = String(value ?? '');
            const escaped = stringValue.replace(/"/g, '""');
            return `"${escaped}"`;
        })
            .join(','))
            .join('\n');
    }
}
exports.ReportsService = ReportsService;
