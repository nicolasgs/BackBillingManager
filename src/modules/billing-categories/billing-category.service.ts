import { AppDataSource } from '../../bootstrap/database'
import { AuditAction, AuditEntityType } from '../../shared/enums'
import { ApiError } from '../../shared/errors'
import { AuditLogService } from '../audit-logs/audit-log.service'
import { AuthContext } from '../audit-logs/interfaces/auth-context.interface'
import {
  CreateBillingCategoryDto,
  UpdateBillingCategoryDto,
} from './dto/billing-category.dto'
import { BillingCategoryFilters } from './interfaces/billing-category-filters.interface'
import { BillingCategoryRepository } from './billing-category.repository'

export class BillingCategoryService {
  constructor(
    private readonly repository = new BillingCategoryRepository(),
    private readonly auditLogService = new AuditLogService()
  ) {}

  async create(
    payload: CreateBillingCategoryDto,
    authContext?: AuthContext
  ) {
    const category = await AppDataSource.transaction(
      async (manager) => {
        /*
         * Serialize category mutations per company.
         *
         * The database's current unique index is based on
         * company_public_id, which may be NULL for legacy
         * companies. This application lock therefore also
         * protects the logical companyId + name + type key.
         */
        await this.repository.lockCompany(
          payload.companyId,
          manager
        )

        const existing =
          await this.repository.findExistingByCompanyNameAndType(
            {
              companyId: payload.companyId,
              name: payload.name,
              type: payload.type,
            },
            manager
          )

        if (existing) {
          throw new ApiError(
            409,
            'BILLING_CATEGORY_ALREADY_EXISTS',
            'A billing category with this name and type already exists'
          )
        }

        const categoryEntity =
          this.repository.createEntity(
            payload,
            manager
          )

        const category =
          await this.repository.save(
            categoryEntity,
            manager
          )

        await this.auditLogService.log(
          {
            companyId:
              category.companyId,

            companyPublicId:
              category.companyPublicId,

            entityType:
              AuditEntityType.BILLING_CATEGORY,

            entityId:
              category.id,

            entityPublicId:
              category.publicId,

            action:
              AuditAction.CREATE,

            newValues:
              category,

            authContext,
          },
          manager
        )

        return category
      }
    )


    return category
  }

  async findAll(filters: BillingCategoryFilters) {
    return this.repository.findAll(filters)
  }

  async findByPublicId(
    publicId: string,
    companyId: number
  ) {
    const category =
      await this.repository.findByPublicId(
        publicId,
        companyId
      )

    if (!category) {
      throw new ApiError(
        404,
        'BILLING_CATEGORY_NOT_FOUND',
        'Billing category not found'
      )
    }

    return category
  }

  async update(
    publicId: string,
    payload: UpdateBillingCategoryDto,
    companyId: number,
    authContext?: AuthContext
  ) {
    const transactionResult =
      await AppDataSource.transaction(
        async (manager) => {
          await this.repository.lockCompany(
            companyId,
            manager
          )

          const category =
            await this.repository.findByPublicIdForUpdate(
              publicId,
              companyId,
              manager
            )

          if (!category) {
            throw new ApiError(
              404,
              'BILLING_CATEGORY_NOT_FOUND',
              'Billing category not found'
            )
          }

          /*
           * Category type defines accounting semantics.
           * Existing Income/Expense records reference the
           * category by id, so changing INCOME <-> EXPENSE
           * would reinterpret historical records.
           */
          if (
            payload.type !== undefined &&
            payload.type !== category.type
          ) {
            throw new ApiError(
              409,
              'BILLING_CATEGORY_TYPE_IMMUTABLE',
              'Billing category type cannot be changed after creation'
            )
          }

          const existing =
            await this.repository.findExistingByCompanyNameAndType(
              {
                companyId,
                name:
                  payload.name ??
                  category.name,
                type: category.type,
                excludeId: category.id,
              },
              manager
            )

          if (existing) {
            throw new ApiError(
              409,
              'BILLING_CATEGORY_ALREADY_EXISTS',
              'A billing category with this name and type already exists'
            )
          }

          const originalCategory = {
            ...category,
          }

          Object.assign(
            category,
            payload
          )

          const updatedCategory =
            await this.repository.save(
              category,
              manager
            )

          await this.auditLogService.log(
            {
              companyId:
                updatedCategory.companyId,

              companyPublicId:
                updatedCategory.companyPublicId,

              entityType:
                AuditEntityType.BILLING_CATEGORY,

              entityId:
                updatedCategory.id,

              entityPublicId:
                updatedCategory.publicId,

              action:
                AuditAction.UPDATE,

              oldValues:
                originalCategory,

              newValues:
                updatedCategory,

              authContext,
            },
            manager
          )

          return {
            originalCategory,
            updatedCategory,
          }
        }
      )


    return transactionResult
      .updatedCategory
  }

  async softDelete(
    publicId: string,
    companyId: number,
    authContext?: AuthContext
  ) {
    const category =
      await AppDataSource.transaction(
        async (manager) => {
          await this.repository.lockCompany(
            companyId,
            manager
          )

          const lockedCategory =
            await this.repository.findByPublicIdForUpdate(
              publicId,
              companyId,
              manager
            )

          if (!lockedCategory) {
            throw new ApiError(
              404,
              'BILLING_CATEGORY_NOT_FOUND',
              'Billing category not found'
            )
          }

          const hasReferences =
            await this.repository.hasReferences(
              lockedCategory.id,
              manager
            )

          if (hasReferences) {
            throw new ApiError(
              409,
              'BILLING_CATEGORY_IN_USE',
              'A billing category referenced by financial records or billing settings cannot be deleted'
            )
          }

          await this.repository.softDeleteById(
            lockedCategory.id,
            manager
          )

          await this.auditLogService.log(
            {
              companyId:
                lockedCategory.companyId,

              companyPublicId:
                lockedCategory.companyPublicId,

              entityType:
                AuditEntityType.BILLING_CATEGORY,

              entityId:
                lockedCategory.id,

              entityPublicId:
                lockedCategory.publicId,

              action:
                AuditAction.DELETE,

              oldValues:
                lockedCategory,

              authContext,
            },
            manager
          )

          return lockedCategory
        }
      )


    return {
      publicId: category.publicId,
      deleted: true,
    }
  }
}
