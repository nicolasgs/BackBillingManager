"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportDateRangeQuerySchema = void 0;
const zod_1 = require("zod");
exports.reportDateRangeQuerySchema = zod_1.z
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
