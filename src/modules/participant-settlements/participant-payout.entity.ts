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
import { ParticipantPayoutStatus } from "../../shared/enums";
import { PaymentMethodTypeEntity } from "../payment-method-type/payment-method-type.entity";
import { ParticipantSettlementEntity } from "./participant-settlement.entity";

@Entity("participant_payouts")
@Index(["settlementId"])
@Index(["companyId", "payoutDate"])
@Index(["companyId", "status"])
export class ParticipantPayoutEntity {
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
    name: "settlement_id",
    type: "int",
  })
  settlementId!: number;

  @ManyToOne(
    () => ParticipantSettlementEntity,
    (settlement) => settlement.payouts,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({
    name: "settlement_id",
  })
  settlement!: ParticipantSettlementEntity;

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
    name: "payout_date",
    type: "date",
  })
  payoutDate!: string;

  @Column({
    name: "payment_method_code",
    type: "varchar",
    length: 20,
  })
  paymentMethodCode!: string;

  @ManyToOne(
    () => PaymentMethodTypeEntity,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({
    name: "payment_method_code",
    referencedColumnName: "code",
  })
  paymentMethod!: PaymentMethodTypeEntity;

  @Column({
    name: "reference_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  referenceNumber?: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  notes?: string | null;

  @Column({
    type: "varchar",
    length: 20,
  })
  status!: ParticipantPayoutStatus;

  @Column({
    name: "external_provider",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  externalProvider?: string | null;

  @Column({
    name: "external_transaction_id",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  externalTransactionId?: string | null;

  @Column({
    name: "voided_by",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  voidedBy?: string | null;

  @Column({
    name: "voided_at",
    type: "timestamp",
    nullable: true,
  })
  voidedAt?: Date | null;

  @Column({
    name: "void_reason",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  voidReason?: string | null;

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