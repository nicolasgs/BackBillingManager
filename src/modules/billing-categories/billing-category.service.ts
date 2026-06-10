import { ApiError } from '../../shared/errors'
import {
    CreateBillingCategoryDto,
    ListBillingCategoriesQueryDto,
    UpdateBillingCategoryDto,
} from './dto/billing-category.dto'
import { BillingCategoryRepository } from './billing-category.repository'

export class BillingCategoryService {
    constructor(
        private readonly repository = new BillingCategoryRepository()
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

        const category = this.repository.createEntity(payload)

        return this.repository.save(category)
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

        Object.assign(category, payload)

        return this.repository.save(category)
    }

    async softDelete(publicId: string) {
        const category = await this.findByPublicId(publicId)

        await this.repository.softDeleteById(category.id)

        return {
        publicId: category.publicId,
        deleted: true,
        }
    }
}