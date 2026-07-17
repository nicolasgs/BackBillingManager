"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseRepository = void 0;
const typeorm_1 = require("typeorm");
const database_1 = require("../../bootstrap/database");
const expense_entity_1 = require("./expense.entity");
class ExpenseRepository {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(expense_entity_1.ExpenseEntity);
    }
    createEntity(payload) {
        return this.repository.create(payload);
    }
    save(expense) {
        return this.repository.save(expense);
    }
    findAll(filters) {
        const query = this.repository
            .createQueryBuilder('expense')
            .leftJoinAndSelect('expense.category', 'category')
            .leftJoinAndSelect('expense.paymentMethod', 'paymentMethod')
            .leftJoinAndSelect('expense.vendor', 'vendor')
            .where('expense.companyId = :companyId', {
            companyId: filters.companyId,
        })
            .andWhere('expense.deletedAt IS NULL');
        if (filters.companyPublicId) {
            query.andWhere('expense.companyPublicId = :companyPublicId', {
                companyPublicId: filters.companyPublicId,
            });
        }
        if (filters.vendorId) {
            query.andWhere('expense.vendorId = :vendorId', {
                vendorId: filters.vendorId,
            });
        }
        if (filters.vendorPublicId) {
            query.andWhere('expense.vendorPublicId = :vendorPublicId', {
                vendorPublicId: filters.vendorPublicId,
            });
        }
        if (filters.vendorName) {
            query.andWhere('LOWER(expense.vendorName) LIKE :vendorName', {
                vendorName: `%${filters.vendorName.toLowerCase()}%`,
            });
        }
        if (filters.categoryId) {
            query.andWhere('expense.categoryId = :categoryId', {
                categoryId: filters.categoryId,
            });
        }
        if (filters.paymentMethodCode) {
            query.andWhere('expense.paymentMethodCode = :paymentMethodCode', {
                paymentMethodCode: filters.paymentMethodCode.toUpperCase(),
            });
        }
        if (filters.status) {
            query.andWhere('expense.status = :status', {
                status: filters.status,
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
        return query.orderBy('expense.expenseDate', 'DESC').getMany();
    }
    findByPublicId(publicId) {
        return this.repository.findOne({
            where: {
                publicId,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            relations: {
                category: true,
                paymentMethod: true,
                vendor: true,
            },
        });
    }
    softDeleteById(id) {
        return this.repository.softDelete(id);
    }
}
exports.ExpenseRepository = ExpenseRepository;
