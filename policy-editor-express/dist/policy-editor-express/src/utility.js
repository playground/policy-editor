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
exports.util = void 0;
const rxjs_1 = require("rxjs");
const follow_redirects_1 = require("follow-redirects");
// import * as http from 'http';
const os = __importStar(require("os"));
const cryptoJS = __importStar(require("crypto-js"));
const ethers = __importStar(require("ethers"));
const ifs = os.networkInterfaces();
const cp = __importStar(require("child_process"));
const exec = cp.exec;
exports.util = {
    passPhrase: 'iEAM&openHoriZon',
    sessionToken: 'geTSesSiontOkEnfOrvAliDation',
    encrypt: (text) => {
        return cryptoJS.enc.Base64.stringify(cryptoJS.enc.Utf8.parse(text));
    },
    decrypt: (data) => {
        return cryptoJS.enc.Base64.parse(data).toString(cryptoJS.enc.Utf8);
    },
    encryptAES: (text = exports.util.sessionToken + Date.now()) => {
        const ciphertext = cryptoJS.AES.encrypt(text, exports.util.passPhrase).toString();
        return ciphertext;
    },
    decryptAES: (cipherText) => {
        const decrypted = cryptoJS.AES.decrypt(cipherText, exports.util.passPhrase);
        let originalText = '';
        if (decrypted) {
            originalText = decrypted.toString(cryptoJS.enc.Utf8);
        }
        return originalText;
    },
    validateSession: (sessionId) => {
        const seed = exports.util.decryptAES(sessionId, exports.util.passPhrase);
        return Date.now() - parseInt(seed.substring(exports.util.sessionToken.length)) < 300000;
    },
    signature: (params) => {
        return new rxjs_1.Observable((observer) => {
            const claimedAddr = params.addr;
            let error = "", realAddr = "";
            try {
                const seed = exports.util.decryptAES(params.sessionId, exports.util.passPhrase);
                // console.log('sessionId: ', queryString.sessionId)
                // console.log('seed', seed, util.sessionToken, seed.indexOf(util.sessionToken))
                if (seed.indexOf(exports.util.sessionToken) == 0) {
                    const expectedMsg = `My session ID: ${params.sessionId}`;
                    const hash = ethers.utils.id(`\x19Ethereum Signed Message:\n${expectedMsg.length}${expectedMsg}`);
                    realAddr = ethers.utils.recoverAddress(hash, params.sig);
                }
                else {
                    error = `Invalid sessionId: ${params.sessionId}`;
                }
            }
            catch (err) {
                error = err.reason;
            }
            if (error) {
                observer.error({ msg: error });
            }
            else {
                if (realAddr.toLowerCase() === claimedAddr.toLowerCase()) {
                    observer.next({ msg: `Legitimate, welcome ${realAddr}`, valid: true });
                    observer.complete();
                }
                else {
                    observer.error({ msg: `Fraud!!! You are not ${claimedAddr}, you are ${realAddr}!` });
                }
            }
        });
    },
    checkLeapYear: (year) => {
        //three conditions to find out the leap year
        if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
            console.log(year + ' is a leap year');
            return true;
        }
        else {
            console.log(year + ' is not a leap year');
            return false;
        }
    },
    timeDifference: (date1, date2) => {
        let difference = date1.getTime() - date2.getTime();
        let daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
        difference -= daysDifference * 1000 * 60 * 60 * 24;
        let hoursDifference = Math.floor(difference / 1000 / 60 / 60);
        difference -= hoursDifference * 1000 * 60 * 60;
        let minutesDifference = Math.floor(difference / 1000 / 60);
        difference -= minutesDifference * 1000 * 60;
        let secondsDifference = Math.floor(difference / 1000);
        // NOTE for debugging
        // console.log('difference = ' +
        //   daysDifference + ' day/s ' +
        //   hoursDifference + ' hour/s ' +
        //   minutesDifference + ' minute/s ' +
        //   secondsDifference + ' second/s ');
        return { days: daysDifference, hours: hoursDifference, minutes: minutesDifference, seconds: secondsDifference };
    },
    shallowEqual: (obj1, obj2) => {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        let diff = false;
        keys1.some((key) => {
            diff = obj1[key] !== obj2[key];
            return diff;
        });
        return !diff;
    },
    getIpAddress: () => {
        return Object.keys(ifs)
            .map(x => [x, ifs[x].filter(x => x.family === 'IPv4')[0]])
            .filter(x => x[1])
            .map(x => x[1].address);
    },
    httpsExchange: (params) => {
        return new rxjs_1.Observable((observer) => {
            var options = {
                'method': 'GET',
                'hostname': '192.168.86.108',
                'port': 3090,
                'path': '/v1/admin/status',
                'headers': {
                    'Authorization': 'Basic aG9tZWh1Yi9hZG1pbjpjZ3Y1T2g1NlNqRFhFazZaVlU3NnlWTVdoejVtME0='
                },
                'maxRedirects': 20
            };
            let req = follow_redirects_1.https.request(options, function (res) {
                var chunks = [];
                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });
                res.on("end", function (chunk) {
                    var body = Buffer.concat(chunks);
                    // console.log(body.toString());
                    observer.next(body);
                    observer.complete();
                });
                res.on("error", function (error) {
                    console.error(error);
                });
            });
            req.end();
        });
    },
    curlExchange: (params) => {
        let arg = `curl --location --request GET '${params.url}' --header 'Authorization: Basic ${params.key}'`;
        return exports.util.shell(arg);
    },
    shell: (arg, success = 'command executed successfully', error = 'command failed', prnStdout = true, options = { maxBuffer: 1024 * 2000 }) => {
        return new rxjs_1.Observable((observer) => {
            console.log(arg);
            let child = exec(arg, options, (err, stdout, stderr) => {
                if (!err) {
                    // console.log(stdout);
                    console.log(success);
                    observer.next(prnStdout ? stdout : '');
                    observer.complete();
                }
                else {
                    console.log(`${error}: ${err}`);
                    observer.error(err);
                }
            });
            child.stdout.pipe(process.stdout);
            child.on('data', (data) => {
                console.log(data);
            });
        });
    }
};
