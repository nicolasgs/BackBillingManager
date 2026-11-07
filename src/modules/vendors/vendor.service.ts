import { ApiError } from '../../shared/errors'
import { AppDataSource } from '../../bootstrap/database'
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
        return AppDataSource.transaction(
          async (manager) => {
            const existing =
              await this.repository
                .findExistingByCompanyAndName(
                  {
                    companyId: payload.companyId,
                    name: payload.name,
                  },
                  manager
                )

            if (existing) {
              throw new ApiError(
                409,
                'VENDOR_ALREADY_EXISTS',
                'A vendor with this name already exists for this company'
              )
            }

            const vendorEntity =
              this.repository.createEntity(payload)

            const vendor =
              await this.repository
                .save(vendorEntity, manager)
                .catch((error: any) => {
                  if (
                    error?.code === '23505' &&
                    error?.constraint ===
                      'uq_vendors_company_name'
                  ) {
                    throw new ApiError(
                      409,
                      'VENDOR_ALREADY_EXISTS',
                      'A vendor with this name already exists for this company'
                    )
                  }

                  throw error
                })

            await this.auditLogService.log(
              {
                companyId:
                  vendor.companyId,

                companyPublicId:
                  vendor.companyPublicId,

                entityType:
                  AuditEntityType.VENDOR,

                entityId:
                  vendor.id,

                entityPublicId:
                  vendor.publicId,

                action:
                  AuditAction.CREATE,

                newValues:
                  vendor,

                authContext,
              },
              manager
            )

            return vendor
          }
        )
    }

    async findAll(filters: VendorFilters) {
        return this.repository.findAll(filters)
    }

    async findByPublicId(publicId: string, companyId: number) {
        const vendor = await this.repository.findByPublicId(
            publicId,
            companyId
        )

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
        const transactionResult = await AppDataSource.transaction(
          async (manager) => {
            const vendor = await this.repository.findByPublicIdForUpdate(
              publicId,
              companyId,
              manager
            )

            if (!vendor) {
              throw new ApiError(
                404,
                'VENDOR_NOT_FOUND',
                'Vendor not found'
              )
            }

            const originalVendor = {
              ...vendor,
            }

            Object.assign(vendor, payload)

            const updatedVendor = await this.repository
              .save(vendor, manager)
              .catch((error: any) => {
                if (
                  error?.code === '23505' &&
                  error?.constraint === 'uq_vendors_company_name'
                ) {
                  throw new ApiError(
                    409,
                    'VENDOR_ALREADY_EXISTS',
                    'A vendor with this name already exists for this company'
                  )
                }

                throw error
              })

            await this.auditLogService.log(
              {
                companyId:
                  updatedVendor.companyId,

                companyPublicId:
                  updatedVendor.companyPublicId,

                entityType:
                  AuditEntityType.VENDOR,

                entityId:
                  updatedVendor.id,

                entityPublicId:
                  updatedVendor.publicId,

                action:
                  AuditAction.UPDATE,

                oldValues:
                  originalVendor,

                newValues:
                  updatedVendor,

                authContext,
              },
              manager
            )

            return {
              originalVendor,
              updatedVendor,
            }
          }
        )


        return transactionResult.updatedVendor
    }

    async softDelete(
        publicId: string,
        companyId: number,
        authContext?: AuthContext
        ) {
        const vendor = await AppDataSource.transaction(
          async (manager) => {
            const lockedVendor = await this.repository.findByPublicIdForUpdate(
              publicId,
              companyId,
              manager
            )

            if (!lockedVendor) {
              throw new ApiError(
                404,
                'VENDOR_NOT_FOUND',
                'Vendor not found'
              )
            }

            await this.repository.softDeleteById(
              lockedVendor.id,
              manager
            )

            await this.auditLogService.log(
              {
                companyId:
                  lockedVendor.companyId,

                companyPublicId:
                  lockedVendor.companyPublicId,

                entityType:
                  AuditEntityType.VENDOR,

                entityId:
                  lockedVendor.id,

                entityPublicId:
                  lockedVendor.publicId,

                action:
                  AuditAction.DELETE,

                oldValues:
                  lockedVendor,

                authContext,
              },
              manager
            )

            return lockedVendor
          }
        )


        return {
            publicId: vendor.publicId,
            deleted: true,
        }
    }
}
