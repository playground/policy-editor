"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const fileUpload = require("express-fileupload");
const path = require("path");
const fs_1 = require("fs");
const cors = require("cors");
const utility_1 = require("./utility");
const express = require("express");
const stream_1 = require("stream");
const readline = __importStar(require("readline"));
const _env_local_json_1 = __importDefault(require("./.env-local.json"));
const dotenv = __importStar(require("dotenv"));
if ((0, fs_1.existsSync)('./.env-local')) {
    const localEnv = dotenv.parse((0, fs_1.readFileSync)('./.env-local'));
    for (var i in localEnv) {
        process.env[i] = localEnv[i];
    }
}
// set env vars
const env = process.env.npm_config_env || 'prod';
let pEnv = process.env;
pEnv.accessKeyId = _env_local_json_1.default[env]['access_key_id'];
pEnv.secretAccessKey = _env_local_json_1.default[env]['secret_access_key'];
pEnv.serviceInstanceId = _env_local_json_1.default[env]['resource_instance_id'];
pEnv.bucket = _env_local_json_1.default[env]['bucket'];
pEnv.ibmAuthEndpoint = _env_local_json_1.default[env]['ibmAuthEndpoint'];
pEnv.endpoint = _env_local_json_1.default[env]['endpoint'];
pEnv.region = _env_local_json_1.default[env]['region'];
let cosClient;
class Server {
    constructor() {
        this.app = express();
        this.apiUrl = 'https://service.us.apiconnect.ibmcloud.com/gws/apigateway/api/96fd655207897b11587cfcf2b3f58f6e0792f788cf2a04daa79b53fc3d4efb32/liquidprep-cf-api';
        this.initialise();
    }
    initialise() {
        let app = this.app;
        app.use(cors({
            origin: '*'
        }));
        app.use(fileUpload());
        app.use('/static', express.static('public'));
        app.use('/', express.static('dist/liquid-prep-app'));
        app.get('/', (req, res, next) => {
            res.sendFile(path.resolve(__dirname, "index.html"));
            // next();
        });
        app.get("/staff", (req, res) => {
            res.json(["Jeff"]);
        });
        app.get('/get_signed_url', (req, res, next) => {
            cosClient.getSignedUrl(req.query)
                .subscribe({
                next: (data) => res.send(data),
                error: (err) => next(err)
            });
        });
        app.get('/list', (req, res) => {
            let result;
            let params = req.query;
            console.log('bucket: ', params.bucket);
            cosClient.ls(params.bucket, params.directory ? params.directory : '', params.delimiter ? params.delimiter : null)
                .subscribe({
                next: (data) => {
                    const directories = result.CommonPrefixes.map((p) => {
                        return p.Prefix;
                    });
                    const files = data.Contents.map((f) => {
                        return { key: f.Key, date: f.LastModified, size: f.Size };
                    });
                    res.send({ directories: directories, files: files });
                },
                error: (err) => res.send({})
            });
        });
        app.get('/mkdir', (req, res, next) => {
            let params = req.query;
            cosClient.mkdir(params)
                .subscribe({
                next: (data) => res.send(data),
                error: (err) => next(err)
            });
        });
        app.get('/delete', (req, res, next) => {
            let params = req.query;
            cosClient.delete(params)
                .subscribe({
                next: (data) => res.send(data),
                error: (err) => next(err)
            });
        });
        app.get('/delete_folder', (req, res, next) => {
            let params = req.query;
            console.log('$$$delete_folder');
            cosClient.deleteDir(params)
                .subscribe({
                next: (data) => res.send(data),
                error: (err) => next(err)
            });
        });
        app.get('/upload', (req, res, next) => {
            let params = req.query;
            // console.log('$$$stream')
            const stream = new stream_1.Stream.PassThrough();
            // console.log('$$$stream through')
            const buffer = Buffer.from(params['body'], 'utf-8');
            // const buffer = params.body;
            // console.log('$$$stream buffer')
            stream.end(buffer);
            let rl = readline.createInterface({
                input: stream,
            });
            let length = buffer.byteLength;
            let file = { data: '', reading: false };
            let config = { data: '', reading: false };
            rl.on('line', function (line, lineCount, byteCount) {
                // console.log('reading', line)
                if (line.indexOf('------WebKitFormBoundary') === 0) {
                    file.reading = false;
                    config.reading = false;
                }
                else if (file.reading) {
                    if (line.trim().length > 0) {
                        file.data += line;
                    }
                }
                else if (config.reading) {
                    if (line.length > 0) {
                        config.data += line;
                    }
                }
                else if (line.indexOf('Content-Disposition:') === 0 && line.match(/name="file"/)) {
                    file.reading = true;
                    config.reading = false;
                }
                else if (line.indexOf('Content-Disposition:') === 0 && line.match(/name="config"/)) {
                    config.reading = true;
                    file.reading = false;
                }
            })
                .on('close', () => {
                try {
                    let data = JSON.parse(config.data);
                    let fields = ['bucket', 'filename', 'acl'];
                    fields.forEach((field) => {
                        if (data[field]) {
                            // console.log('field', field, data[field])
                            params[field] = data[field];
                        }
                    });
                    let matches = file.data.match(/^data:([A-Za-z-+\/.]+);base64,(.+)$/);
                    // console.log('matches', matches)
                    if (!matches && matches.length !== 3) {
                        next({ result: 'Invalid file format' });
                    }
                    params.body = Buffer.from(matches[2], 'base64');
                    params.contentType = matches[1];
                    cosClient.upload(params)
                        .subscribe({
                        next: (data) => res.send(data),
                        error: (err) => next(err)
                    });
                }
                catch (e) {
                    next({ result: `catch: ${e}` });
                }
            });
        });
        app.get('/session', (req, res) => {
            let params = req.query;
            const sessionId = utility_1.util.encryptAES();
            const seed = utility_1.util.decryptAES(sessionId);
            console.log(sessionId, seed);
            res.send(sessionId);
        });
        app.get('/signature', (req, res, next) => {
            let params = req.query;
            utility_1.util.signature(params)
                .subscribe({
                next: (data) => res.send(data),
                error: (err) => next(err)
            });
        });
        app.get('/validate_session', (req, res) => {
            let params = req.query;
            res.send({ valid: utility_1.util.validateSession(params.sessionId) });
        });
        app.listen(3000, () => {
            console.log('Started on 3000');
        });
    }
}
exports.Server = Server;
