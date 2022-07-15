import fileUpload = require('express-fileupload');
import path = require('path');
import { Observable, of } from 'rxjs';
import { existsSync, readFileSync } from 'fs';
import cors = require('cors');
import { CosClient } from './cos-client';
import { Params } from './params';
import { util, homePath, privateKey, publicKey } from './utility';
import { anax } from './utils';
import express = require('express');
import { Stream } from 'stream';
import * as readline from 'readline';
import * as https from 'https';
import EnvJson from './.env-local.json';
import * as dotenv from 'dotenv';

declare const process: any;

// set env vars
const env = process.env.npm_config_env || 'prod';

export class Server {
  params: Params = <Params>{};
  localJson = EnvJson as any;
  cosClient: CosClient;
  app = express();
  apiUrl = 'https://service.us.apiconnect.ibmcloud.com/gws/apigateway/api/96fd655207897b11587cfcf2b3f58f6e0792f788cf2a04daa79b53fc3d4efb32/liquidprep-cf-api'
  constructor() {
    this.initialise()
  }

  getParams(params: Params) {
    return Object.assign(this.params, params)
  }
  setCorsHeaders(req: express.Request, res: express.Response) {
    res.header("Access-Control-Allow-Origin", "YOUR_URL"); // restrict it to the required domain
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    // Set custom headers for CORS
    res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");

  }
  streamData(req: express.Request, res: express.Response, parse = true) {
    let params = this.getParams(req.query as unknown as Params);
    let body = ''
    return new Observable((observer) => {
      req.on('data', (data) => {
        body += data
      })
      .on('close', () => {
        try {
          console.log(body)
          let data = JSON.parse(body);
          if(!parse) {
            params.body = data
          } else {
            Object.keys(data).forEach((key) => {
              params[key] = data[key];
            })
          }
          observer.next(params)
          observer.complete()
        } catch(e) {
          observer.error(e)
        }
      })
    })
  }
  initialise() {
    this.params.accessKeyId = this.localJson[env]['access_key_id'];
    this.params.secretAccessKey = this.localJson[env]['secret_access_key'];
    this.params.serviceInstanceId = this.localJson[env]['resource_instance_id'];
    this.params.bucket = this.localJson[env]['bucket'];
    this.params.ibmAuthEndpoint = this.localJson[env]['ibmAuthEndpoint'];
    this.params.endpoint = this.localJson[env]['endpoint'];
    this.params.region = this.localJson[env]['region'];
    this.cosClient = new CosClient(this.params)

    if(!existsSync(privateKey)) {
      anax.createPublicPrivateKey()
      .subscribe({
        next: (data: any) => console.log(data),
        error: (err: any) => console.log(err)
      })
    }
    let app = this.app;
    app.options('*', cors());
    app.use(cors({
      credentials: true,
      preflightContinue: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      origin: true
    }));
    app.use(fileUpload());

    app.use('/static', express.static('public'));

    app.use('/', express.static('dist/policy-editor'))

    app.get('/', (req: express.Request, res: express.Response, next) => { //here just add next parameter
      res.sendFile(
        path.resolve( __dirname, "index.html" )
      )
      // next();
    })

    app.get("/staff", (req: express.Request, res: express.Response) => {
      res.json(["Jeff"]);
    });
    app.get('/get_signed_url', (req: express.Request, res: express.Response, next) => {
      this.cosClient.getSignedUrl(this.getParams(req.query as unknown as Params))
      .subscribe({
        next: (data: any) => res.send(data),
        error: (err: any) => next(err)
      })
    });
    app.get('/list', (req: express.Request, res: express.Response) => {
      let result: any;
      let params = this.getParams(req.query as unknown as Params);
      console.log('bucket: ', params.bucket, params.accessKeyId, params.ibmAuthEndpoint, params.directory, params.delimiter)
      this.cosClient.ls(params.bucket, params.directory ? params.directory : '', params.delimiter ? params.delimiter : null)
      .subscribe({
        next: (data: any) => {
          const directories = data.CommonPrefixes.map((p: any) => {
            return p.Prefix;
          });
          const files = data.Contents.map((f: any) => {
            return {key: f.Key, date: f.LastModified, size: f.Size};
          });
          res.send({directories: directories, files: files});
        },
        error: (err: any) => res.send({})
      })
    });
    app.post('/mkdir', (req: express.Request, res: express.Response, next) => {
      this.streamData(req, res)
      .subscribe({
        next: (params: Params) => {
          console.log(params)
          this.cosClient.mkdir(params)
          .subscribe({
            next: (data: any) => res.send(data),
            error: (err: any) => next(err)
          })
        }, error: (err) => next(err)
      })
    })
    app.post('/delete', (req: express.Request, res: express.Response, next) => {
      this.streamData(req, res)
      .subscribe({
        next: (params: Params) => {
          this.cosClient.delete(params)
          .subscribe({
            next: (data: any) => res.send(data),
            error: (err: any) => next(err)
          })
        }, error: (err) => next(err)
      })
    })
    app.post('/delete_folder', (req: express.Request, res: express.Response, next) => {
      this.streamData(req, res)
      .subscribe({
        next: (params: Params) => {
          this.cosClient.deleteDir(params)
          .subscribe({
            next: (data: any) => res.send(data),
            error: (err: any) => next(err)
          })
        }, error: (err) => next(err)
      })
    })
    app.post('/upload', (req: express.Request, res: express.Response, next) => {
      let params = this.getParams(req.query as unknown as Params);
      let matches = req.body.file.match(/^data:([A-Za-z-+\/.]+);base64,(.+)$/)
      if (!matches && matches.length !== 3) {
        next({result: 'Invalid file format'});
      }
      let config = req.body.config;
      // console.log('$$$stream', req.body.file, req.body.config)
      const stream = new Stream.PassThrough();
      // console.log('$$$stream through')
      const buffer = Buffer.from(matches[2], 'base64');
      // const buffer = req['body'].file;
      // console.log('$$$stream buffer', buffer.length)
      stream.end(buffer);

      let rl = readline.createInterface({
        input: stream,
      });
      let length = buffer.byteLength;
      let body = ''
      rl.on('line', function (line, lineCount, byteCount) {
        // console.log('reading', line)
        body += line;
      })
      .on('close', () => {
        try {
          // console.log(config)
          let data = JSON.parse(config);
          Object.keys(data).forEach((key) => {
            params[key] = data[key]
          })
          params.body = Buffer.from(body, 'base64');
          params.contentType = matches[1];
          this.cosClient.upload(params)
          .subscribe({
            next: (data: any) => res.send(data),
            error: (err: any) => next(err)
          })
        } catch(e) {
          next({result: `catch: ${e}`});
        }
      })
    })
    app.post('/upload2', (req: express.Request, res: express.Response, next) => {
      let params = this.getParams(req.query as unknown as Params);
      console.log('$$$stream', req.body.file)
      const stream = new Stream.PassThrough();
      console.log('$$$stream through')
      const buffer = Buffer.from(req.body.file, 'base64');
      // const buffer = req['body'].file;
      console.log('$$$stream buffer', buffer.length)
      stream.end(buffer);

      let rl = readline.createInterface({
        input: stream,
      });
      let length = buffer.byteLength;
      let file = {data: '', reading: false}
      let config = {data: '', reading: false}
      rl.on('line', function (line, lineCount, byteCount) {
        console.log('reading', line)
        if(line.indexOf('------WebKitFormBoundary') === 0) {
          file.reading = false;
          config.reading = false;
        } else if(file.reading) {
          if(line.trim().length > 0) {
            file.data += line;
          }
        } else if(config.reading) {
          if(line.length > 0) {
            config.data += line;
          }
        } else if(line.indexOf('Content-Disposition:') === 0 && line.match(/name="file"/)) {
          file.reading = true;
          config.reading = false;
        } else if(line.indexOf('Content-Disposition:') === 0 && line.match(/name="config"/)) {
          config.reading = true;
          file.reading = false;
        }
      })
      .on('close', () => {
        try {
          let data = JSON.parse(config.data);
          let fields = ['bucket', 'filename', 'acl'];
          fields.forEach((field) => {
            if(data[field]) {
              // console.log('field', field, data[field])
              params[field] = data[field];
            }
          });
          let matches: any = file.data.match(/^data:([A-Za-z-+\/.]+);base64,(.+)$/);
          // console.log('matches', matches)
          if (!matches && matches.length !== 3) {
            next({result: 'Invalid file format'});
          }
          params.body = Buffer.from(matches[2], 'base64');
          params.contentType = matches[1];

          this.cosClient.upload(params)
          .subscribe({
            next: (data: any) => res.send(data),
            error: (err: any) => next(err)
          })
        } catch(e) {
          next({result: `catch: ${e}`});
        }
      })
    })
    app.get('/session', (req: express.Request, res: express.Response) => {
      let params = this.getParams(req.query as unknown as Params);
      const sessionId = util.encryptAES()
      const seed = util.decryptAES(sessionId)
      console.log(sessionId, seed)
      res.send({sessionId: sessionId});
    })
    app.get('/signature', (req: express.Request, res: express.Response, next) => {
      let params = this.getParams(req.query as unknown as Params);
      util.signature(params)
      .subscribe({
        next: (data: any) => res.send(data),
        error: (err: any) => next(err)
      })
    })
    app.get('/validate_session', (req: express.Request, res: express.Response) => {
      let params = this.getParams(req.query as unknown as Params);
      res.send({valid: util.validateSession(params.sessionId)})
    })
    app.get('/encrypt_sha256', (req: express.Request, res: express.Response) => {
      let params = this.getParams(req.query as unknown as Params);
      res.send({encrypt_sha256: util.encryptSha256(params.url)})
    })
    app.post('/sign_deployment', (req: express.Request, res: express.Response, next) => {
      this.streamData(req, res, false)
      .subscribe({
        next: (params: Params) => {
          let services = params.body.services
          let hash = {}
          Object.keys(services).forEach((service: any) => {
            hash[service] = util.encryptSha256(services[service].image)
            services[service].image = `${services[service].image}@sha256:${hash[service]}`
          })
          // NOTES: if escape \", agreement failed with no public key available
          let deployment = `"${JSON.stringify(params.body).replace(/"/g, '\\"')}"`
          // NOTES: if escape \", agreement gets verified but failed with marshalling error, invalid character
          // let deployment = `'${JSON.stringify(params.body)}'`
          console.log('no hash', deployment)
          anax.signDeployment(privateKey, deployment)
          .subscribe({
            next: (data: any) => res.send({signature: data, deployment: JSON.stringify(params.body)}),
            error: (err: any) => next(err)
          })
        }, error: (err) => next(err)
      })
    })
    app.post('/sign_deployment2', (req: express.Request, res: express.Response, next) => {
      this.streamData(req, res, false)
      .subscribe({
        next: (params: Params) => {
          let body = `'${JSON.stringify(params.body).replace(/"/g, '\\"')}'`
          // let body = `'${JSON.stringify(params.body)}'`
          console.log('no hash', body)
          anax.signDeployment(privateKey, body)
          .subscribe({
            next: (data: any) => res.send({signature: data}),
            error: (err: any) => next(err)
          })
        }, error: (err) => next(err)
      })
    })
    app.post('/sign_deployment_hash', (req: express.Request, res: express.Response, next) => {
      this.streamData(req, res, false)
      .subscribe({
        next: (params: Params) => {
          let body = `'${JSON.stringify(params.body).replace(/"/g, '\\"')}'`
          // let body = `'${JSON.stringify(params.body)}'`
          console.log('before hash', body)
          let hash = util.encryptSha256(body)
          console.log('hash', hash)
          anax.signDeployment(privateKey, hash)
          .subscribe({
            next: (data: any) => res.send({signature: data}),
            error: (err: any) => next(err)
          })
        }, error: (err) => next(err)
      })
    })
    app.get('/create_private_public_key', (req: express.Request, res: express.Response, next) => {
      anax.createPublicPrivateKey()
      .subscribe({
        next: (data: any) => res.send({data: data}),
        error: (err: any) => next(err)
      })
    })
    app.get('/get_public_key', (req: express.Request, res: express.Response, next) => {
      const content = readFileSync(publicKey, {encoding:'utf8', flag:'r'});
      res.send({publicKey: content})
    })
    app.get('/bcrypt', (req: express.Request, res: express.Response, next) => {
      let params = this.getParams(req.query as unknown as Params);
      util.bcryptHash(params)
      .then(hash => {
        res.send({hash: hash})
      })
      .catch(err => {
          console.log(err)
          next(err)
      })
    })
    app.get('/bcrypt_validate', (req: express.Request, res: express.Response, next) => {
      let params = this.getParams(req.query as unknown as Params);
      util.bcryptValidate(params)
      .then(result => {
        console.log(result)
        res.send({res: result})
      })
      .catch(err => {
          console.log(err)
          next(err)
      })
    })
    app.get("*",  (req, res) => {
      res.redirect(301, '/')
    })
    app.listen(3000, () => {
      console.log('Started on 3000');
    });
  }
}
