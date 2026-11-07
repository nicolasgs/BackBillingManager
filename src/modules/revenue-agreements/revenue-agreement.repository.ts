import { EntityManager, IsNull } from "typeorm";

import { AppDataSource } from "../../bootstrap/database";
import {
  CompensationType,
  RevenueParticipantType,
} from "../../shared/enums";
import { RevenueAgreementFilters } from "./interfaces/revenue-agreement-filters.interface";
import { RevenueAgreementEntity } from "./revenue-agreement.entity";

export class RevenueAgreementRepository {
  private repository =
    AppDataSource.getRepository(RevenueAgreementEntity);

  private getRepository(manager?: EntityManager) {
    return manager
      ? manager.getRepository(RevenueAgreementEntity)
      : this.repository;
  }

  createEntity(
    payload: Partial<RevenueAgreementEntity>,
    manager?: EntityManager,
  ) {
    return this.getRepository(manager).create(payload);
  }

  save(
    entity: RevenueAgreementEntity,
    manager?: EntityManager,
  ) {
    return this.getRepository(manager).save(entity);
  }

  async lockCase(
    companyId: number,
    casePublicId: string,
    manager: EntityManager,
  ) {
    await manager.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))",
      [
        `revenue-agreement-case:${companyId}:${casePublicId}`,
      ],
    );
  }

  findByPublicId(
    publicId: string,
    companyId: number,
  ) {
    return this.repository.findOne({
      where: {
        publicId,
        companyId,
        deletedAt: IsNull(),
      },
    });
  }

  findByPublicIdForUpdate(
    publicId: string,
    companyId: number,
    manager: EntityManager,
  ) {
    return manager
      .getRepository(RevenueAgreementEntity)
      .createQueryBuilder("agreement")
      .where("agreement.publicId = :publicId", {
        publicId,
      })
      .andWhere("agreement.companyId = :companyId", {
        companyId,
      })
      .andWhere("agreement.deletedAt IS NULL")
      .setLock("pessimistic_write")
      .getOne();
  }

  findActiveForParticipant(
    params: {
      companyId: number;
      casePublicId: string;
      participantType: RevenueParticipantType;
      participantPublicId: string;
    },
    manager?: EntityManager,
  ) {
    return this.getRepository(manager).findOne({
      where: {
        companyId: params.companyId,
        casePublicId: params.casePublicId,
        participantType: params.participantType,
        participantPublicId: params.participantPublicId,
        endedAt: IsNull(),
        deletedAt: IsNull(),
      },
    });
  }

  async findOverlappingForParticipant(
    params: {
      companyId: number;
      casePublicId: string;
      participantType: RevenueParticipantType;
      participantPublicId: string;
      effectiveFrom: string;
    },
    manager?: EntityManager,
  ) {
    return this.getRepository(manager)
      .createQueryBuilder("agreement")
      .where(
        "agreement.companyId = :companyId",
        {
          companyId: params.companyId,
        },
      )
      .andWhere(
        "agreement.casePublicId = :casePublicId",
        {
          casePublicId: params.casePublicId,
        },
      )
      .andWhere(
        "agreement.participantType = :participantType",
        {
          participantType: params.participantType,
        },
      )
      .andWhere(
        "agreement.participantPublicId = :participantPublicId",
        {
          participantPublicId:
            params.participantPublicId,
        },
      )
      .andWhere("agreement.deletedAt IS NULL")
      .andWhere(
        `(
          agreement.endedAt IS NULL
          OR agreement.endedAt >= :effectiveFrom
        )`,
        {
          effectiveFrom: params.effectiveFrom,
        },
      )
      .orderBy("agreement.effectiveFrom", "ASC")
      .getOne();
  }

  async sumOverlappingPercentages(
    params: {
      companyId: number;
      casePublicId: string;
      effectiveFrom: string;
    },
    manager?: EntityManager,
  ): Promise<number> {
    const result = await this.getRepository(manager)
      .createQueryBuilder("agreement")
      .select(
        "COALESCE(SUM(agreement.percentage), 0)",
        "total",
      )
      .where(
        "agreement.companyId = :companyId",
        {
          companyId: params.companyId,
        },
      )
      .andWhere(
        "agreement.casePublicId = :casePublicId",
        {
          casePublicId: params.casePublicId,
        },
      )
      .andWhere(
        "agreement.compensationType = :compensationType",
        {
          compensationType:
            CompensationType.PERCENTAGE,
        },
      )
      .andWhere("agreement.deletedAt IS NULL")
      .andWhere(
        `(
          agreement.endedAt IS NULL
          OR agreement.endedAt >= :effectiveFrom
        )`,
        {
          effectiveFrom: params.effectiveFrom,
        },
      )
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async findEffectiveForCase(
    params: {
      companyId: number;
      casePublicId: string;
      incomeDate: string;
    },
    manager: EntityManager,
  ) {
    return manager
      .getRepository(RevenueAgreementEntity)
      .createQueryBuilder("agreement")
      .where(
        "agreement.companyId = :companyId",
        {
          companyId: params.companyId,
        },
      )
      .andWhere(
        "agreement.casePublicId = :casePublicId",
        {
          casePublicId: params.casePublicId,
        },
      )
      .andWhere("agreement.deletedAt IS NULL")
      .andWhere(
        "agreement.effectiveFrom <= :incomeDate",
        {
          incomeDate: params.incomeDate,
        },
      )
      .andWhere(
        `(
          agreement.endedAt IS NULL
          OR agreement.endedAt >= :incomeDate
        )`,
        {
          incomeDate: params.incomeDate,
        },
      )
      .orderBy("agreement.priority", "ASC")
      .addOrderBy("agreement.id", "ASC")
      .setLock("pessimistic_write")
      .getMany();
  }
  async findAll(
    filters: RevenueAgreementFilters,
    manager?: EntityManager,
  ) {
    const query = this.getRepository(manager)
      .createQueryBuilder("agreement")
      .where(
        "agreement.companyId = :companyId",
        {
          companyId: filters.companyId,
        },
      )
      .andWhere("agreement.deletedAt IS NULL");

    if (filters.casePublicId) {
      query.andWhere(
        "agreement.casePublicId = :casePublicId",
        {
          casePublicId: filters.casePublicId,
        },
      );
    }

    if (filters.participantPublicId) {
      query.andWhere(
        "agreement.participantPublicId = :participantPublicId",
        {
          participantPublicId:
            filters.participantPublicId,
        },
      );
    }

    if (filters.participantType) {
      query.andWhere(
        "agreement.participantType = :participantType",
        {
          participantType: filters.participantType,
        },
      );
    }

    if (filters.compensationType) {
      query.andWhere(
        "agreement.compensationType = :compensationType",
        {
          compensationType:
            filters.compensationType,
        },
      );
    }

    if (filters.active === true) {
      query.andWhere("agreement.endedAt IS NULL");
    }

    if (filters.active === false) {
      query.andWhere(
        "agreement.endedAt IS NOT NULL",
      );
    }

    return query
      .orderBy(
        "agreement.effectiveFrom",
        "DESC",
      )
      .addOrderBy("agreement.id", "DESC")
      .getMany();
  }
}
