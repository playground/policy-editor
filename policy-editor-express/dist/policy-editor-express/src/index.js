"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Index = void 0;
const server_1 = require("./server");
class Index {
    constructor() {
        this.server = new server_1.Server();
    }
}
exports.Index = Index;
new Index();
