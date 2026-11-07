import { EntityManager, IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { VendorEntity } from './vendor.entity'
import { VendorFilters } from './interfaces/vendor-filters.interface'

export class VendorRepository {
    private repository = AppDataSource.getRepository(VendorEntity)

    createEntity(payload: Partial<VendorEntity>) {
        return this.repository.create(payload)
    }

    save(
        vendor: VendorEntity,
        manager?: EntityManager
    ) {
        const repository = manager
            ? manager.getRepository(VendorEntity)
            : this.repository

        return repository.save(vendor)
    }

    findExistingByCompanyAndName(
        params: {
            companyId: number
            name: string
        },
        manager?: EntityManager
    ) {
        const repository = manager
            ? manager.getRepository(VendorEntity)
            : this.repository

        return repository.findOne({
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

    findByPublicId(
        publicId: string,
        companyId: number
    ) {
        return this.repository.findOne({
        where: {
            publicId,
            companyId,
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

    findByPublicIdForUpdate(
        publicId: string,
        companyId: number,
        manager: EntityManager
    ) {
        return manager
            .getRepository(VendorEntity)
            .createQueryBuilder('vendor')
            .where('vendor.publicId = :publicId', {
                publicId,
            })
            .andWhere('vendor.companyId = :companyId', {
                companyId,
            })
            .andWhere('vendor.deletedAt IS NULL')
            .setLock('pessimistic_write')
            .getOne()
    }

    softDeleteById(
        id: number,
        manager?: EntityManager
    ) {
        const repository = manager
            ? manager.getRepository(VendorEntity)
            : this.repository

        return repository.softDelete(id)
    }
}
