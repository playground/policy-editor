"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messenger = exports.ResponseMessage = void 0;
class ResponseMessage {
    constructor(data, headers, statusCode = 200) {
        this.data = data;
        this.headers = headers;
        this.statusCode = statusCode;
    }
}
exports.ResponseMessage = ResponseMessage;
class Messenger {
    constructor(params) {
        this.params = params;
    }
    send(body, statusCode = 200, headers = { 'Content-Type': 'application/json' }) {
        return new ResponseMessage(JSON.stringify(body), headers, statusCode);
    }
    error(msg, status = 400, headers = { 'Content-Type': 'application/json' }) {
        return new ResponseMessage(msg, headers, status);
    }
}
exports.Messenger = Messenger;
