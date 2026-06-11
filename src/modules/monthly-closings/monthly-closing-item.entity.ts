import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { ClosingItemType } from '../../shared/enums'
import { MonthlyClosingEntity } from './monthly-closing.entity'

@Entity('monthly_closing_items')
export class MonthlyClosingItemEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'public_id', type: 'uuid', unique: true })
    publicId: string = uuidv4()

    @Column({ name: 'monthly_closing_id', type: 'int' })
    monthlyClosingId!: number

    @ManyToOne(() => MonthlyClosingEntity, (closing) => closing.items)
    @JoinColumn({ name: 'monthly_closing_id' })
    monthlyClosing!: MonthlyClosingEntity

    @Column({ name: 'company_id', type: 'int' })
    companyId!: number

    @Column({ name: 'company_public_id', type: 'uuid', nullable: true })
    companyPublicId?: string | null

    @Column({ name: 'entity_type', type: 'enum', enum: ClosingItemType })
    entityType!: ClosingItemType

    @Column({ name: 'entity_id', type: 'int' })
    entityId!: number

    @Column({ name: 'entity_public_id', type: 'uuid' })
    entityPublicId!: string

    @Column({ type: 'numeric', precision: 12, scale: 2 })
    amount!: number

    @Column({ name: 'transaction_date', type: 'date' })
    transactionDate!: string

    @Column({ name: 'category_id', type: 'int', nullable: true })
    categoryId?: number | null

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date
}