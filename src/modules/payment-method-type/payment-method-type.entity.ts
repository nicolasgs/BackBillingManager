import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('payment_method_type')
export class PaymentMethodTypeEntity {
    @PrimaryColumn({ type: 'varchar', length: 20 })
    code!: string

    @Column({ type: 'varchar', length: 100 })
    description!: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date | null
}