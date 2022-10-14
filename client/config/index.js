"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseUrl = exports.isDevelopment = void 0;
exports.isDevelopment = process.env.NODE_ENV !== 'production';
exports.baseUrl = !exports.isDevelopment
    ? (_a = process.env.NEXT_PUBLIC_BASEURL_PRODUCTION) !== null && _a !== void 0 ? _a : 'http://localhost:5000/api'
    : 'http://localhost:5000/api';
