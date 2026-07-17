import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm'
import { BaseEntity } from '../../shared/entities/base.entity'
import { numericTransformer } from '../../shared/database/numeric.transformer'
import { ClosingItemType } from '../../shared/enums'
import { MonthlyClosingEntity } from './monthly-closing.entity'

@Entity('monthly_closing_items')
@Index(['monthlyClosingId'])
@Index(['companyId'])
export class MonthlyClosingItemEntity extends BaseEntity {
  @Column({
    name: 'monthly_closing_id',
    type: 'int',
  })
  monthlyClosingId!: number

  @ManyToOne(
    () => MonthlyClosingEntity,
    (closing) => closing.items,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'monthly_closing_id' })
  monthlyClosing!: MonthlyClosingEntity

  @Column({
    name: 'company_id',
    type: 'int',
  })
  companyId!: number

  @Column({
    name: 'company_public_id',
    type: 'uuid',
    nullable: true,
  })
  companyPublicId?: string | null

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: ClosingItemType,
  })
  entityType!: ClosingItemType

  @Column({
    name: 'entity_id',
    type: 'int',
  })
  entityId!: number

  @Column({
    name: 'entity_public_id',
    type: 'uuid',
  })
  entityPublicId!: string

  @Column({
    name: 'entity_description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  entityDescription?: string | null

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  amount!: number

  @Column({
    name: 'transaction_date',
    type: 'date',
  })
  transactionDate!: string

  @Column({
    name: 'category_id',
    type: 'int',
    nullable: true,
  })
  categoryId?: number | null

  @Column({
    name: 'category_name',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  categoryName?: string | null
}