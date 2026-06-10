import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from '../config/env'
import { BillingCategoryEntity } from '../modules/billing-categories/billing-category.entity'
import { PaymentMethodTypeEntity } from '../modules/payment-method-type/payment-method-type.entity'
import { IncomeEntity } from '../modules/incomes/income.entity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  synchronize: env.DB_SYNCHRONIZE === 'true',
  logging: env.DB_LOGGING === 'true',
  entities: [
    BillingCategoryEntity,
    PaymentMethodTypeEntity,
    IncomeEntity
  ],
})