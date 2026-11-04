import { EntityManager } from "typeorm";

import { AppDataSource } from "../../bootstrap/database";

import { BillingSettingsEntity } from "./billing-settings.entity";

export class BillingSettingsRepository {
  private repository = AppDataSource.getRepository(BillingSettingsEntity);

  private getRepository(manager?: EntityManager) {
    return manager
      ? manager.getRepository(BillingSettingsEntity)
      : this.repository;
  }

  createEntity(
    payload: Partial<BillingSettingsEntity>,
    manager?: EntityManager,
  ) {
    return this.getRepository(manager).create(payload);
  }

  save(
    settings: BillingSettingsEntity,
    manager?: EntityManager,
  ) {
    return this.getRepository(manager).save(settings);
  }

  async lockCompany(
    companyId: number,
    manager: EntityManager,
  ) {
    await manager.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))",
      [
        `billing-settings:${companyId}`,
      ],
    );
  }

  findByCompanyId(
    companyId: number,
    manager?: EntityManager,
  ) {
    return this.getRepository(manager).findOne({
      where: {
        companyId,
      },
      relations: {
        crmPaymentIncomeCategory: true,
      },
    });
  }
}
