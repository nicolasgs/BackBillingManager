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

  findByPublicId(
    publicId: string,
    companyId: number,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.findOne({
      where: {
        publicId,
        companyId,
        deletedAt: IsNull(),
      },
      relations: {
        income: true,
      },
    });
  }

  findByIncomeId(
    incomeId: number,
    companyId: number,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.findOne({
      where: {
        incomeId,
        companyId,
        deletedAt: IsNull(),
      },
      relations: {
        income: true,
      },
    });
  }

  findByIncomePublicId(
    incomePublicId: string,
    companyId: number,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(ReceiptEntity)
      : this.repository;

    return repository.findOne({
      where: {
        incomePublicId,
        companyId,
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
