"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCategoryRepository = void 0;
const typeorm_1 = require("typeorm");
const database_1 = require("../../bootstrap/database");
const billing_category_entity_1 = require("./billing-category.entity");
class BillingCategoryRepository {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(billing_category_entity_1.BillingCategoryEntity);
    }
    createEntity(payload) {
        return this.repository.create(payload);
    }
    save(category) {
        return this.repository.save(category);
    }
    findExistingByCompanyNameAndType(params) {
        return this.repository.findOne({
            where: {
                companyId: params.companyId,
                name: params.name,
                type: params.type,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    findAll(filters) {
        const query = this.repository
            .createQueryBuilder('category')
            .where('category.companyId = :companyId', {
            companyId: filters.companyId,
        })
            .andWhere('category.deletedAt IS NULL');
        if (filters.companyPublicId) {
            query.andWhere('category.companyPublicId = :companyPublicId', {
                companyPublicId: filters.companyPublicId,
            });
        }
        if (filters.type) {
            query.andWhere('category.type = :type', {
                type: filters.type,
            });
        }
        if (filters.isActive !== undefined) {
            query.andWhere('category.isActive = :isActive', {
                isActive: filters.isActive,
            });
        }
        return query.orderBy('category.name', 'ASC').getMany();
    }
    findByPublicId(publicId) {
        return this.repository.findOne({
            where: {
                publicId,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    findByIdAndCompanyAndType(params) {
        return this.repository.findOne({
            where: {
                id: params.id,
                companyId: params.companyId,
                type: params.type,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    softDeleteById(id) {
        return this.repository.softDelete(id);
    }
}
exports.BillingCategoryRepository = BillingCategoryRepository;
