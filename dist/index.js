"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const businessRoutes_1 = __importDefault(require("./routes/businessRoutes"));
const swagger_1 = require("./swagger");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
// ✅ Allow all origins (ANYWHERE)
exports.app.use((0, cors_1.default)({
    origin: "*", // Allows requests from anywhere
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
}));
// Connect to MongoDB and Redis
if (process.env.NODE_ENV !== "test") {
    (0, db_1.default)();
}
// Register API Routes
exports.app.use('/api/v1/users', userRoutes_1.default);
exports.app.use("/api/v1/business", businessRoutes_1.default);
// Serve Swagger docs at /api-docs
exports.app.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec));
// Test Route
exports.app.get("/", (_req, res) => {
    res.send("SaaS Backend Running");
});
// Only start the server if not running tests
if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 5000;
    exports.app.listen(PORT, () => console.log(`🚀 Server running on port: ${PORT}`));
}
exports.default = exports.app;
