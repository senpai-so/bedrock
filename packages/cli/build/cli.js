#!/usr/bin/env node
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
var yargs_1 = __importDefault(require("yargs"));
var helpers_1 = require("yargs/helpers");
var upload_1 = require("./commands/upload");
var argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command("upload", "uploads asset data", function (yargs) {
    yargs.positional("source", {
        require: true,
        describe: "File path to assets folder",
    })
        .options({
        env: {
            type: "string",
            alias: "e",
            demandOption: true,
            description: "Chain environment"
        },
        cred: {
            type: "string",
            alias: "k",
            demandOption: true,
            description: "Credential key path"
        },
        config: {
            type: "string",
            alias: "cp",
            demandOption: true,
            description: "Config file path"
        },
        cache: {
            type: "string",
            alias: "c",
            demandOption: true,
            description: "Cache path"
        }
    });
})
    .command("verify", "verifies successful upload", function (yargs) {
    yargs.options({
        env: {
            type: "string",
            alias: "e",
            demandOption: true,
            description: "Chain environment"
        },
        cred: {
            type: "string",
            alias: "k",
            demandOption: true,
            description: "Credential key path"
        },
        cache: {
            type: "string",
            alias: "c",
            demandOption: true,
            description: "Cache path"
        }
    });
})
    .command("mint", "mints a single NFT", function (yargs) {
    yargs.options({
        env: {
            type: "string",
            alias: "e",
            demandOption: true,
            description: "Chain environment"
        },
        cred: {
            type: "string",
            alias: "k",
            demandOption: true,
            description: "Credential key path"
        },
        cache: {
            type: "string",
            alias: "c",
            demandOption: true,
            description: "Cache path"
        }
    });
})
    .command("mint-multiple", "mints multiple NFTs", function (yargs) {
    yargs.positional("count", {
        type: "number",
        demandOption: true,
        description: "number of NFTs to mint"
    })
        .options({
        env: {
            type: "string",
            alias: "e",
            demandOption: true,
            description: "Chain environment"
        },
        cred: {
            type: "string",
            alias: "k",
            demandOption: true,
            description: "Credential key path"
        },
        cache: {
            type: "string",
            alias: "c",
            demandOption: true,
            description: "Cache path"
        }
    });
})
    .command("update", "updates owner address or config", function (yargs) {
    yargs.positional("address", {
        type: "string",
        demandOption: false,
        description: "New owner address"
    })
        .options({
        env: {
            type: "string",
            alias: "e",
            demandOption: true,
            description: "Chain environment"
        },
        cred: {
            type: "string",
            alias: "k",
            demandOption: true,
            description: "Credential key path"
        },
        config: {
            type: "string",
            alias: "o",
            demandOption: true,
            description: "Config file path"
        },
        cache: {
            type: "string",
            alias: "a",
            demandOption: true,
            description: "Cache path"
        }
    });
})
    .help()
    .parse();
// Figure out how to handle async here
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var args, command, env, creds, cache, path;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, argv];
            case 1:
                args = _a.sent();
                console.log(args);
                command = args._[0];
                env = args.e;
                creds = args.k;
                cache = args.c;
                if (typeof command === "string" && command === "upload") {
                    path = args._[1];
                    (0, upload_1.upload)(cache, env, path);
                }
                else if (typeof command === "string" && command === "mint") {
                    // Mint NFT
                }
                return [2 /*return*/];
        }
    });
}); };
main();
