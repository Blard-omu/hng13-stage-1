"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// GET /me endpoint
app.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const catFactResponse = yield axios_1.default.get("https://catfact.ninja/fact", {
            timeout: 5000,
        });
        const catFact = catFactResponse.data.fact ||
            "No cat fact available right now. Cats are mysterious!";
        // Generate current UTC timestamp in ISO 8601
        const timestamp = new Date().toISOString();
        const user = {
            email: "peteromu@gmail.com",
            name: "Peter Omu",
            stack: "Node.js/Express/TypeScript",
        };
        // Response structure
        const response = {
            status: "success",
            user,
            timestamp,
            fact: catFact,
        };
        res.set("Content-Type", "application/json");
        res.status(200).json(response);
        // console.log(`Request processed at ${timestamp} - Fact: ${catFact}`);
    }
    catch (error) {
        console.error("Error fetching cat fact:", error.message);
        // Graceful error handling
        res.status(503).json({
            status: "error",
            message: error.message || "Service unavailable - Could not fetch cat fact. Try again later.",
        });
    }
}));
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map