import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { AuditAction, AuditEntityType } from '../../shared/enums'

@Entity('billing_audit_logs')
export class BillingAuditLogEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'public_id', type: 'uuid', unique: true })
  publicId: string = uuidv4()

  @Column({ name: 'company_id', type: 'int' })
  companyId!: number

  @Column({ name: 'company_public_id', type: 'uuid', nullable: true })
  companyPublicId?: string | null

  @Column({ name: 'entity_type', type: 'enum', enum: AuditEntityType })
  entityType!: AuditEntityType

  @Column({ name: 'entity_id', type: 'int', nullable: true })
  entityId?: number | null

  @Column({ name: 'entity_public_id', type: 'uuid', nullable: true })
  entityPublicId?: string | null

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues?: any

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues?: any

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy?: string | null

  @Column({ name: 'performed_by_email', type: 'varchar', length: 150, nullable: true })
  performedByEmail?: string | null

  @Column({ name: 'performed_by_username', type: 'varchar', length: 150, nullable: true })
  performedByUsername?: string | null

  @Column({ name: 'performed_by_role', type: 'varchar', length: 80, nullable: true })
  performedByRole?: string | null

  @Column({ name: 'ip_address', type: 'varchar', length: 80, nullable: true })
  ipAddress?: string | null

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}