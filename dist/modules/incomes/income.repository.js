"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeRepository = void 0;
const typeorm_1 = require("typeorm");
const database_1 = require("../../bootstrap/database");
const income_entity_1 = require("./income.entity");
class IncomeRepository {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(income_entity_1.IncomeEntity);
    }
    createEntity(payload) {
        return this.repository.create(payload);
    }
    save(income) {
        return this.repository.save(income);
    }
    findAll(filters) {
        const query = this.repository
            .createQueryBuilder('income')
            .leftJoinAndSelect('income.category', 'category')
            .leftJoinAndSelect('income.paymentMethod', 'paymentMethod')
            .where('income.companyId = :companyId', { companyId: filters.companyId })
            .andWhere('income.deletedAt IS NULL');
        if (filters.clientId) {
            query.andWhere('income.clientId = :clientId', {
                clientId: filters.clientId,
            });
        }
        if (filters.caseId) {
            query.andWhere('income.caseId = :caseId', {
                caseId: filters.caseId,
            });
        }
        if (filters.clientPublicId) {
            query.andWhere('income.clientPublicId = :clientPublicId', {
                clientPublicId: filters.clientPublicId,
            });
        }
        if (filters.casePublicId) {
            query.andWhere('income.casePublicId = :casePublicId', {
                casePublicId: filters.casePublicId,
            });
        }
        if (filters.categoryId) {
            query.andWhere('income.categoryId = :categoryId', {
                categoryId: filters.categoryId,
            });
        }
        if (filters.paymentMethodCode) {
            query.andWhere('income.paymentMethodCode = :paymentMethodCode', {
                paymentMethodCode: filters.paymentMethodCode.toUpperCase(),
            });
        }
        if (filters.status) {
            query.andWhere('income.status = :status', {
                status: filters.status,
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
        return query.orderBy('income.incomeDate', 'DESC').getMany();
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
            },
        });
    }
    softDeleteById(id) {
        return this.repository.softDelete(id);
    }
}
exports.IncomeRepository = IncomeRepository;
