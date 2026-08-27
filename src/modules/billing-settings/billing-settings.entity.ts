import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";

import { BillingCategoryEntity } from "../billing-categories/billing-category.entity";

@Entity("billing_settings")
@Index(["companyId"], {
  unique: true,
})
export class BillingSettingsEntity extends BaseEntity {
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
    name: "crm_payment_income_category_id",
    type: "int",
    nullable: true,
  })
  crmPaymentIncomeCategoryId?: number | null;

  @ManyToOne(() => BillingCategoryEntity, {
    nullable: true,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "crm_payment_income_category_id",
  })
  crmPaymentIncomeCategory?: BillingCategoryEntity | null;
}
