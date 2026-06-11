import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from '../../shared/entities/base.entity'
import { ClosingStatus } from '../../shared/enums'
import { MonthlyClosingItemEntity } from './monthly-closing-item.entity'

@Entity('monthly_closings')
@Index(['companyId', 'year', 'month'], { unique: true })
export class MonthlyClosingEntity extends BaseEntity {
    @Column({ name: 'company_id', type: 'int' })
    companyId!: number

    @Column({ name: 'company_public_id', type: 'uuid', nullable: true })
    companyPublicId?: string | null

    @Column({ type: 'int' })
    year!: number

    @Column({ type: 'int' })
    month!: number

    @Column({ name: 'total_income', type: 'numeric', precision: 12, scale: 2, default: 0 })
    totalIncome!: number

    @Column({ name: 'total_expense', type: 'numeric', precision: 12, scale: 2, default: 0 })
    totalExpense!: number

    @Column({ name: 'net_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
    netAmount!: number

    @Column({ type: 'enum', enum: ClosingStatus, default: ClosingStatus.DRAFT })
    status!: ClosingStatus

    @Column({ type: 'text', nullable: true })
    notes?: string | null

    @Column({ name: 'closed_by', type: 'uuid', nullable: true })
    closedBy?: string | null

    @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
    closedAt?: Date | null

    @OneToMany(() => MonthlyClosingItemEntity, (item) => item.monthlyClosing)
    items!: MonthlyClosingItemEntity[]
}