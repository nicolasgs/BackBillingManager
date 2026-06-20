import { AuditAction, AuditEntityType } from '../../shared/enums'
import { ApiError } from '../../shared/errors'
import { AuditLogService } from '../audit-logs/audit-log.service'
import {
  CreateBillingCategoryDto,
  ListBillingCategoriesQueryDto,
  UpdateBillingCategoryDto,
} from './dto/billing-category.dto'
import { BillingCategoryRepository } from './billing-category.repository'

export class BillingCategoryService {
  constructor(
    private readonly repository = new BillingCategoryRepository(),
    private readonly auditLogService = new AuditLogService()
  ) {}

  async create(payload: CreateBillingCategoryDto) {
    const existing = await this.repository.findExistingByCompanyNameAndType({
      companyId: payload.companyId,
      name: payload.name,
      type: payload.type,
    })

    if (existing) {
      throw new ApiError(
        409,
        'BILLING_CATEGORY_ALREADY_EXISTS',
        'A billing category with this name and type already exists'
      )
    }

    const categoryEntity = this.repository.createEntity(payload)

    const category = await this.repository.save(categoryEntity)

    await this.auditLogService.log({
      companyId: category.companyId,
      companyPublicId: category.companyPublicId,

      entityType: AuditEntityType.BILLING_CATEGORY,
      entityId: category.id,
      entityPublicId: category.publicId,

      action: AuditAction.CREATE,

      newValues: category,

      authContext: {
        userId: category.createdBy ?? null,
        companyId: category.companyId,
        companyPublicId: category.companyPublicId ?? null,
      },
    })

    return category
  }

  async findAll(filters: ListBillingCategoriesQueryDto) {
    return this.repository.findAll(filters)
  }

  async findByPublicId(publicId: string) {
    const category = await this.repository.findByPublicId(publicId)

    if (!category) {
      throw new ApiError(
        404,
        'BILLING_CATEGORY_NOT_FOUND',
        'Billing category not found'
      )
    }

    return category
  }

  async update(publicId: string, payload: UpdateBillingCategoryDto) {
    const category = await this.findByPublicId(publicId)

    const originalCategory = {
      ...category,
    }

    Object.assign(category, payload)

    const updatedCategory = await this.repository.save(category)

    await this.auditLogService.log({
      companyId: updatedCategory.companyId,
      companyPublicId: updatedCategory.companyPublicId,

      entityType: AuditEntityType.BILLING_CATEGORY,
      entityId: updatedCategory.id,
      entityPublicId: updatedCategory.publicId,

      action: AuditAction.UPDATE,

      oldValues: originalCategory,
      newValues: updatedCategory,

      authContext: {
        userId: updatedCategory.createdBy ?? null,
        companyId: updatedCategory.companyId,
        companyPublicId: updatedCategory.companyPublicId ?? null,
      },
    })

    return updatedCategory
  }

  async softDelete(publicId: string) {
    const category = await this.findByPublicId(publicId)

    await this.repository.softDeleteById(category.id)

    await this.auditLogService.log({
      companyId: category.companyId,
      companyPublicId: category.companyPublicId,

      entityType: AuditEntityType.BILLING_CATEGORY,
      entityId: category.id,
      entityPublicId: category.publicId,

      action: AuditAction.DELETE,

      oldValues: category,

      authContext: {
        userId: category.createdBy ?? null,
        companyId: category.companyId,
        companyPublicId: category.companyPublicId ?? null,
      },
    })

    return {
      publicId: category.publicId,
      deleted: true,
    }
  }
}