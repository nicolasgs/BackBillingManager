import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { numericTransformer } from "../../shared/database/numeric.transformer";
import { RevenueOwnerType } from "../../shared/enums";
import { MonthlyClosingEntity } from "./monthly-closing.entity";
import { MonthlyClosingParticipantStatementItemEntity } from "./monthly-closing-participant-statement-item.entity";

@Entity("monthly_closing_participant_statements")
@Index(["monthlyClosingId"])
@Index(["companyId", "ownerType", "ownerPublicId"])
export class MonthlyClosingParticipantStatementEntity {
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
    name: "monthly_closing_id",
    type: "int",
  })
  monthlyClosingId!: number;

  @ManyToOne(
    () => MonthlyClosingEntity,
    (closing) => closing.participantStatements,
    {
      nullable: false,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "monthly_closing_id",
  })
  monthlyClosing!: MonthlyClosingEntity;

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
    name: "gross_allocated_income",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  grossAllocatedIncome!: number;

  @Column({
    name: "attributed_expense",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  attributedExpense!: number;

  @Column({
    name: "net_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  netAmount!: number;

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

  @OneToMany(
    () => MonthlyClosingParticipantStatementItemEntity,
    (item) => item.participantStatement,
  )
  items!: MonthlyClosingParticipantStatementItemEntity[];
}