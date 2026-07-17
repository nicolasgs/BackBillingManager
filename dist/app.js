"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const not_found_middleware_1 = require("./middlewares/not-found.middleware");
const swagger_1 = require("./bootstrap/swagger");
const env_1 = require("./config/env");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const allowedOrigins = env_1.env.CORS_ORIGINS.split(',');
app.use((0, cors_1.default)({
    origin(origin, callback) {
        // Permite herramientas como Postman o curl
        if (!origin) {
            return callback(null, true);
        }
        // Permite únicamente los dominios configurados
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json());
(0, swagger_1.setupSwagger)(app);
app.use('/api/v1', routes_1.default);
app.use(not_found_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
