import { AppDataSource } from "../../bootstrap/database";

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
    return AppDataSource.transaction(
      async (manager) => {
        await this.repository.lockCompany(
          payload.companyId,
          manager,
        );

        if (payload.crmPaymentIncomeCategoryId !== null) {
          const category =
            await this.categoryRepository
              .findByIdAndCompanyAndTypeForUpdate(
                {
                  id:
                    payload.crmPaymentIncomeCategoryId,

                  companyId:
                    payload.companyId,

                  type:
                    BillingCategoryType.INCOME,
                },
                manager,
              );

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

        let settings =
          await this.repository.findByCompanyId(
            payload.companyId,
            manager,
          );

        if (!settings) {
          settings = this.repository.createEntity(
            {
              companyId: payload.companyId,

              companyPublicId:
                payload.companyPublicId ?? null,

              createdBy: payload.createdBy,

              crmPaymentIncomeCategoryId:
                payload.crmPaymentIncomeCategoryId,
            },
            manager,
          );
        } else {
          settings.crmPaymentIncomeCategoryId =
            payload.crmPaymentIncomeCategoryId;

          if (payload.companyPublicId !== undefined) {
            settings.companyPublicId =
              payload.companyPublicId;
          }
        }

        return this.repository.save(
          settings,
          manager,
        );
      },
    );
  }
}
