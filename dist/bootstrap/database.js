"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("../config/env");
const billing_category_entity_1 = require("../modules/billing-categories/billing-category.entity");
const payment_method_type_entity_1 = require("../modules/payment-method-type/payment-method-type.entity");
const income_entity_1 = require("../modules/incomes/income.entity");
const vendor_entity_1 = require("../modules/vendors/vendor.entity");
const expense_entity_1 = require("../modules/expenses/expense.entity");
const monthly_closing_entity_1 = require("../modules/monthly-closings/monthly-closing.entity");
const monthly_closing_item_entity_1 = require("../modules/monthly-closings/monthly-closing-item.entity");
const audit_log_entity_1 = require("../modules/audit-logs/audit-log.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    username: env_1.env.DB_USERNAME,
    password: env_1.env.DB_PASSWORD,
    database: env_1.env.DB_DATABASE,
    synchronize: env_1.env.DB_SYNCHRONIZE,
    logging: env_1.env.DB_LOGGING,
    ssl: env_1.env.DB_SSL
        ? {
            rejectUnauthorized: false,
        }
        : false,
    extra: {
        max: 10,
    },
    entities: [
        billing_category_entity_1.BillingCategoryEntity,
        payment_method_type_entity_1.PaymentMethodTypeEntity,
        income_entity_1.IncomeEntity,
        vendor_entity_1.VendorEntity,
        expense_entity_1.ExpenseEntity,
        monthly_closing_entity_1.MonthlyClosingEntity,
        monthly_closing_item_entity_1.MonthlyClosingItemEntity,
        audit_log_entity_1.BillingAuditLogEntity,
    ],
});
