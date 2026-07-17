import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm'
import { BaseEntity } from '../../shared/entities/base.entity'
import {
  TransactionSource,
  TransactionStatus,
} from '../../shared/enums'
import { BillingCategoryEntity } from '../billing-categories/billing-category.entity'
import { PaymentMethodTypeEntity } from '../payment-method-type/payment-method-type.entity'

const numericTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? null : Number(value),
}

@Entity('incomes')
@Index(['companyId', 'incomeDate'])
@Index(['companyId', 'clientId'])
@Index(['companyId', 'caseId'])
@Index(['companyId', 'clientPublicId'])
@Index(['companyId', 'casePublicId'])
@Index(
  ['companyId', 'externalProvider', 'externalTransactionId'],
  { unique: true }
)
export class IncomeEntity extends BaseEntity {
  @Column({ name: 'company_id', type: 'int' })
  companyId!: number

  @Column({
    name: 'company_public_id',
    type: 'uuid',
    nullable: true,
  })
  companyPublicId?: string | null

  @Column({
    name: 'client_id',
    type: 'int',
    nullable: true,
  })
  clientId?: number | null

  @Column({
    name: 'case_id',
    type: 'int',
    nullable: true,
  })
  caseId?: number | null

  @Column({
    name: 'client_public_id',
    type: 'uuid',
    nullable: true,
  })
  clientPublicId?: string | null

  @Column({
    name: 'case_public_id',
    type: 'uuid',
    nullable: true,
  })
  casePublicId?: string | null

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  amount!: number

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD',
  })
  currency!: string

  @Column({
    name: 'income_date',
    type: 'date',
  })
  incomeDate!: string

  @Column({
    name: 'category_id',
    type: 'int',
  })
  categoryId!: number

  @ManyToOne(() => BillingCategoryEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: BillingCategoryEntity

  @Column({
    name: 'payment_method_code',
    type: 'varchar',
    length: 20,
  })
  paymentMethodCode!: string

  @ManyToOne(() => PaymentMethodTypeEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'payment_method_code',
    referencedColumnName: 'code',
  })
  paymentMethod!: PaymentMethodTypeEntity

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null

  @Column({
    name: 'reference_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referenceNumber?: string | null

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PAID,
  })
  status!: TransactionStatus

  @Column({
    type: 'enum',
    enum: TransactionSource,
    default: TransactionSource.MANUAL,
  })
  source!: TransactionSource

  @Column({
    name: 'external_provider',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  externalProvider?: string | null

  @Column({
    name: 'external_transaction_id',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  externalTransactionId?: string | null
}