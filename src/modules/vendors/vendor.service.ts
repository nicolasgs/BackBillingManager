import { ApiError } from '../../shared/errors'
import {
    CreateVendorDto,
    ListVendorsQueryDto,
    UpdateVendorDto,
} from './dto/vendor.dto'
import { VendorRepository } from './vendor.repository'

export class VendorService {
    constructor(
        private readonly repository = new VendorRepository()
    ) {}

    async create(payload: CreateVendorDto) {
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

        const vendor = this.repository.createEntity(payload)

        return this.repository.save(vendor)
    }

    async findAll(filters: ListVendorsQueryDto) {
        return this.repository.findAll(filters)
    }

    async findByPublicId(publicId: string) {
        const vendor = await this.repository.findByPublicId(publicId)

        if (!vendor) {
        throw new ApiError(404, 'VENDOR_NOT_FOUND', 'Vendor not found')
        }

        return vendor
    }

    async update(publicId: string, payload: UpdateVendorDto) {
        const vendor = await this.findByPublicId(publicId)

        Object.assign(vendor, payload)

        return this.repository.save(vendor)
    }

    async softDelete(publicId: string) {
        const vendor = await this.findByPublicId(publicId)

        await this.repository.softDeleteById(vendor.id)

        return {
        publicId: vendor.publicId,
        deleted: true,
        }
    }
}