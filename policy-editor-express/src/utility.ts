import { Observable, of, forkJoin } from 'rxjs';
import { existsSync, accessSync, chmod, constants, renameSync, copyFileSync, unlinkSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { Params } from './params';
import { https, http } from 'follow-redirects';
// import * as http from 'http';
import * as os from 'os';
import * as cryptoJS from 'crypto-js';
import * as ethers from 'ethers';
const ifs: any = os.networkInterfaces();
import * as jsonfile from 'jsonfile';
import * as cp from 'child_process';
import { hasUncaughtExceptionCaptureCallback } from 'process';
const exec = cp.exec;

export const util: any = {
  passPhrase: 'iEAM&openHoriZon',
  sessionToken: 'geTSesSiontOkEnfOrvAliDation',
  encrypt: (text: string) => {
    return cryptoJS.enc.Base64.stringify(cryptoJS.enc.Utf8.parse(text));
  },
  decrypt: (data: string) => {
    return cryptoJS.enc.Base64.parse(data).toString(cryptoJS.enc.Utf8);
  },
  encryptAES: (text: string = util.sessionToken + Date.now()) => {
    const ciphertext = cryptoJS.AES.encrypt(text, util.passPhrase).toString()
    return ciphertext;
  },
  decryptAES: (cipherText: string) => {
    const decrypted = cryptoJS.AES.decrypt(cipherText, util.passPhrase)
    let originalText = ''
    if(decrypted) {
      originalText = decrypted.toString(cryptoJS.enc.Utf8);
    }
    return originalText;
  },
  encryptSha256: (jsonString: string) => {
    return cryptoJS.SHA256(jsonString);
  },
  validateSession: (sessionId: string) => {
    const seed = util.decryptAES(sessionId, util.passPhrase)
    return Date.now() - parseInt(seed.substring(util.sessionToken.length)) < 300000;
  },
  signature: (params: Params) => {
    return new Observable((observer) => {
      const claimedAddr = params.addr
      let error = "", realAddr = ""
      try {
        const seed = util.decryptAES(params.sessionId, util.passPhrase)
        // console.log('sessionId: ', queryString.sessionId)
        // console.log('seed', seed, util.sessionToken, seed.indexOf(util.sessionToken))
        if(seed.indexOf(util.sessionToken) == 0) {
          const expectedMsg = `My session ID: ${params.sessionId}`
          const hash = ethers.utils.id(`\x19Ethereum Signed Message:\n${expectedMsg.length}${expectedMsg}`)
          realAddr = ethers.utils.recoverAddress(hash, params.sig)
        } else {
          error = `Invalid sessionId: ${params.sessionId}`
        }
      } catch (err) {
        error = err.reason
      }

      if (error)  {
        observer.error({msg: error})
      } else {
        if (realAddr.toLowerCase() === claimedAddr.toLowerCase()) {
          observer.next({msg: `Legitimate, welcome ${realAddr}`, valid: true})
          observer.complete()
        } else {
          observer.error({msg: `Fraud!!! You are not ${claimedAddr}, you are ${realAddr}!`})
        }
      }
    });
  },
  checkLeapYear: (year: number) => {
    //three conditions to find out the leap year
    if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
      console.log(year + ' is a leap year');
      return true;
    } else {
      console.log(year + ' is not a leap year');
      return false;
    }
  },
  timeDifference: (date1: Date, date2: Date) => {
    let difference = date1.getTime() - date2.getTime();
    let daysDifference = Math.floor(difference/1000/60/60/24);

    difference -= daysDifference*1000*60*60*24
    let hoursDifference = Math.floor(difference/1000/60/60);

    difference -= hoursDifference*1000*60*60
    let minutesDifference = Math.floor(difference/1000/60);

    difference -= minutesDifference*1000*60
    let secondsDifference = Math.floor(difference/1000);

    // NOTE for debugging
    // console.log('difference = ' +
    //   daysDifference + ' day/s ' +
    //   hoursDifference + ' hour/s ' +
    //   minutesDifference + ' minute/s ' +
    //   secondsDifference + ' second/s ');
    return {days: daysDifference, hours: hoursDifference, minutes: minutesDifference, seconds: secondsDifference}
  },
  shallowEqual: (obj1: any, obj2: any) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    let diff = false
    keys1.some((key) => {
      diff = obj1[key] !== obj2[key]
      return diff
    })
    return !diff;
  },
  getIpAddress: () => {
    return Object.keys(ifs)
    .map(x => [x, ifs[x].filter(x => x.family === 'IPv4')[0]])
    .filter(x => x[1])
    .map(x => x[1].address);
  },
  httpsExchange: (params: Params) => {
    return new Observable((observer) => {
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
      let req = https.request(options, function (res) {
        var chunks:any = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          // console.log(body.toString());
          observer.next(body)
          observer.complete()
        });

        res.on("error", function (error) {
          console.error(error);
        });
      });

      req.end();
    })
  },
  curlExchange: (params: Params) => {
    let arg = `curl --location --request GET '${params.url}' --header 'Authorization: Basic ${params.key}'`
    return util.shell(arg)
  },
  shell: (arg: string, success='command executed successfully', error='command failed', prnStdout=true, options={maxBuffer: 1024 * 2000}) => {
    return new Observable((observer) => {
      console.log(arg);
      let child = exec(arg, options, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          // console.log(stdout);
          console.log(success);
          observer.next(prnStdout ? stdout : '');
          observer.complete();
        } else {
          console.log(`${error}: ${err}`);
          observer.error(err);
        }
      });
      child.stdout.pipe(process.stdout);
      child.on('data', (data) => {
        console.log(data)
      })
    });
  },
  isSha256: (hash: string) => {
    const regexExp = /^[a-f0-9]{64}$/gi;
    return regexExp.test(hash)
  }
}

export const shell = util.shell;
export const isSha256 = util.isSha256;
export const encryptSha256 = util.encryptSha256;

export const homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
export const privateKey = `${homePath}/.ssh/key.pem`;
