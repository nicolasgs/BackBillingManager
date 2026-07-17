import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from '../config/env'
import { BillingCategoryEntity } from '../modules/billing-categories/billing-category.entity'
import { PaymentMethodTypeEntity } from '../modules/payment-method-type/payment-method-type.entity'
import { IncomeEntity } from '../modules/incomes/income.entity'
import { VendorEntity } from '../modules/vendors/vendor.entity'
import { ExpenseEntity } from '../modules/expenses/expense.entity'
import { MonthlyClosingEntity } from '../modules/monthly-closings/monthly-closing.entity'
import { MonthlyClosingItemEntity } from '../modules/monthly-closings/monthly-closing-item.entity'
import { BillingAuditLogEntity } from '../modules/audit-logs/audit-log.entity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,

  synchronize: env.DB_SYNCHRONIZE,
  logging: env.DB_LOGGING,

  ssl: env.DB_SSL
    ? {
        rejectUnauthorized: false,
      }
    : false,

  extra: {
    max: 10,
  },

  entities: [
    BillingCategoryEntity,
    PaymentMethodTypeEntity,
    IncomeEntity,
    VendorEntity,
    ExpenseEntity,
    MonthlyClosingEntity,
    MonthlyClosingItemEntity,
    BillingAuditLogEntity,
  ],
})