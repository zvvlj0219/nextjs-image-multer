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
const react_1 = require("react");
const Layout_1 = __importDefault(require("../components/Layout"));
const config_1 = require("../config");
const Index = () => {
    (0, react_1.useEffect)(() => {
        const start = () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield fetch(config_1.baseUrl);
            const data = yield res.json();
            console.log(data);
        });
        start();
    });
    return <Layout_1.default>this is index</Layout_1.default>;
};
exports.default = Index;
