import { IsNull } from "typeorm";

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

  createEntity(payload: Partial<RevenueAgreementEntity>) {
    return this.repository.create(payload);
  }

  save(entity: RevenueAgreementEntity) {
    return this.repository.save(entity);
  }

  findByPublicId(publicId: string) {
    return this.repository.findOne({
      where: {
        publicId,
        deletedAt: IsNull(),
      },
    });
  }

  findActiveForParticipant(params: {
    companyId: number;
    casePublicId: string;
    participantType: RevenueParticipantType;
    participantPublicId: string;
  }) {
    return this.repository.findOne({
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

  async findOverlappingForParticipant(params: {
    companyId: number;
    casePublicId: string;
    participantType: RevenueParticipantType;
    participantPublicId: string;
    effectiveFrom: string;
  }) {
    return this.repository
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

  async sumOverlappingPercentages(params: {
    companyId: number;
    casePublicId: string;
    effectiveFrom: string;
  }): Promise<number> {
    const result = await this.repository
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

  async findAll(filters: RevenueAgreementFilters) {
    const query = this.repository
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
