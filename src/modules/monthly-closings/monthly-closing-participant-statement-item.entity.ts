import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { numericTransformer } from "../../shared/database/numeric.transformer";
import { MonthlyClosingParticipantStatementEntity } from "./monthly-closing-participant-statement.entity";

export type MonthlyClosingParticipantStatementItemType =
  | "INCOME_ALLOCATION"
  | "EXPENSE";

@Entity("monthly_closing_participant_statement_items")
@Index(["participantStatementId"])
@Index(["itemType", "sourceEntityPublicId"])
@Index(["companyId", "transactionDate"])
@Index(["companyId", "casePublicId"])
export class MonthlyClosingParticipantStatementItemEntity {
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
    name: "participant_statement_id",
    type: "int",
  })
  participantStatementId!: number;

  @ManyToOne(
    () => MonthlyClosingParticipantStatementEntity,
    (statement) => statement.items,
    {
      nullable: false,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "participant_statement_id",
  })
  participantStatement!: MonthlyClosingParticipantStatementEntity;

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
    name: "item_type",
    type: "varchar",
    length: 30,
  })
  itemType!: MonthlyClosingParticipantStatementItemType;

  @Column({
    name: "source_entity_id",
    type: "int",
  })
  sourceEntityId!: number;

  @Column({
    name: "source_entity_public_id",
    type: "uuid",
  })
  sourceEntityPublicId!: string;

  @Column({
    name: "parent_entity_id",
    type: "int",
    nullable: true,
  })
  parentEntityId?: number | null;

  @Column({
    name: "parent_entity_public_id",
    type: "uuid",
    nullable: true,
  })
  parentEntityPublicId?: string | null;

  @Column({
    name: "case_id",
    type: "bigint",
    nullable: true,
  })
  caseId?: string | number | null;

  @Column({
    name: "case_public_id",
    type: "uuid",
    nullable: true,
  })
  casePublicId?: string | null;

  @Column({
    type: "numeric",
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  amount!: number;

  @Column({
    type: "varchar",
    length: 3,
    default: "USD",
  })
  currency!: string;

  @Column({
    name: "transaction_date",
    type: "date",
  })
  transactionDate!: string;

  @Column({
    name: "category_id",
    type: "int",
    nullable: true,
  })
  categoryId?: number | null;

  @Column({
    name: "category_name",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  categoryName?: string | null;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: "reference_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  referenceNumber?: string | null;

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