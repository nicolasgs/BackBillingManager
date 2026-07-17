import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../../shared/entities/base.entity'
import { BillingCategoryType } from '../../shared/enums'

@Entity('billing_categories')
@Index(['companyId', 'name', 'type'], { unique: true })
export class BillingCategoryEntity extends BaseEntity {
    
    @Column({ name: 'company_id', type: 'int' })
    companyId!: number

    @Column({ name: 'company_public_id', type: 'uuid', nullable: true })
    companyPublicId?: string | null

    @Column({ type: 'varchar', length: 120 })
    name!: string

    @Column({
        type: 'enum',
        enum: BillingCategoryType,
    })
    type!: BillingCategoryType

    @Column({ type: 'text', nullable: true })
    description?: string | null

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean
}