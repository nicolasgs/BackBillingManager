import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { numericTransformer } from "../../shared/database/numeric.transformer";
import {
  CompensationType,
  RevenueOwnerType,
} from "../../shared/enums";

@Entity("income_allocations")
export class IncomeAllocationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: "public_id",
    type: "uuid",
    unique: true,
    default: () => "gen_random_uuid()",
  })
  publicId!: string;

  @Column({
    name: "company_id",
    type: "int",
  })
  companyId!: number;

  @Column({
    name: "company_public_id",
    type: "uuid",
    nullable: true,
  })
  companyPublicId?: string | null;

  @Column({
    name: "income_id",
    type: "int",
  })
  incomeId!: number;

  @Column({
    name: "income_public_id",
    type: "uuid",
  })
  incomePublicId!: string;

  @Column({
    name: "case_id",
    type: "bigint",
    nullable: true,
  })
  caseId?: string | null;

  @Column({
    name: "case_public_id",
    type: "uuid",
    nullable: true,
  })
  casePublicId?: string | null;

  @Column({
    name: "owner_type",
    type: "varchar",
    length: 30,
  })
  ownerType!: RevenueOwnerType;

  @Column({
    name: "owner_public_id",
    type: "uuid",
    nullable: true,
  })
  ownerPublicId?: string | null;

  @Column({
    name: "owner_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  ownerName?: string | null;

  @Column({
    name: "revenue_agreement_id",
    type: "int",
    nullable: true,
  })
  revenueAgreementId?: number | null;

  @Column({
    name: "revenue_agreement_public_id",
    type: "uuid",
    nullable: true,
  })
  revenueAgreementPublicId?: string | null;

  @Column({
    name: "compensation_type",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  compensationType?: CompensationType | null;

  @Column({
    name: "percentage_applied",
    type: "numeric",
    precision: 7,
    scale: 4,
    nullable: true,
    transformer: numericTransformer,
  })
  percentageApplied?: number | null;

  @Column({
    name: "fixed_contract_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  fixedContractAmount?: number | null;

  @Column({
    name: "allocated_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  allocatedAmount!: number;

  @Column({
    type: "varchar",
    length: 3,
    default: "USD",
  })
  currency!: string;

  @Column({
    name: "allocation_sequence",
    type: "int",
    default: 0,
  })
  allocationSequence!: number;

  @Column({
    name: "created_by",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  createdBy?: string | null;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamp",
    nullable: true,
  })
  deletedAt?: Date | null;
}