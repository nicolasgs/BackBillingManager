import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../../shared/entities/base.entity'

@Entity('vendors')
@Index(['companyId', 'name'])
@Index(['companyId', 'taxId'])
export class VendorEntity extends BaseEntity {
  @Column({ name: 'company_id', type: 'int' })
  companyId!: number

  @Column({
    name: 'company_public_id',
    type: 'uuid',
    nullable: true,
  })
  companyPublicId?: string | null

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string

  @Column({
    type: 'varchar',
    length: 254,
    nullable: true,
  })
  email?: string | null

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  phone?: string | null

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  website?: string | null

  @Column({
    name: 'tax_id',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  taxId?: string | null

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string | null

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean
}