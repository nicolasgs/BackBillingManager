import dotenv from 'dotenv'

dotenv.config()

export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  DB_TYPE: process.env.DB_TYPE || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '5432',
  DB_USERNAME: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_NAME || 'mindpro_crm_dev',
  DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE || 'false',
  DB_LOGGING: process.env.DB_LOGGING || 'false',    

  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || '',
}