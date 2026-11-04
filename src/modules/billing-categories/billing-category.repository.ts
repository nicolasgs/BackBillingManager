import { EntityManager, IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { BillingCategoryType } from '../../shared/enums'
import { BillingCategoryEntity } from './billing-category.entity'
import { BillingCategoryFilters } from './interfaces/billing-category-filters.interface'

export class BillingCategoryRepository {
    private repository = AppDataSource.getRepository(BillingCategoryEntity)

    createEntity(payload: Partial<BillingCategoryEntity>) {
        return this.repository.create(payload)
    }

    save(category: BillingCategoryEntity) {
        return this.repository.save(category)
    }

    findExistingByCompanyNameAndType(params: {
        companyId: number
        name: string
        type: BillingCategoryType
    }) {
        return this.repository.findOne({
        where: {
            companyId: params.companyId,
            name: params.name,
            type: params.type,
            deletedAt: IsNull(),
        },
        })
    }

    findAll(filters: BillingCategoryFilters) {
        const query = this.repository
        .createQueryBuilder('category')
        .where('category.companyId = :companyId', {
            companyId: filters.companyId,
        })
        .andWhere('category.deletedAt IS NULL')

        if (filters.companyPublicId) {
        query.andWhere('category.companyPublicId = :companyPublicId', {
            companyPublicId: filters.companyPublicId,
        })
        }

        if (filters.type) {
        query.andWhere('category.type = :type', {
            type: filters.type,
        })
        }

        if (filters.isActive !== undefined) {
        query.andWhere('category.isActive = :isActive', {
            isActive: filters.isActive,
        })
        }

        return query.orderBy('category.name', 'ASC').getMany()
    }

    findByPublicId(publicId: string) {
        return this.repository.findOne({
        where: {
            publicId,
            deletedAt: IsNull(),
        },
        })
    }

    findByIdAndCompanyAndType(params: {
        id: number
        companyId: number
        type: BillingCategoryType
    }) {
        return this.repository.findOne({
        where: {
            id: params.id,
            companyId: params.companyId,
            type: params.type,
            deletedAt: IsNull(),
        },
        })
    }

    findByIdAndCompanyAndTypeForUpdate(
        params: {
            id: number
            companyId: number
            type: BillingCategoryType
        },
        manager: EntityManager
    ) {
        return manager
        .getRepository(BillingCategoryEntity)
        .createQueryBuilder('category')
        .where('category.id = :id', {
            id: params.id,
        })
        .andWhere('category.companyId = :companyId', {
            companyId: params.companyId,
        })
        .andWhere('category.type = :type', {
            type: params.type,
        })
        .andWhere('category.deletedAt IS NULL')
        .setLock('pessimistic_write')
        .getOne()
    }

    softDeleteById(id: number) {
        return this.repository.softDelete(id)
    }
}