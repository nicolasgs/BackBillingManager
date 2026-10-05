import { Column, Entity, Index } from "typeorm";

import { numericTransformer } from "../../shared/database/numeric.transformer";
import { BaseEntity } from "../../shared/entities/base.entity";
import {
  CompensationType,
  RevenueParticipantType,
} from "../../shared/enums";

@Entity("case_revenue_agreements")
@Index(["companyId", "casePublicId"])
@Index(["companyId", "participantType", "participantPublicId"])
export class RevenueAgreementEntity extends BaseEntity {
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
    name: "case_id",
    type: "bigint",
    nullable: true,
  })
  caseId?: string | null;

  @Column({
    name: "case_public_id",
    type: "uuid",
  })
  casePublicId!: string;

  @Column({
    name: "participant_type",
    type: "varchar",
    length: 30,
  })
  participantType!: RevenueParticipantType;

  @Column({
    name: "participant_public_id",
    type: "uuid",
  })
  participantPublicId!: string;

  @Column({
    name: "participant_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  participantName?: string | null;

  @Column({
    name: "compensation_type",
    type: "varchar",
    length: 20,
  })
  compensationType!: CompensationType;

  @Column({
    type: "numeric",
    precision: 7,
    scale: 4,
    nullable: true,
    transformer: numericTransformer,
  })
  percentage?: number | null;

  @Column({
    name: "fixed_amount",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  fixedAmount?: number | null;

  @Column({
    type: "int",
    default: 100,
  })
  priority!: number;

  @Column({
    name: "effective_from",
    type: "date",
  })
  effectiveFrom!: string;

  @Column({
    name: "ended_at",
    type: "date",
    nullable: true,
  })
  endedAt?: string | null;
}
