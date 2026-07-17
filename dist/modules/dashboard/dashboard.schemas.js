"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardQuerySchema = void 0;
const zod_1 = require("zod");
exports.dashboardQuerySchema = zod_1.z
    .object({
    fromDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
    .refine((data) => !data.fromDate ||
    !data.toDate ||
    data.fromDate <= data.toDate, {
    message: 'fromDate cannot be later than toDate',
    path: ['fromDate'],
});
