import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../shared/entities/base.entity'
import { TransactionSource, TransactionStatus } from '../../shared/enums'
import { BillingCategoryEntity } from '../billing-categories/billing-category.entity'
import { PaymentMethodTypeEntity } from '../payment-method-type/payment-method-type.entity'
import { VendorEntity } from '../vendors/vendor.entity'

@Entity('expenses')
@Index(['companyId', 'expenseDate'])
@Index(['companyId', 'vendorId'])
export class ExpenseEntity extends BaseEntity {
    @Column({ name: 'company_id', type: 'int' })
    companyId!: number

    @Column({ name: 'company_public_id', type: 'uuid', nullable: true })
    companyPublicId?: string | null

    @Column({ name: 'vendor_id', type: 'int', nullable: true })
    vendorId?: number | null

    @ManyToOne(() => VendorEntity, { nullable: true })
    @JoinColumn({ name: 'vendor_id' })
    vendor?: VendorEntity | null

    @Column({ name: 'vendor_public_id', type: 'uuid', nullable: true })
    vendorPublicId?: string | null

    @Column({ name: 'vendor_name', type: 'varchar', length: 150, nullable: true })
    vendorName?: string | null

    @Column({ type: 'numeric', precision: 12, scale: 2 })
    amount!: number

    @Column({ type: 'varchar', length: 3, default: 'USD' })
    currency!: string

    @Column({ name: 'expense_date', type: 'date' })
    expenseDate!: string

    @Column({ name: 'category_id', type: 'int' })
    categoryId!: number

    @ManyToOne(() => BillingCategoryEntity)
    @JoinColumn({ name: 'category_id' })
    category!: BillingCategoryEntity

    @Column({ name: 'payment_method_code', type: 'varchar', length: 20 })
    paymentMethodCode!: string

    @ManyToOne(() => PaymentMethodTypeEntity)
    @JoinColumn({ name: 'payment_method_code', referencedColumnName: 'code' })
    paymentMethod!: PaymentMethodTypeEntity

    @Column({ type: 'text', nullable: true })
    description?: string | null

    @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
    referenceNumber?: string | null

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PAID })
    status!: TransactionStatus

    @Column({ type: 'enum', enum: TransactionSource, default: TransactionSource.MANUAL })
    source!: TransactionSource

    @Column({ name: 'external_provider', type: 'varchar', length: 50, nullable: true })
    externalProvider?: string | null

    @Column({ name: 'external_transaction_id', type: 'varchar', length: 150, nullable: true })
    externalTransactionId?: string | null
}