import { ApiError } from "../../shared/errors";

import { BillingCategoryType } from "../../shared/enums";

import { BillingCategoryRepository } from "../billing-categories/billing-category.repository";

import type { UpdateBillingSettingsDto } from "./dto/billing-settings.dto";

import { BillingSettingsRepository } from "./billing-settings.repository";

export class BillingSettingsService {
  constructor(
    private readonly repository = new BillingSettingsRepository(),

    private readonly categoryRepository = new BillingCategoryRepository(),
  ) {}

  async findByCompany(companyId: number) {
    return this.repository.findByCompanyId(companyId);
  }

  async upsert(
    payload: UpdateBillingSettingsDto & {
      companyId: number;
      companyPublicId?: string | null;
      createdBy?: string;
    },
  ) {
    if (payload.crmPaymentIncomeCategoryId !== null) {
      const category = await this.categoryRepository.findByIdAndCompanyAndType({
        id: payload.crmPaymentIncomeCategoryId,

        companyId: payload.companyId,

        type: BillingCategoryType.INCOME,
      });

      if (!category) {
        throw new ApiError(
          400,
          "INVALID_CRM_PAYMENT_INCOME_CATEGORY",
          "The selected CRM payment income category is invalid.",
        );
      }

      if (!category.isActive) {
        throw new ApiError(
          400,
          "INACTIVE_CRM_PAYMENT_INCOME_CATEGORY",
          "The selected CRM payment income category is inactive.",
        );
      }
    }

    let settings = await this.repository.findByCompanyId(payload.companyId);

    if (!settings) {
      settings = this.repository.createEntity({
        companyId: payload.companyId,

        companyPublicId: payload.companyPublicId ?? null,

        createdBy: payload.createdBy,

        crmPaymentIncomeCategoryId: payload.crmPaymentIncomeCategoryId,
      });
    } else {
      settings.crmPaymentIncomeCategoryId = payload.crmPaymentIncomeCategoryId;

      if (payload.companyPublicId !== undefined) {
        settings.companyPublicId = payload.companyPublicId;
      }
    }

    return this.repository.save(settings);
  }
}
