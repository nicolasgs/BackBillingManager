"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../../bootstrap/database");
const responses_1 = require("../../shared/responses");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    return (0, responses_1.sendSuccess)({
        res,
        req,
        code: 'HEALTH_OK',
        message: 'BackBillingManager is running',
        data: {
            service: 'BackBillingManager',
            status: 'OK',
        },
    });
});
router.get('/database', async (req, res, next) => {
    try {
        const isConnected = database_1.AppDataSource.isInitialized;
        return (0, responses_1.sendSuccess)({
            res,
            req,
            code: 'DATABASE_HEALTH_OK',
            message: 'Database health checked successfully',
            data: {
                connected: isConnected,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
