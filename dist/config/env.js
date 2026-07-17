"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number(process.env.PORT ?? 3001),
    // Database
    DB_TYPE: process.env.DB_TYPE ?? 'postgres',
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_PORT: Number(process.env.DB_PORT ?? 5432),
    DB_USERNAME: process.env.DB_USER ?? 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD ?? '',
    DB_DATABASE: process.env.DB_NAME ?? 'mindpro_crm_dev',
    DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true',
    DB_LOGGING: process.env.DB_LOGGING === 'true',
    DB_SSL: process.env.DB_SSL === 'true',
    // Security
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY ?? '',
    // CORS
    CORS_ORIGINS: process.env.CORS_ORIGINS ??
        'http://localhost:5173,http://localhost:3000',
    // Swagger
    SWAGGER_ENABLED: process.env.SWAGGER_ENABLED !== 'false',
};
