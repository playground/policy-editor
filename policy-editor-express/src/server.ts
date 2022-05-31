import fileUpload = require('express-fileupload');
import path = require('path');
import { Observable, of } from 'rxjs';
import { existsSync, readFileSync } from 'fs';
import cors = require('cors');
import { CosClient } from '@common/cos-client';
import { Params } from '@common/params/params';
import { util } from './utility';
import express = require('express');
import { Stream } from 'stream';
import * as readline from 'readline';
import * as https from 'https';
import cosAccess from './.env-local.json';
import * as dotenv from 'dotenv';

if(existsSync('./.env-local')) {
  const localEnv = dotenv.parse(readFileSync('./.env-local'));
  for(var i in localEnv) {
    process.env[i] = localEnv[i];
  }
}

// set env vars
const env = process.env.npm_config_env || 'prod';

let pEnv = process.env;
pEnv.accessKeyId = cosAccess[env]['access_key_id'];
pEnv.secretAccessKey = cosAccess[env]['secret_access_key'];
pEnv.serviceInstanceId = cosAccess[env]['resource_instance_id'];
pEnv.bucket = cosAccess[env]['bucket'];
pEnv.ibmAuthEndpoint = cosAccess[env]['ibmAuthEndpoint'];
pEnv.endpoint = cosAccess[env]['endpoint'];
pEnv.region = cosAccess[env]['region'];

let cosClient: CosClient;

export class Server {
  cosClient = new CosClient(pEnv as unknown as Params);
  app = express();
  apiUrl = 'https://service.us.apiconnect.ibmcloud.com/gws/apigateway/api/96fd655207897b11587cfcf2b3f58f6e0792f788cf2a04daa79b53fc3d4efb32/liquidprep-cf-api'
  constructor() {
    this.initialise()
  }

  initialise() {
    let app = this.app;
    app.use(cors({
      origin: '*'
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
      cosClient.getSignedUrl(req.query as unknown as Params)
      .subscribe({
        next: (data: any) => res.send(data),
        error: (err: any) => next(err)
      })
    });
    app.get('/list', (req: express.Request, res: express.Response) => {
      let result: any;
      let params = req.query as unknown as Params;
      console.log('bucket: ', params.bucket)
      cosClient.ls(params.bucket, params.directory ? params.directory : '', params.delimiter ? params.delimiter : null)
      .subscribe({
        next: (data: any) => {
          const directories = result.CommonPrefixes.map((p: any) => {
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
    app.get('/mkdir', (req: express.Request, res: express.Response, next) => {
      let params = req.query as unknown as Params;
      cosClient.mkdir(params)
      .subscribe({
        next: (data: any) => res.send(data),
        error: (err: any) => next(err)
      })
    })
    app.get('/delete', (req: express.Request, res: express.Response, next) => {
      let params = req.query as unknown as Params;
      cosClient.delete(params)
      .subscribe({
        next: (data: any) => res.send(data),
        error: (err: any) => next(err)
      })
    })
    app.get('/delete_folder', (req: express.Request, res: express.Response, next) => {
      let params = req.query as unknown as Params;
      console.log('$$$delete_folder')
      cosClient.deleteDir(params)
      .subscribe({
        next: (data: any) => res.send(data),
        error: (err: any) => next(err)
      })
    })
    app.get('/upload', (req: express.Request, res: express.Response, next) => {
      let params = req.query as unknown as Params;
      // console.log('$$$stream')
      const stream = new Stream.PassThrough();
      // console.log('$$$stream through')
      const buffer = Buffer.from(params['body'], 'utf-8');
      // const buffer = params.body;
      // console.log('$$$stream buffer')
      stream.end(buffer);

      let rl = readline.createInterface({
        input: stream,
      });
      let length = buffer.byteLength;
      let file = {data: '', reading: false}
      let config = {data: '', reading: false}
      rl.on('line', function (line, lineCount, byteCount) {
        // console.log('reading', line)
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

          cosClient.upload(params)
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
      let params = req.query as unknown as Params;
      const sessionId = util.encryptAES()
      const seed = util.decryptAES(sessionId)
      console.log(sessionId, seed)
      res.send({sessionId: sessionId});
    })
    app.get('/signature', (req: express.Request, res: express.Response, next) => {
      let params = req.query as unknown as Params;
      util.signature(params)
      .subscribe({
        next: (data: any) => res.send(data),
        error: (err: any) => next(err)
      })
    })
    app.get('/validate_session', (req: express.Request, res: express.Response) => {
      let params = req.query as unknown as Params;
      res.send({valid: util.validateSession(params.sessionId)})
    })
    app.get("*",  (req, res) => {
      res.redirect(301, '/')
    })
    app.listen(3000, () => {
      console.log('Started on 3000');
    });
  }
}