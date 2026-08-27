import { IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { IncomeEntity } from './income.entity'

export class IncomeRepository {
    private repository = AppDataSource.getRepository(IncomeEntity)

    createEntity(payload: Partial<IncomeEntity>) {
        return this.repository.create(payload)
    }

    save(income: IncomeEntity) {
        return this.repository.save(income)
    }

    findAll(filters: any) {
        const query = this.repository
        .createQueryBuilder('income')
        .leftJoinAndSelect('income.category', 'category')
        .leftJoinAndSelect('income.paymentMethod', 'paymentMethod')
        .where('income.companyId = :companyId', { companyId: filters.companyId })
        .andWhere('income.deletedAt IS NULL')

        if (filters.clientId) {
        query.andWhere('income.clientId = :clientId', {
            clientId: filters.clientId,
        })
        }

        if (filters.caseId) {
        query.andWhere('income.caseId = :caseId', {
            caseId: filters.caseId,
        })
        }

        if (filters.clientPublicId) {
        query.andWhere('income.clientPublicId = :clientPublicId', {
            clientPublicId: filters.clientPublicId,
        })
        }

        if (filters.casePublicId) {
        query.andWhere('income.casePublicId = :casePublicId', {
            casePublicId: filters.casePublicId,
        })
        }

        if (filters.categoryId) {
        query.andWhere('income.categoryId = :categoryId', {
            categoryId: filters.categoryId,
        })
        }

        if (filters.paymentMethodCode) {
        query.andWhere('income.paymentMethodCode = :paymentMethodCode', {
            paymentMethodCode: filters.paymentMethodCode.toUpperCase(),
        })
        }

        if (filters.status) {
        query.andWhere('income.status = :status', {
            status: filters.status,
        })
        }

        if (filters.fromDate) {
        query.andWhere('income.incomeDate >= :fromDate', {
            fromDate: filters.fromDate,
        })
        }

        if (filters.toDate) {
        query.andWhere('income.incomeDate <= :toDate', {
            toDate: filters.toDate,
        })
        }

        return query.orderBy('income.incomeDate', 'DESC').getMany()
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
        })
    }

    findByExternalReference(params: {
        companyId: number
        externalProvider: string
        externalTransactionId: string
    }) {
        return this.repository.findOne({
            where: {
                companyId:
                    params.companyId,

                externalProvider:
                    params.externalProvider,

                externalTransactionId:
                    params.externalTransactionId,
            },

            relations: {
                category: true,
                paymentMethod: true,
            },
        })
    }

    softDeleteById(id: number) {
        return this.repository.softDelete(id)
    }
}