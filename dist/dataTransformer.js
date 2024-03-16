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
exports.theProvider = exports.DataProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULT_CSV_FILE_PATH = "../data/words.csv";
class DataProvider {
    constructor() {
        this.data = [];
        this.filePath = DEFAULT_CSV_FILE_PATH;
        this.cursor = 0;
        this.prepareData = () => __awaiter(this, void 0, void 0, function* () {
            const results = [];
            return new Promise((resolve, reject) => {
                const stream = fs_1.default.createReadStream(this.filePath);
                stream.on("data", (row) => {
                    console.warn("row", row);
                });
            });
        });
        this.nextWords = () => {
            if (this.cursor >= this.data.length) {
                this.cursor = 0;
            }
            return this.data[this.cursor++];
        };
    }
    DataProvider(dataTransformer = defaultDataTransformer, filePath = DEFAULT_CSV_FILE_PATH) {
        this.mDataTransformer = dataTransformer;
        this.filePath = path_1.default.resolve(__dirname, filePath);
    }
}
exports.DataProvider = DataProvider;
exports.theProvider = new DataProvider();
const defaultDataTransformer = (data) => {
    console.log("data", data);
    return [];
};
