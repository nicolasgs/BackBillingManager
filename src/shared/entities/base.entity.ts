import {
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Column,
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'public_id', type: 'uuid', unique: true })
    publicId: string = uuidv4()

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy?: string | null

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date | null
}