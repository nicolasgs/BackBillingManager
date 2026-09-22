import { EntityManager, IsNull } from "typeorm";

import { AppDataSource } from "../../bootstrap/database";

import { ReceiptEntity } from "./receipt.entity";

export class ReceiptRepository {
  private repository = AppDataSource.getRepository(ReceiptEntity);

  createEntity(payload: Partial<ReceiptEntity>, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.create(payload);
  }

  save(receipt: ReceiptEntity, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.save(receipt);
  }

  findByPublicId(publicId: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.findOne({
      where: {
        publicId,
        deletedAt: IsNull(),
      },
      relations: {
        income: true,
      },
    });
  }

  findByIncomeId(incomeId: number, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.findOne({
      where: {
        incomeId,
        deletedAt: IsNull(),
      },
      relations: {
        income: true,
      },
    });
  }

  findByIncomePublicId(incomePublicId: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.findOne({
      where: {
        incomePublicId,
        deletedAt: IsNull(),
      },
      relations: {
        income: true,
      },
    });
  }

  findByReceiptNumber(
    companyId: number,
    receiptNumber: string,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.findOne({
      where: {
        companyId,
        receiptNumber,
        deletedAt: IsNull(),
      },
      relations: {
        income: true,
      },
    });
  }
}
