import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { numericTransformer } from "../../shared/database/numeric.transformer";
import { ReceiptStorageProvider } from "../../shared/enums";

import { IncomeEntity } from "../incomes/income.entity";

@Entity("receipts")
@Index(["incomeId"], { unique: true })
@Index(["companyId", "receiptNumber"], { unique: true })
export class ReceiptEntity extends BaseEntity {
  @Column({
    name: "receipt_number",
    type: "varchar",
    length: 50,
  })
  receiptNumber!: string;

  @Column({
    name: "income_id",
    type: "int",
  })
  incomeId!: number;

  @ManyToOne(() => IncomeEntity, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "income_id" })
  income!: IncomeEntity;

  @Column({
    name: "income_public_id",
    type: "uuid",
  })
  incomePublicId!: string;

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
    name: "payment_date",
    type: "date",
  })
  paymentDate!: string;

  @Column({
    type: "varchar",
    length: 1000,
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: "payment_method_code",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  paymentMethodCode?: string | null;

  @Column({
    name: "reference_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  referenceNumber?: string | null;

  @Column({
    name: "client_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  clientName?: string | null;

  @Column({
    name: "case_reference",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  caseReference?: string | null;

  @Column({
    name: "issued_at",
    type: "timestamp without time zone",
  })
  issuedAt!: Date;

  @Column({
    name: "file_storage_provider",
    type: "enum",
    enum: ReceiptStorageProvider,
    nullable: true,
  })
  fileStorageProvider?: ReceiptStorageProvider | null;

  @Column({
    name: "file_bucket",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  fileBucket?: string | null;

  @Column({
    name: "file_key",
    type: "varchar",
    length: 1000,
    nullable: true,
  })
  fileKey?: string | null;

  @Column({
    name: "file_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  fileName?: string | null;

  @Column({
    name: "file_mime_type",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  fileMimeType?: string | null;

  @Column({
    name: "file_size",
    type: "bigint",
    nullable: true,
  })
  fileSize?: string | null;

  @Column({
    name: "file_checksum",
    type: "varchar",
    length: 128,
    nullable: true,
  })
  fileChecksum?: string | null;

  @Column({
    name: "generated_at",
    type: "timestamp without time zone",
    nullable: true,
  })
  generatedAt?: Date | null;
}
