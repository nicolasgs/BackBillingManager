import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    name: 'public_id',
    type: 'uuid',
    unique: true,
  })
  publicId!: string

  @Column({
    name: 'created_by',
    type: 'uuid',
    nullable: true,
  })
  createdBy?: string | null

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date | null

  @BeforeInsert()
  generatePublicId(): void {
    if (!this.publicId) {
      this.publicId = uuidv4()
    }
  }
}