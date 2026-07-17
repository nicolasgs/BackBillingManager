import { ApiError } from '../../shared/errors'
import {
  CreateVendorDto,
  ListVendorsQueryDto,
  UpdateVendorDto,
} from './dto/vendor.dto'
import { VendorRepository } from './vendor.repository'
import { AuditLogService } from '../audit-logs/audit-log.service'
import {
  AuditAction,
  AuditEntityType,
} from '../../shared/enums'
import { AuthContext } from '../audit-logs/interfaces/auth-context.interface'
import { VendorFilters } from './interfaces/vendor-filters.interface'

export class VendorService {
  constructor(
    private readonly repository = new VendorRepository(),
    private readonly auditLogService = new AuditLogService()
  ) {}

    async create(
        payload: CreateVendorDto,
        authContext?: AuthContext
    ) {
        const existing = await this.repository.findExistingByCompanyAndName({
        companyId: payload.companyId,
        name: payload.name,
        })

        if (existing) {
        throw new ApiError(
            409,
            'VENDOR_ALREADY_EXISTS',
            'A vendor with this name already exists for this company'
        )
        }

        const vendorEntity = this.repository.createEntity(payload)

        const vendor = await this.repository.save(vendorEntity)

        await this.auditLogService.log({
        companyId: vendor.companyId,
        companyPublicId: vendor.companyPublicId,

        entityType: AuditEntityType.VENDOR,
        entityId: vendor.id,
        entityPublicId: vendor.publicId,

        action: AuditAction.CREATE,

        newValues: vendor,

        authContext,
        })

        return vendor
    }

    async findAll(filters: VendorFilters) {
        return this.repository.findAll(filters)
    }

    async findByPublicId(publicId: string, companyId: number) {
        const vendor = await this.repository.findByPublicId(publicId)

        if (!vendor || vendor.companyId !== companyId) {
            throw new ApiError(
            404,
            'VENDOR_NOT_FOUND',
            'Vendor not found'
            )
        }

        return vendor
    }

    async update(
        publicId: string,
        payload: UpdateVendorDto,
        companyId: number,
        authContext?: AuthContext
        ) {
        const vendor = await this.findByPublicId(publicId, companyId)

        const originalVendor = {
            ...vendor,
        }

        Object.assign(vendor, payload)

        const updatedVendor = await this.repository.save(vendor)

        await this.auditLogService.log({
            companyId: updatedVendor.companyId,
            companyPublicId: updatedVendor.companyPublicId,
            entityType: AuditEntityType.VENDOR,
            entityId: updatedVendor.id,
            entityPublicId: updatedVendor.publicId,
            action: AuditAction.UPDATE,
            oldValues: originalVendor,
            newValues: updatedVendor,
            authContext,
        })

        return updatedVendor
    }

    async softDelete(
        publicId: string,
        companyId: number,
        authContext?: AuthContext
        ) {
        const vendor = await this.findByPublicId(publicId, companyId)

        await this.repository.softDeleteById(vendor.id)

        await this.auditLogService.log({
            companyId: vendor.companyId,
            companyPublicId: vendor.companyPublicId,
            entityType: AuditEntityType.VENDOR,
            entityId: vendor.id,
            entityPublicId: vendor.publicId,
            action: AuditAction.DELETE,
            oldValues: vendor,
            authContext,
        })

        return {
            publicId: vendor.publicId,
            deleted: true,
        }
    }
}