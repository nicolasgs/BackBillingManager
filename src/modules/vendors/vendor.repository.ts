import { IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { VendorEntity } from './vendor.entity'
import { VendorFilters } from './interfaces/vendor-filters.interface'

export class VendorRepository {
    private repository = AppDataSource.getRepository(VendorEntity)

    createEntity(payload: Partial<VendorEntity>) {
        return this.repository.create(payload)
    }

    save(vendor: VendorEntity) {
        return this.repository.save(vendor)
    }

    findExistingByCompanyAndName(params: {
        companyId: number
        name: string
    }) {
        return this.repository.findOne({
        where: {
            companyId: params.companyId,
            name: params.name,
            deletedAt: IsNull(),
        },
        })
    }

    findAll(filters: VendorFilters) {
        const query = this.repository
        .createQueryBuilder('vendor')
        .where('vendor.companyId = :companyId', {
            companyId: filters.companyId,
        })
        .andWhere('vendor.deletedAt IS NULL')

        if (filters.companyPublicId) {
        query.andWhere('vendor.companyPublicId = :companyPublicId', {
            companyPublicId: filters.companyPublicId,
        })
        }

        if (filters.search) {
        query.andWhere('LOWER(vendor.name) LIKE :search', {
            search: `%${filters.search.toLowerCase()}%`,
        })
        }

        if (filters.isActive !== undefined) {
        query.andWhere('vendor.isActive = :isActive', {
            isActive: filters.isActive,
        })
        }

        return query.orderBy('vendor.name', 'ASC').getMany()
    }

    findByPublicId(publicId: string) {
        return this.repository.findOne({
        where: {
            publicId,
            deletedAt: IsNull(),
        },
        })
    }

    findByIdAndCompany(params: {
        id: number
        companyId: number
    }) {
        return this.repository.findOne({
        where: {
            id: params.id,
            companyId: params.companyId,
            deletedAt: IsNull(),
        },
        })
    }

    softDeleteById(id: number) {
        return this.repository.softDelete(id)
    }
}