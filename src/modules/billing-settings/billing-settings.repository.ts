import { AppDataSource } from "../../bootstrap/database";

import { BillingSettingsEntity } from "./billing-settings.entity";

export class BillingSettingsRepository {
  private repository = AppDataSource.getRepository(BillingSettingsEntity);

  createEntity(payload: Partial<BillingSettingsEntity>) {
    return this.repository.create(payload);
  }

  save(settings: BillingSettingsEntity) {
    return this.repository.save(settings);
  }

  findByCompanyId(companyId: number) {
    return this.repository.findOne({
      where: {
        companyId,
      },
      relations: {
        crmPaymentIncomeCategory: true,
      },
    });
  }
}
