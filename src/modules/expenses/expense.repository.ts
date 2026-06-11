import { IsNull } from 'typeorm'
import { AppDataSource } from '../../bootstrap/database'
import { ExpenseEntity } from './expense.entity'
import { ExpenseFilters } from './interfaces/expense-filters.interface'

export class ExpenseRepository {
    private repository = AppDataSource.getRepository(ExpenseEntity)

    createEntity(payload: Partial<ExpenseEntity>) {
        return this.repository.create(payload)
    }

    save(expense: ExpenseEntity) {
        return this.repository.save(expense)
    }

    findAll(filters: ExpenseFilters) {
        const query = this.repository
        .createQueryBuilder('expense')
        .leftJoinAndSelect('expense.category', 'category')
        .leftJoinAndSelect('expense.paymentMethod', 'paymentMethod')
        .leftJoinAndSelect('expense.vendor', 'vendor')
        .where('expense.companyId = :companyId', {
            companyId: filters.companyId,
        })
        .andWhere('expense.deletedAt IS NULL')

        if (filters.companyPublicId) {
        query.andWhere('expense.companyPublicId = :companyPublicId', {
            companyPublicId: filters.companyPublicId,
        })
        }

        if (filters.vendorId) {
        query.andWhere('expense.vendorId = :vendorId', {
            vendorId: filters.vendorId,
        })
        }

        if (filters.vendorPublicId) {
        query.andWhere('expense.vendorPublicId = :vendorPublicId', {
            vendorPublicId: filters.vendorPublicId,
        })
        }

        if (filters.vendorName) {
        query.andWhere('LOWER(expense.vendorName) LIKE :vendorName', {
            vendorName: `%${filters.vendorName.toLowerCase()}%`,
        })
        }

        if (filters.categoryId) {
        query.andWhere('expense.categoryId = :categoryId', {
            categoryId: filters.categoryId,
        })
        }

        if (filters.paymentMethodCode) {
        query.andWhere('expense.paymentMethodCode = :paymentMethodCode', {
            paymentMethodCode: filters.paymentMethodCode.toUpperCase(),
        })
        }

        if (filters.status) {
        query.andWhere('expense.status = :status', {
            status: filters.status,
        })
        }

        if (filters.fromDate) {
        query.andWhere('expense.expenseDate >= :fromDate', {
            fromDate: filters.fromDate,
        })
        }

        if (filters.toDate) {
        query.andWhere('expense.expenseDate <= :toDate', {
            toDate: filters.toDate,
        })
        }

        return query.orderBy('expense.expenseDate', 'DESC').getMany()
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
            vendor: true,
        },
        })
    }

    softDeleteById(id: number) {
        return this.repository.softDelete(id)
    }
}