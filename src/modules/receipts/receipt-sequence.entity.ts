import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("receipt_sequences")
export class ReceiptSequenceEntity {
  @PrimaryColumn({
    name: "company_id",
    type: "int",
  })
  companyId!: number;

  @PrimaryColumn({
    type: "int",
  })
  year!: number;

  @Column({
    name: "last_number",
    type: "int",
    default: 0,
  })
  lastNumber!: number;

  @Column({
    name: "created_at",
    type: "timestamp without time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @Column({
    name: "updated_at",
    type: "timestamp without time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
