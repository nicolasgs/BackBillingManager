import { AppDataSource } from "../../bootstrap/database";

import { ApiError } from "../../shared/errors";

import {
  AuditAction,
  AuditEntityType,
  BillingCategoryType,
} from "../../shared/enums";
import { AuthContext } from "../audit-logs/interfaces/auth-context.interface";

import { AuditLogService } from "../audit-logs/audit-log.service";
import { BillingCategoryRepository } from "../billing-categories/billing-category.repository";

import type { UpdateBillingSettingsDto } from "./dto/billing-settings.dto";

import { BillingSettingsRepository } from "./billing-settings.repository";

export class BillingSettingsService {
  constructor(
    private readonly repository = new BillingSettingsRepository(),

    private readonly categoryRepository = new BillingCategoryRepository(),

    private readonly auditLogService = new AuditLogService(),
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
    authContext?: AuthContext,
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
          await this.repository.findByCompanyIdForUpdate(
            payload.companyId,
            manager,
          );

        const isCreate = !settings;

        const oldValues = settings
          ? {
              crmPaymentIncomeCategoryId:
                settings.crmPaymentIncomeCategoryId ??
                null,

              companyPublicId:
                settings.companyPublicId ??
                null,
            }
          : null;

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

          if (
            payload.companyPublicId !==
            undefined
          ) {
            settings.companyPublicId =
              payload.companyPublicId;
          }
        }

        const newValues = {
          crmPaymentIncomeCategoryId:
            settings.crmPaymentIncomeCategoryId ??
            null,

          companyPublicId:
            settings.companyPublicId ??
            null,
        };

        const hasChanges =
          isCreate ||
          oldValues
            ?.crmPaymentIncomeCategoryId !==
            newValues.crmPaymentIncomeCategoryId ||
          oldValues
            ?.companyPublicId !==
            newValues.companyPublicId;

        if (hasChanges) {
          settings =
            await this.repository.save(
              settings,
              manager,
            );

          await this.auditLogService.log(
            {
              companyId:
                settings.companyId,

              companyPublicId:
                settings.companyPublicId ??
                null,

              entityType:
                AuditEntityType.BILLING_SETTINGS,

              entityId:
                settings.id,

              entityPublicId:
                settings.publicId,

              action:
                isCreate
                  ? AuditAction.CREATE
                  : AuditAction.UPDATE,

              oldValues,

              newValues,

              authContext,
            },
            manager,
          );
        }

        /*
         * Reload so the returned
         * crmPaymentIncomeCategory relation always
         * matches the FK that was just persisted.
         */
        return this.repository.findByCompanyId(
          payload.companyId,
          manager,
        );
      },
    );
  }
}
