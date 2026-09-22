import { IsNull } from "typeorm";
import { AppDataSource } from "../../bootstrap/database";
import { IncomeEntity } from "./income.entity";

export class IncomeRepository {
  private repository = AppDataSource.getRepository(IncomeEntity);

  createEntity(payload: Partial<IncomeEntity>) {
    return this.repository.create(payload);
  }

  save(income: IncomeEntity) {
    return this.repository.save(income);
  }

  async findAll(filters: any) {
    const page = Math.max(Number(filters.page ?? 1), 1);

    const limit = Math.min(Math.max(Number(filters.limit ?? 25), 1), 100);

    const query = this.repository
      .createQueryBuilder("income")
      .leftJoinAndSelect("income.category", "category")
      .leftJoinAndSelect("income.paymentMethod", "paymentMethod")
      .where("income.companyId = :companyId", {
        companyId: filters.companyId,
      })
      .andWhere("income.deletedAt IS NULL");

    if (filters.clientId) {
      query.andWhere("income.clientId = :clientId", {
        clientId: filters.clientId,
      });
    }

    if (filters.caseId) {
      query.andWhere("income.caseId = :caseId", {
        caseId: filters.caseId,
      });
    }

    if (filters.clientPublicId) {
      query.andWhere("income.clientPublicId = :clientPublicId", {
        clientPublicId: filters.clientPublicId,
      });
    }

    if (filters.casePublicId) {
      query.andWhere("income.casePublicId = :casePublicId", {
        casePublicId: filters.casePublicId,
      });
    }

    if (filters.categoryId) {
      query.andWhere("income.categoryId = :categoryId", {
        categoryId: filters.categoryId,
      });
    }

    if (filters.paymentMethodCode) {
      query.andWhere("income.paymentMethodCode = :paymentMethodCode", {
        paymentMethodCode: String(filters.paymentMethodCode).toUpperCase(),
      });
    }

    if (filters.status) {
      query.andWhere("income.status = :status", {
        status: filters.status,
      });
    }

    if (filters.fromDate) {
      query.andWhere("income.incomeDate >= :fromDate", {
        fromDate: filters.fromDate,
      });
    }

    if (filters.toDate) {
      query.andWhere("income.incomeDate <= :toDate", {
        toDate: filters.toDate,
      });
    }

    if (filters.search) {
      const search = `%${String(filters.search).trim().toLowerCase()}%`;

      query.andWhere(
        `(
        LOWER(COALESCE(income.clientName, '')) LIKE :search
        OR LOWER(COALESCE(income.caseReference, '')) LIKE :search
        OR LOWER(COALESCE(income.referenceNumber, '')) LIKE :search
        OR LOWER(COALESCE(income.description, '')) LIKE :search
      )`,
        {
          search,
        },
      );
    }

    const sortableColumns: Record<string, string> = {
      incomeDate: "income.incomeDate",

      amount: "income.amount",

      clientName: "income.clientName",

      caseReference: "income.caseReference",

      paymentMethodCode: "income.paymentMethodCode",

      createdAt: "income.createdAt",
    };

    const sortColumn =
      sortableColumns[filters.sortBy ?? "incomeDate"] ?? "income.incomeDate";

    const sortOrder =
      String(filters.sortOrder ?? "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    const [items, totalItems] = await query
      .orderBy(sortColumn, sortOrder)
      .addOrderBy("income.id", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,

      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  findByPublicId(publicId: string) {
    return this.repository.findOne({
      where: {
        publicId,
        deletedAt: IsNull(),
      },
      relations: {
        category: true,
        paymentMethod: true,
      },
    });
  }

  findByExternalReference(params: {
    companyId: number;
    externalProvider: string;
    externalTransactionId: string;
  }) {
    return this.repository.findOne({
      where: {
        companyId: params.companyId,

        externalProvider: params.externalProvider,

        externalTransactionId: params.externalTransactionId,
      },

      relations: {
        category: true,
        paymentMethod: true,
      },
    });
  }

  softDeleteById(id: number) {
    return this.repository.softDelete(id);
  }
}
