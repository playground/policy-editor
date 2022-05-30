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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosClient = void 0;
const rxjs_1 = require("rxjs");
const COS = __importStar(require("ibm-cos-sdk"));
class CosClient {
    constructor(params) {
        this.params = params;
        // if (!params.bucket) throw new Error("Missing bucket parameter.");
        // if (!params.ibmAuthEndpoint || !params.endpoint) throw new Error("Missing endpoint or credential.");
        this.init(params);
    }
    init(params) {
        let config = {
            endpoint: params.endpoint,
            ibmAuthEndpoint: params.ibmAuthEndpoint,
            apiKeyId: params.apiKeyId,
            accessKeyId: params.accessKeyId,
            secretAccessKey: params.secretAccessKey,
            serviceInstanceId: params.serviceInstanceId,
            region: params.region
        };
        // console.log('$$$config', config)
        this.client = new COS.S3(config);
    }
    ls(bucket, directory, delimiter = null) {
        return new rxjs_1.Observable((observer) => {
            let data;
            let config = {
                Bucket: bucket,
                MaxKeys: 1000,
                Prefix: directory
            };
            if (delimiter) {
                config['Delimiter'] = delimiter;
            }
            // console.log('config', config)
            this.client.listObjects(config, (err, data) => {
                if (err) {
                    console.error(`unable to list: ${directory}` + err.stack);
                    observer.error(err);
                }
                else {
                    // console.log('done')
                    observer.next(data);
                    observer.complete();
                }
            });
        });
    }
    listAll(params, token, keys) {
        return new rxjs_1.Observable((observer) => {
            let list = (params, token, keys) => {
                let config = {
                    Bucket: params.bucket,
                    Prefix: params.key
                };
                if (token) {
                    config['ContinuationToken'] = token;
                }
                console.log('$$$config', config);
                this.client.listObjectsV2(config, function (err, data) {
                    // console.log('$$$data',  data, err);
                    if (data) {
                        keys = keys.concat(data.Contents);
                        if (data.IsTruncated) {
                            list(params, data.NextContinuationToken, keys);
                        }
                        else {
                            observer.next(keys);
                            observer.complete();
                        }
                    }
                    else {
                        observer.next(keys);
                        observer.complete();
                    }
                });
            };
            list(params, token, keys);
        });
    }
    mkdir(params) {
        return new rxjs_1.Observable((observer) => {
            // Note directory must have trailing slash or it will be treated as a file
            const directory = params.directory;
            const bucket = params.bucket;
            const acl = params.acl ? params.acl : 'private';
            this.client.putObject({
                Bucket: bucket,
                ACL: acl,
                Key: directory,
                Body: 'content does not matter'
            }, (err, data) => {
                if (err) {
                    console.error(`mkdir failed: ` + err);
                    observer.next({ result: `unable to mkidr: ${directory}` });
                    observer.complete();
                }
                else {
                    observer.next({ result: `${directory} was created successfully.` });
                    observer.complete();
                }
            });
        });
    }
    copyFiles(params) {
        return new rxjs_1.Observable((observer) => {
            const files = Array.isArray(params.filename) ? params.filename : [params.filename];
            let $files = [];
            let config = {
                Bucket: params.bucket,
                CopySource: '',
                Key: ''
            };
            files.forEach((f) => {
                config.Key = f.dest;
                config.CopySource = `${params.bucket}/${f.src}`;
                $files.push(this.client.copyObject(config).promise());
            });
            let res;
            (0, rxjs_1.forkJoin)($files)
                .subscribe((resp) => {
                res = resp;
            }, (err) => {
                observer.next({ result: `unable to copy: ${config.CopySource}, ${config.Key}, ${err}` });
                observer.complete();
            }, () => {
                observer.next({ result: `${files.length} file(s) copied successfully, ${config.CopySource}, ${config.Key}, ${config.Bucket}` });
                observer.complete();
            });
        });
    }
    deleteDir(params) {
        return new rxjs_1.Observable((observer) => {
            let items = 0;
            let $dir = {};
            let files = [];
            console.log('$$$$$$file', params.directory);
            params.directory.forEach((dir, idx) => {
                let config = {
                    key: dir,
                    bucket: params.bucket
                };
                $dir[idx] = this.listAll(config, null, []);
            });
            (0, rxjs_1.forkJoin)($dir)
                .subscribe((res) => {
                res.forEach((keys) => {
                    items += keys.length;
                    keys.forEach((key) => {
                        files.push(key.Key);
                    });
                });
                // console.log('$$$files: ', files)
                params.filename = files;
                this.delete(params)
                    .subscribe((res) => {
                    observer.next({ result: `${items} item(s) deleted successfully` });
                    observer.complete();
                });
            });
        });
    }
    delete(params) {
        return new rxjs_1.Observable((observer) => {
            // console.log('$$$$$$file', params.filename)
            const files = params.filename instanceof Array ? params.filename : [params.filename];
            let $files = {};
            let config = {
                Bucket: params.bucket,
                Key: ''
            };
            files.forEach((f, idx) => {
                config.Key = f;
                $files[idx] = this.client.deleteObject(config).promise();
            });
            (0, rxjs_1.forkJoin)($files)
                .subscribe(() => {
                observer.next({ result: `${files.length} file(s) deleted successfully` });
                observer.complete();
            });
        });
    }
    upload(params) {
        return new rxjs_1.Observable((observer) => {
            const bucket = params.bucket;
            const cacheControl = params.cacheControl ? params.cacheControl : `cacheControl='max-age=600'`;
            const acl = params.acl ? params.acl : 'public-read';
            const f = params.filename;
            let ct = params.contentType;
            if (f.indexOf('.html') >= 0)
                ct = 'text/html';
            else if (f.indexOf('.json') >= 0)
                ct = 'application/json';
            else if (f.indexOf('.css') >= 0)
                ct = 'text/css';
            else if (f.indexOf('.js') >= 0)
                ct = 'application/x-javascript';
            else if (f.indexOf('.png') >= 0)
                ct = 'image/png';
            else if (f.indexOf('.gif') >= 0)
                ct = 'image/gif';
            else if (f.indexOf('.jpg') >= 0)
                ct = 'image/jpg';
            else if (!ct && f.indexOf('.csv') >= 0)
                ct = 'text/csv';
            let config = {
                Bucket: bucket,
                Key: f,
                ACL: acl,
                Body: params.body,
                ContentType: ct,
                CacheControl: cacheControl
            };
            this.client.putObject(config, (err, res) => {
                if (err) {
                    console.error(`unable to upload: ${f}` + err);
                    observer.next({ result: `unable to upload: ${f}` });
                    observer.complete();
                }
                else {
                    observer.next({ result: `uploaded: ${f}` });
                    observer.complete();
                }
            });
        });
    }
    downloadFile(params) {
        return new rxjs_1.Observable((observer) => {
            const f = params.filename;
            const bucket = params.bucket;
            let config = {
                Bucket: bucket,
                Key: f
            };
            this.client.getObject(config, (err, res) => {
                if (err) {
                    console.error(`unable to download: ${f}` + err);
                    observer.next({ result: `unable to download: ${f}` });
                    observer.complete();
                }
                else {
                    try {
                        observer.next(res.Body);
                        observer.complete();
                    }
                    catch (e) {
                        observer.next({ result: `unable to download: ${f}` });
                        observer.complete();
                    }
                }
            });
        });
    }
    download(params) {
        return new rxjs_1.Observable((observer) => {
            const f = params.filename;
            const bucket = params.bucket;
            let config = {
                Bucket: bucket,
                Key: f
            };
            try {
                this.client.getObject(config)
                    .promise()
                    .then((data) => {
                    observer.next(data);
                    observer.complete();
                });
            }
            catch (e) {
                observer.next({ result: `unable to download: ${f}` });
                observer.complete();
            }
        });
    }
    uploadBuffer(params) {
        return new rxjs_1.Observable((observer) => {
            const bucket = params.bucket;
            const files = params['__ow_method'] === 'post' ? params.filename : [params.filename];
            const cacheControl = params.cacheControl ? params.cacheControl : `cacheControl='max-age=900'`;
            const acl = params.acl ? params.acl : 'private';
            let ct = 'application/json';
            let $files = [];
            let config = {
                Bucket: bucket,
                Key: '',
                ACL: acl,
                Body: params.body,
                ContentType: ct,
                CacheControl: cacheControl
            };
            console.log('upload', bucket, params.filename);
            files.forEach((f) => {
                config.Key = f;
                ct = config.ContentType;
                if (f.indexOf('.html') >= 0)
                    ct = 'text/html';
                else if (f.indexOf('.css') >= 0)
                    ct = 'text/css';
                else if (f.indexOf('.js') >= 0)
                    ct = 'application/x-javascript';
                else if (f.indexOf('.png') >= 0)
                    ct = 'image/png';
                else if (f.indexOf('.gif') >= 0)
                    ct = 'image/gif';
                else if (f.indexOf('.jpg') >= 0)
                    ct = 'image/jpg';
                $files.push(this.client.putObject(config).promise());
            });
            (0, rxjs_1.forkJoin)($files)
                .subscribe(() => {
                observer.next({ result: `${files.length} file(s) uploaded successfully` });
                observer.complete();
            });
        });
    }
    setFileAcl(params) {
        // console.log(params.filename, params.bucket, params.acl)
        return new rxjs_1.Observable((observer) => {
            const files = params['__ow_method'] === 'post' ? params.filename : [params.filename];
            let $files = [];
            let config = {
                Bucket: params.bucket,
                Key: '',
                ACL: params.acl
            };
            // console.log(files, params['__ow_method'])
            files.forEach((f) => {
                config.Key = f;
                $files.push(this.client.putObjectAcl(config).promise());
            });
            (0, rxjs_1.forkJoin)($files)
                .subscribe(() => {
                observer.next({ result: `${files.length} file(s) set to ${params.acl}` });
                observer.complete();
            });
        });
    }
    getSignedUrl(params) {
        return new rxjs_1.Observable((observer) => {
            let config = {
                Bucket: params.bucket,
                Key: params.filename,
                Expires: params.expires ? parseInt(params.expires) : 900
            };
            try {
                let url = '';
                (0, rxjs_1.from)(this.client.getSignedUrl('getObject', config))
                    .subscribe({
                    next: (chunk) => url += chunk,
                    error: (err) => observer.error(err),
                    complete: () => {
                        observer.next({ url: url });
                        observer.complete();
                    }
                });
            }
            catch (err) {
                console.log(err);
                observer.error(`unable to generate signed url: ${err}`);
            }
        });
    }
    putSignedUrl(params) {
        return new rxjs_1.Observable((observer) => {
            let config = {
                Bucket: params.bucket,
                Key: params.filename,
                Expires: params.expires ? params.expires : 900
            };
            try {
                (0, rxjs_1.from)(this.client.getSignedUrl('putObject', config))
                    .subscribe((url) => {
                    observer.next({ url: url });
                    observer.complete();
                });
            }
            catch (err) {
                console.log(err);
                observer.next({ result: `unable to generate signed url: ${err}` });
                observer.complete();
            }
        });
    }
    putBucketCors(params) {
        let config = {
            Bucket: params.bucket,
            CORSConfiguration: {
                CORSRules: [{
                        AllowedHeaders: ["*"],
                        AllowedMethods: [
                            "HEAD",
                            "GET",
                            "PUT",
                            "POST",
                            "DELETE"
                        ],
                        AllowedOrigins: ["*"]
                    }]
            }
        };
        return new rxjs_1.Observable((observer) => {
            try {
                this.client.putBucketCors(config, (err, res) => {
                    if (err) {
                        observer.next({ result: `unable to put bucket cors: ${err}` });
                        observer.complete();
                    }
                    else {
                        observer.next({ res: res });
                        observer.complete();
                    }
                });
            }
            catch (err) {
                console.log(err);
                observer.next({ result: `unable to put bucket cors: ${err}` });
                observer.complete();
            }
        });
    }
}
exports.CosClient = CosClient;
