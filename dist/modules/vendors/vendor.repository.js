"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRepository = void 0;
const typeorm_1 = require("typeorm");
const database_1 = require("../../bootstrap/database");
const vendor_entity_1 = require("./vendor.entity");
class VendorRepository {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(vendor_entity_1.VendorEntity);
    }
    createEntity(payload) {
        return this.repository.create(payload);
    }
    save(vendor) {
        return this.repository.save(vendor);
    }
    findExistingByCompanyAndName(params) {
        return this.repository.findOne({
            where: {
                companyId: params.companyId,
                name: params.name,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    findAll(filters) {
        const query = this.repository
            .createQueryBuilder('vendor')
            .where('vendor.companyId = :companyId', {
            companyId: filters.companyId,
        })
            .andWhere('vendor.deletedAt IS NULL');
        if (filters.companyPublicId) {
            query.andWhere('vendor.companyPublicId = :companyPublicId', {
                companyPublicId: filters.companyPublicId,
            });
        }
        if (filters.search) {
            query.andWhere('LOWER(vendor.name) LIKE :search', {
                search: `%${filters.search.toLowerCase()}%`,
            });
        }
        if (filters.isActive !== undefined) {
            query.andWhere('vendor.isActive = :isActive', {
                isActive: filters.isActive,
            });
        }
        return query.orderBy('vendor.name', 'ASC').getMany();
    }
    findByPublicId(publicId) {
        return this.repository.findOne({
            where: {
                publicId,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    findByIdAndCompany(params) {
        return this.repository.findOne({
            where: {
                id: params.id,
                companyId: params.companyId,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    softDeleteById(id) {
        return this.repository.softDelete(id);
    }
}
exports.VendorRepository = VendorRepository;
