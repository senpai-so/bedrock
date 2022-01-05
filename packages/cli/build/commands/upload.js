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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
var ipfs_core_1 = require("ipfs-core");
var cache_1 = require("../utils/cache");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var IMG_TYPE = ".jpg";
// Functionality
var upload = function (cacheName, env, path) { return __awaiter(void 0, void 0, void 0, function () {
    var node, savedContent, cacheContent, assets;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, ipfs_core_1.create)()];
            case 1:
                node = _a.sent();
                savedContent = (0, cache_1.loadCache)(cacheName, env);
                cacheContent = savedContent || { program: {}, items: {}, env: env, cacheName: cacheName };
                return [4 /*yield*/, ipfsUpload(node, path)];
            case 2:
                assets = _a.sent();
                cacheContent.items = assets;
                (0, cache_1.saveCache)(cacheName, env, cacheContent);
                return [2 /*return*/];
        }
    });
}); };
exports.upload = upload;
var ipfsUpload = function (node, dirPath) { return __awaiter(void 0, void 0, void 0, function () {
    var uploadToIpfs, names, assets;
    return __generator(this, function (_a) {
        uploadToIpfs = function (source) { return __awaiter(void 0, void 0, void 0, function () {
            var cid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, node.add(source).catch()];
                    case 1:
                        cid = (_a.sent()).cid;
                        return [2 /*return*/, cid];
                }
            });
        }); };
        names = new Set(fs_1.default
            .readdirSync(dirPath) // will these be relative or absolute???
            .map(function (fName) { return fName.split('.')[0]; }));
        assets = new Map();
        names.forEach(function (fName) { return __awaiter(void 0, void 0, void 0, function () {
            var media, mediaHash, mediaUrl, manifestJson, manifestHash, manifestUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        media = fs_1.default.readFileSync(path_1.default.join(dirPath, fName + IMG_TYPE)).toString();
                        return [4 /*yield*/, uploadToIpfs(media)];
                    case 1:
                        mediaHash = _a.sent();
                        mediaUrl = "https://ipfs.io/ipfs/".concat(mediaHash);
                        console.log('mediaUrl:', mediaUrl);
                        manifestJson = JSON.parse(JSON.stringify(fs_1.default.readFileSync(path_1.default.join(dirPath, fName + '.json'))));
                        manifestJson.image = mediaUrl;
                        return [4 /*yield*/, uploadToIpfs(Buffer.from(JSON.stringify(manifestJson)))];
                    case 2:
                        manifestHash = _a.sent();
                        manifestUrl = "https://ipfs.io/ipfs/".concat(manifestHash);
                        console.log("manifestUrl:", manifestUrl);
                        assets.set(fName, { mediaUrl: mediaUrl, manifestUrl: manifestUrl, name: manifestJson.name });
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/, assets];
    });
}); };
