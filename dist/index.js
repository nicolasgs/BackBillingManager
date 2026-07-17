"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./bootstrap/database");
database_1.AppDataSource.initialize()
    .then(() => {
    console.log('Database connected');
    app_1.default.listen(env_1.env.PORT, () => {
        console.log(`BackBillingManager running on port ${env_1.env.PORT}`);
    });
})
    .catch((error) => {
    console.error('Database connection error:', error);
});
