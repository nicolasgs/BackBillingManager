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
import {
  ParticipantSettlementStatus,
  RevenueOwnerType,
} from "../../shared/enums";
import { MonthlyClosingParticipantStatementEntity } from "../monthly-closings/monthly-closing-participant-statement.entity";
import { ParticipantPayoutEntity } from "./participant-payout.entity";

@Entity("participant_settlements")
@Index(["participantStatementId"])
@Index(["companyId", "status"])
@Index(["companyId", "ownerType", "ownerPublicId"])
export class ParticipantSettlementEntity {
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
    {
      nullable: false,
      onDelete: "RESTRICT",
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
    name: "statement_net_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  statementNetAmount!: number;

  @Column({
    name: "amount_due",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  amountDue!: number;

  @Column({
    name: "paid_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  paidAmount!: number;

  @Column({
    name: "outstanding_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  outstandingAmount!: number;

  @Column({
    type: "varchar",
    length: 30,
  })
  status!: ParticipantSettlementStatus;

  @Column({
    type: "text",
    nullable: true,
  })
  notes?: string | null;

  @Column({
    name: "settled_by",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  settledBy?: string | null;

  @Column({
    name: "settled_at",
    type: "timestamp",
    nullable: true,
  })
  settledAt?: Date | null;

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
    () => ParticipantPayoutEntity,
    (payout) => payout.settlement,
  )
  payouts!: ParticipantPayoutEntity[];
}