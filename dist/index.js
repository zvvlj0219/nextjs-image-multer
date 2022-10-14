"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type']
};
app.use((0, cors_1.default)(corsOptions));
app.get('/api', (req, res) => {
    return res.status(200).json({ msg: 'hello express' });
});
app.get('/api/profile', (req, res) => {
    return res.status(200).json({ msg: 'hello profile' });
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`NODE_ENV is ${String(process.env.NODE_ENV)}`);
    console.log(`server running port 5000 at http://localhost:${port}`);
});
