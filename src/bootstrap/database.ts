import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from '../config/env'

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

  ],
})