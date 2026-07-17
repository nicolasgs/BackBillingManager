"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodLockService = void 0;
const typeorm_1 = require("typeorm");
const database_1 = require("../../../bootstrap/database");
const enums_1 = require("../../../shared/enums");
const errors_1 = require("../../../shared/errors");
const monthly_closing_entity_1 = require("../monthly-closing.entity");
class PeriodLockService {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(monthly_closing_entity_1.MonthlyClosingEntity);
    }
    async validateOpenPeriod(companyId, transactionDate) {
        const date = new Date(`${transactionDate}T00:00:00`);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const closing = await this.repository.findOne({
            where: {
                companyId,
                year,
                month,
                status: enums_1.ClosingStatus.CLOSED,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
        if (closing) {
            throw new errors_1.ApiError(400, 'PERIOD_CLOSED', 'The accounting period is closed. Reopen the monthly closing before modifying transactions.');
        }
    }
}
exports.PeriodLockService = PeriodLockService;
