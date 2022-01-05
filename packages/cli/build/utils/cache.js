"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCache = exports.loadCache = exports.cachePath = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
// import { CACHE_PATH } from './constants';
var CACHE_PATH = "./"; // CHANGE
function cachePath(env, cacheName, cPath) {
    if (cPath === void 0) { cPath = CACHE_PATH; }
    var filename = "".concat(env, "-").concat(cacheName);
    return path_1.default.join(cPath, "".concat(filename, ".json"));
}
exports.cachePath = cachePath;
function loadCache(cacheName, env, cPath, legacy) {
    if (cPath === void 0) { cPath = CACHE_PATH; }
    if (legacy === void 0) { legacy = false; }
    var path = cachePath(env, cacheName, cPath);
    if (!fs_1.default.existsSync(path)) {
        return undefined;
    }
    return JSON.parse(fs_1.default.readFileSync(path).toString());
}
exports.loadCache = loadCache;
function saveCache(cacheName, env, cacheContent, cPath) {
    if (cPath === void 0) { cPath = CACHE_PATH; }
    cacheContent.env = env;
    cacheContent.cacheName = cacheName;
    fs_1.default.writeFileSync(cachePath(env, cacheName, cPath), JSON.stringify(cacheContent));
}
exports.saveCache = saveCache;
