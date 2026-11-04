import { EntityManager, IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { BillingCategoryType } from '../../shared/enums'
import { BillingCategoryEntity } from './billing-category.entity'
import { BillingCategoryFilters } from './interfaces/billing-category-filters.interface'

export class BillingCategoryRepository {
    private repository = AppDataSource.getRepository(BillingCategoryEntity)

    private getRepository(manager?: EntityManager) {
        return manager
            ? manager.getRepository(BillingCategoryEntity)
            : this.repository
    }

    createEntity(
        payload: Partial<BillingCategoryEntity>,
        manager?: EntityManager
    ) {
        return this.getRepository(manager).create(payload)
    }

    save(
        category: BillingCategoryEntity,
        manager?: EntityManager
    ) {
        return this.getRepository(manager).save(category)
    }

    lockCompany(
        companyId: number,
        manager: EntityManager
    ) {
        return manager.query(
            `
                SELECT pg_advisory_xact_lock(
                    hashtextextended($1::text, 0)
                )
            `,
            [`billing-categories:${companyId}`]
        )
    }

    findExistingByCompanyNameAndType(
        params: {
            companyId: number
            name: string
            type: BillingCategoryType
            excludeId?: number
        },
        manager?: EntityManager
    ) {
        const query = this.getRepository(manager)
            .createQueryBuilder('category')
            .where('category.companyId = :companyId', {
                companyId: params.companyId,
            })
            .andWhere('category.name = :name', {
                name: params.name,
            })
            .andWhere('category.type = :type', {
                type: params.type,
            })
            .andWhere('category.deletedAt IS NULL')

        if (params.excludeId !== undefined) {
            query.andWhere('category.id <> :excludeId', {
                excludeId: params.excludeId,
            })
        }

        return query.getOne()
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

    findByPublicIdForUpdate(
        publicId: string,
        companyId: number,
        manager: EntityManager
    ) {
        return manager
            .getRepository(BillingCategoryEntity)
            .createQueryBuilder('category')
            .where('category.publicId = :publicId', {
                publicId,
            })
            .andWhere('category.companyId = :companyId', {
                companyId,
            })
            .andWhere('category.deletedAt IS NULL')
            .setLock('pessimistic_write')
            .getOne()
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

    findActiveByIdAndCompanyAndTypeForUpdate(
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
            .andWhere('category.isActive = :isActive', {
                isActive: true,
            })
            .andWhere('category.deletedAt IS NULL')
            .setLock('pessimistic_write')
            .getOne()
    }

    async hasReferences(
        id: number,
        manager: EntityManager
    ) {
        const rows = await manager.query(
            `
                SELECT
                    EXISTS (
                        SELECT 1
                        FROM incomes
                        WHERE category_id = $1
                    ) AS "hasIncomeReferences",
                    EXISTS (
                        SELECT 1
                        FROM expenses
                        WHERE category_id = $1
                    ) AS "hasExpenseReferences",
                    EXISTS (
                        SELECT 1
                        FROM billing_settings
                        WHERE crm_payment_income_category_id = $1
                    ) AS "hasSettingsReferences"
            `,
            [id]
        )

        const result = rows[0]

        return Boolean(
            result?.hasIncomeReferences ||
            result?.hasExpenseReferences ||
            result?.hasSettingsReferences
        )
    }

    softDeleteById(
        id: number,
        manager?: EntityManager
    ) {
        return this.getRepository(manager).softDelete(id)
    }
}
