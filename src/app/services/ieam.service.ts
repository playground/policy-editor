import { Injectable, EventEmitter, Output, HostListener, isDevMode } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { Params, IMethod, IEnvVars, IHznConfig, IService } from '../interface';
import { Enum, Navigate, EnumClass, HeaderOptions, IExchange, IEditorStorage, Loader, Exchange, IOption, UrlToken, JsonSchema, Role, ActionMap, JsonKeyMap } from '../models/ieam-model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '../components/dialog/dialog.component';
import shajs from 'sha.js';
import { Content } from '@angular/compiler/src/render3/r3_ast';

declare const window: any;

export const pickerOptions: any = {
  types: [
    {
      description: 'Json files',
      accept: {
        'application/json': ['.json']
      }
    },
  ],
  excludeAcceptAllOption: true,
  multiple: false
};

export interface Broadcast {
  type: string | Enum;
  payload?: any;
}
@Injectable({
  providedIn: 'root'
})
export class IeamService implements HttpInterceptor {
  @Output() broadcastAgent = new EventEmitter<Broadcast>();
  selectedRow!: { directory: any; type?: any; } | null;
  fileType!: EnumClass;
  offline = false;
  session!: string;
  loggedIn: boolean = false;
  welcome: string = ''
  loginSession: any;
  sessionExpiry = 3600000;
  urlExpiry = 600;
  editorStorage: any = {};
  configJson: any = {};
  editingConfig = false;
  dialogRef?: MatDialogRef<DialogComponent, any>;
  selectedOrg: string = '';
  selectedCall: string = '';
  selectedLoader: string = '';
  selectedArch: string = '';
  selectedDockerHubId: string = '';
  currentFilename = '';
  configFilename = '';
  isJsonModified = false;
  method: IMethod;
  editable = false;
  activeExchangeFile: any;
  orgId = '';
  nodeId = '';
  agId = '';
  service = '';
  jsonTree = {html: '', nested: 0}

  currentWorkingFile = '';
  titleText = 'IEAM';
  nodeLevel: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    const backendUrl = isDevMode() ? 'http://192.168.86.250:3000' : '';
    this.method = {
      list: `${backendUrl}/list`,
      mkdir: `${backendUrl}/mkdir`,
      upload: `${backendUrl}/upload`,
      session: `${backendUrl}/session`,
      sigUrl: `${backendUrl}/get_signed_url`,
      signature: `${backendUrl}/signature`,
      delete: `${backendUrl}/delete`,
      deleteFolder: `${backendUrl}/delete_folder`,
      signDeployment: `${backendUrl}/sign_deployment`,
      signDeploymentWithHash: `${backendUrl}/sign_deployment_hash`,
      getPublicKey: `${backendUrl}/get_public_key`,
      publishService: `${backendUrl}/publish_service`,
      post: 'post'
    };

    this.fileType = new EnumClass(['DIRECTORY', 'FILE']);

    if(this.isMetaMaskInstalled()) {
      this.listenEthereum()
    } else {
      console.log('install metamask')
      this.broadcast({type: Enum.INSTALL_METAMASK, payload: {}})
    }
    this.signIn()
  }
  listenEthereum() {
    (window as any).ethereum.on('accountsChanged', () => {
      console.log('lock')
      this.loggedIn = false;
      this.broadcast({type: Enum.LOGGED_OUT})
    })
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: {

      }
    })

    throw new Error('Method not implemented.');
  }

  broadcast(data: any) {
    this.broadcastAgent.emit(data);
  }

  get(url: string, options: any = {}) {
    return this.http.get<Params>(url, options);
  }
  post(url: string, body: any, options = {}) {
    options = {headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*'
    }}
    return this.http.post<Params>(url, body, options);
  }

  fetchPost(url: string, body: any) {
    return new Observable((observer: any) => {
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append('Access-Control-Allow-Credentials', 'true')
      headers.append('Access-Control-Allow-Origin', '*')
      let requestOptions = {
        method: 'POST',
        headers: headers,
        body: body,
        mode: 'cors',
        credentials: 'include'
      };
      // @ts-ignore
      fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        observer.next(result)
        observer.complete()
      })
      .catch(error => console.log('error', error));
    })
  }
  fetchCors(url: string, headers: any) {
    return new Observable((observer: any) => {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
      };
      // @ts-ignore
      fetch(url, requestOptions)
        .then(response => response.json())
        .then(result => {
          console.log(result)
          observer.next(result)
          observer.complete()
        })
        .catch(error => console.log('error', error));
    })
  }

  getDirectory(f: string) {
    const match = f.match(/.*\/([^/]*)\/[^/]*/);
    return match ? match[1] : f.replace('/', '');
  }

  getFilename(f: string) {
    const match = f.match(/\/([^\/]+)\/?$/);
    return match ? match[1] : f;
  }

  getFilePath(root: string, f: string) {
    return f.replace(root, '')
  }
  setSession(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  getSession(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  removeSession(key: string) {
    sessionStorage.removeItem(key);
  }

  getSignedUrl(filename: string, bucket: string, expires = this.urlExpiry) {
    let url = `${this.method.sigUrl}?filename=${filename}&expires=${expires}&bucket=${bucket}`;
    return this.get(url)
    // 'https://ieam-action-prod.fux62nioj9a.us-south.codeengine.appdomain.cloud/?action=get_signed_url&filename=20160414_112151.jpg&expires=60&bucket=ieam-labs'
  }
  getUserSession() {
    if(this.session) {
      return of(this.session)
    } else {
      return this.get(this.method.session)
    }
  }
  mkdir() {

  }
  logOut() {
    this.removeSession('loggedIn')
    this.loggedIn = false;
    // TODO, should logout of Metamask too?
  }
  isMetaMaskInstalled() {
    // console.log('etherum')
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  }
  logIn() {
    this.get(this.method.session)
    .subscribe({
      next: (body: any) => {
        console.log('connecting to metammask')
        this.connectMetamask()
        .subscribe({
          next: (addr: any) => {
            console.log('sign metammask')
            let sessionId = body.sessionId;
            this.signMetamask(sessionId, addr)
            .subscribe({
              next: (res: any) => {
                this.loggedIn = true;
                this.welcome = res.msg;
                this.setSession('loggedIn', JSON.stringify({sessionId: sessionId, addr: addr, timestamp: Date.now()}));
                this.broadcast({type: Enum.LOGGED_IN, payload: res})
              }, error: (err) => {
                console.log(err)
                // observer.error(err);
              }
            })
          }, error: (err: any) => {
            console.log(err)
          }
        })
      }, error: (err: any) => {
        console.log(err)
      }
    })
  }
  connectMetamask() {
    return new Observable((observer) => {
      (window as any).ethereum.request({method: 'eth_requestAccounts'})
      .then((arr: any) => {
        let addr = arr[0]
        observer.next(addr)
        observer.complete()
      }, (err: any) => {
        console.log('connect metamask:', err)
        observer.error(err.message)
      }).catch((err: any) => {
        console.log('connect metamask:', err)
      })
    })
  }
  signMetamask(sessionId: string, addr: string) {
    return new Observable((observer) => {
      (async () => {
        let walletResp = await (window as any).ethereum.request({
          method: "personal_sign",
          params: [`My session ID: ${sessionId}`, addr, ""]
        })
        const sigUrl = `?sig=${encodeURIComponent(walletResp)}&addr=${encodeURIComponent(addr)}&sessionId=${encodeURIComponent(sessionId)}`
        this.get(`${this.method.signature}${sigUrl}`)
        .subscribe({
          next: (res: any) => {
            observer.next(res)
            observer.complete()
          }, error: (err) => observer.error(err)
        })
      })()
    })
  }

  isLoggedIn() {
    if(!this.loggedIn) {
      this.router.navigate([`/${Navigate.signin}`])
    } else {
      let session: any = this.getSession('loggedIn');
      if(session) {
        session = JSON.parse(session);
        session.timestamp = Date.now()
        this.setSession('loggedIn', JSON.stringify(session));
      }
    }
    return this.loggedIn
  }

  signIn(currentRoute: string = '') {
    let session: any = this.getSession('loggedIn');
    if(session) {
      session = JSON.parse(session);
      this.loggedIn = Date.now() - session.timestamp <= this.sessionExpiry
      this.loginSession = session;
      this.welcome = `Welcome ${session.addr}`
    }
    if(!this.loggedIn && currentRoute !== '/signin') {
      console.log('is loggedin', this.loggedIn)
      this.loginSession = null;
      this.router.navigate([`/${Navigate.signin}`])
    }
    return this.loggedIn;
  }
  navigateByUrl(url: string, state: any) {
    if(this.loggedIn) {
      this.router.navigateByUrl(url, state)
    }
  }
  loadFile(payload: any, type: Enum) {
    return new Observable((observer) => {
      let $upload: any = {};
      let $files: any = {};
      let fhandle: FileSystemFileHandle[] = payload.fhandle;

      for (let i = fhandle.length - 1; i >= 0; i--) {
        $files[fhandle[i].name] = this.readOpenFile(fhandle[i]);
      }
      forkJoin($files)
      .subscribe((res: any) => {
        Object.keys(res).forEach((key: any, idx: number) => {
          if(type == Enum.LOAD_CONFIG) {
            this.configFilename = key
            this.configJson = JSON.parse(res[key]);
            this.addEditorStorage(JSON.parse(res[key]), key, 'hznConfig')
            this.broadcast({type: Enum.CONFIG_LOADED, payload: payload});
          } else if(type == Enum.LOAD_POLICY) {
            this.currentFilename = key
            // this.editorStorage = {json: JSON.parse(res[key]), filename: key};
            this.addEditorStorage(JSON.parse(res[key]), key, this.currentWorkingFile)
          }
        });
        observer.complete()
      })
    })
  }
  readOpenFile(fhandle: FileSystemFileHandle) {
    const reader = new FileReader();
    return new Observable((observer: { next: (arg0: any) => void; complete: () => void; }) => {
      (async () => {
        const file = await fhandle.getFile();
        const content = await file.text();
        observer.next(content)
        observer.complete()
      })()
    });
  }
  openFilePicker(payload:any = {}, type: Enum) {
    this.showOpenFilePicker()
    .subscribe({
      next: (fhandle: any) => {
        payload.fhandle = fhandle;
        this.broadcast({type: type, payload: payload});
      }
    })
  }
  showOpenFilePicker(pickerOpts = pickerOptions) {
    return new Observable((observer) => {
      (async () => {
        try {
          let fhandle = await window.showOpenFilePicker(pickerOpts);
          observer.next(fhandle)
          observer.complete()
        } catch(e) {
          observer.error(e)
        }
      })()
    })
  }
  saveFile(filename: string, content: string) {
    var element = window.document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    window.document.body.appendChild(element);

    element.click();
    window.document.body.removeChild(element);

    this.setModify(false);
  }
  isObject(value: any) {
    return !!(value && typeof value === "object" && !Array.isArray(value));
  }
  getObjectByValue(object: any, value: string): any {
    if(this.isObject(object)) {
      const entries = Object.entries(object);
      for(let i=0; i<entries.length; i++) {
        const [objKey, objValue] = entries[i];
        if(typeof objValue == 'string' && objValue.indexOf(value) >= 0) {
          let obj: any = {}
          return obj[objKey] = object;
        }
        if(this.isObject(objValue)) {
          const child = this.getObjectByValue(objValue, value);

          if(child !== null) {
            return child;
          }
        }
      }
    }
    return null;
  }
  getObjectByKey(object: any, key: string) {
    if(this.isObject(object)) {
      const entries = Object.entries(object);
      for(let i=0; i<entries.length; i++) {
        const [objKey, objValue] = entries[i];
        if(objKey === key) {
          let obj = {}
          return obj[objKey] = object;
        }
        if(this.isObject(objValue)) {
          const child = this.getObjectByValue(objValue, key);

          if(child !== null) {
            return child;
          }
        }
      }
    }
    return null;
  }
  tokenReplace(template, obj) {
    //  template = 'Where is ${movie} playing?',
    //  tokenReplace(template, {movie: movie});
    return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match, key) {
      return obj[key];
    });
  }
  getNodeContent(json: any, orgId = this.selectedOrg) {
    if(JsonSchema[this.selectedCall] && JsonSchema[this.selectedCall].contentNode) {
      // let contentNode = '';
      // contentNode = this.tokenReplace(JsonSchema[this.selectedCall].contentNode, {orgId: orgId, agId: this.agId, nodeId: this.nodeId})
      const node = JsonSchema[this.selectedCall].contentNode;
      const nodes = node.split('.')
      let nodePath: string[] = []
      this.service = this.service.trim()
      nodes.forEach((n, idx) => {
        nodePath[idx] = this.tokenReplace(n, {orgId: orgId, agId: this.agId, nodeId: this.nodeId, service: this.service})
      })
      // switch(this.selectedCall) {
      //   case 'getNode':
      //     contentNode = this.tokenReplace(JsonSchema[this.selectedCall].contentNode, {orgId: orgId, nodeId: this.nodeId})
      //     break;
      //   case 'getOrg':
      //     contentNode = this.tokenReplace(JsonSchema[this.selectedCall].contentNode, {orgId: orgId, nodeId: this.nodeId})
      //     break;
      //   case 'getNodeAgreement':
      //     contentNode = this.tokenReplace(JsonSchema[this.selectedCall].contentNode, {agId: this.agId})
      //     break;
      //   default:
      //     contentNode = this.tokenReplace(JsonSchema[this.selectedCall].contentNode, {orgId: orgId, nodeId: this.nodeId})
      // }
      return nodePath.reduce((a, b) => a[b], json)
    } else {
      return json;
    }
  }
  promptDialog(title: string, type: string, options: any = {}) {
    // this.openDialog({title: `What is the name of the new folder?`, type: 'folder', placeholder: 'Folder name'}, (resp: { name: string; }) => {
    return new Promise((resolve, reject) => {
      this.openDialog({title: title, type: type, options: options}, (resp: any) => {
        console.log(resp);
        resolve(resp);
      });
    })
  }
  openDialog(payload: { title: string; type: string; options: any; }, cb: { (resp: any): void; (resp: any): void; (resp: any): void; (arg0: any): void; }): void {
    this.dialogRef = this.dialog.open(DialogComponent, {
      hasBackdrop: false,
      width: '350px',
      height: '250px',
      data: payload
    });

    this.dialogRef.afterClosed().subscribe((result: any) => {
      cb(result);
      this.dialog.closeAll();
    });
  }
  shouldLoadConfig(toPage = {toEditor: false}) {
    return new Promise(async (resolve, reject) => {
      let editJson= this.getEditorStorage('hznConfig')
      if(!editJson || Object.keys(editJson.content).length == 0) {
        const answer:any = await this.promptDialog('Would you like to load config file?', '', {okButton: 'Yes', cancelButton: 'No'})
        if(answer) {
          // payload indicates we are in editor route
          this.broadcast({type: Enum.TRIGGER_LOAD_CONFIG, payload: toPage});
        }
        resolve(editJson);
      } else {
        resolve(editJson);
      }
    })
  }
  getCurrentFilename() {
    return this.editingConfig ? this.configFilename : this.currentFilename;
  }
  getOrg(org = this.selectedOrg): IHznConfig {
    return this.configJson[org]
  }
  callExchange(endpoint: string, exchange: IExchange, payload: any = {}, orgId = this.selectedOrg) {
    const credential = this.configJson[orgId]['credential']
    const b64 = exchange.role == Role.hubAdmin
      ? btoa(`${credential[exchange.role]}`)
      : btoa(`${orgId}/${credential['HZN_EXCHANGE_USER_AUTH']}`)
    let url = ''
    let callThis = ''
    let body: any;
    if(exchange.callHzn) {
      callThis = this.method[exchange.path]
      body = {
        service: {
          json: payload,
          credentials: this.configJson[orgId]['envVars']['SERVICE_CONTAINER_CREDS'],
          org: this.orgId.length > 0 ? this.orgId : orgId,
          userPw: credential['HZN_EXCHANGE_USER_AUTH']
        }
      }
    } else {
      url = exchange.type == 'css' ? credential['HZN_FSS_CSSURL'].replace(/\/+$/, '') : credential['HZN_EXCHANGE_URL']
      callThis = `${url}/${endpoint}`
      body = payload
    }
    let headerOptions: any = {};
    Object.keys(HeaderOptions).forEach((key) => {
      headerOptions[key] = HeaderOptions[key]
    })
    headerOptions['Authorization'] = `Basic ${b64}`;
    if(!exchange.method) {
      exchange.method = 'GET'
    }
    let header = new HttpHeaders ()
    header = header.append('Authorization', `Basic ${b64}`)
    if(exchange.contentType) {
      header = header.append('Content-Type', exchange.contentType);
      body = body.text;
    } else {
      header = header.append('Content-Type', 'application/json');
    }
    switch(exchange.method) {
      case 'GET':
      default:
        return this.get(callThis, {headers: header})
        break;
      case 'POST':
        // header = header.append('Access-Control-Allow-Credentials', 'true')
        // header = header.append('Access-Control-Allow-Origin', '*')
        // header = header.append('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        // header = header.append('Content-Type', 'application/json');
        header = header.append('Accept', 'application/json');
        return this.http.post(callThis, body, {headers: header})
        break;
      case 'PUT':
        return this.http.put(callThis, body, {headers: header})
        break;
      case 'PATCH':
        return this.http.patch(callThis, body, {headers: header})
        break;
      case 'DELETE':
          return this.http.delete(callThis, {headers: header})
          break;
      }
    return this.get(callThis, {headers: header})
  }
  addEditorStorage(content: any, name = this.currentWorkingFile, key = this.currentWorkingFile) {
    this.editorStorage[key] = {content: content, name: name}
    if(!this.editorStorage['original']) {
      this.editorStorage['original'] = {}
    }
    this.editorStorage['original'][key] = {content: content, name: name}
  }
  getEditorStorage(key: string = this.currentWorkingFile): IEditorStorage {
    return this.editorStorage[key]
  }
  getContent(key: string = this.currentWorkingFile): IEditorStorage {
    return this.editorStorage[key] ? this.editorStorage[key].content : {}
  }
  hasContent() {
    return Object.keys(this.getContent()).length > 0
  }
  getOriginalContent(key: string = this.currentWorkingFile): IEditorStorage {
    return this.editorStorage['original'][key] ? this.editorStorage['original'][key].content : {}
  }
  updateEditorStorage(json: IEditorStorage, key = this.currentWorkingFile) {
    this.editorStorage[key] = json;
  }
  getExchange(type = ''): IOption[] {
    let exchange: IOption[] = [];
    Object.keys(Exchange).forEach((key) => {
      if(type.length > 0) {
        if(!Exchange[key].type || Exchange[key].run || (Exchange[type] && Exchange[key].type == Exchange[type].type) || this.checkType(type, Exchange[key].type)) {
          exchange.push({name: Exchange[key].name, id: key})
        }
      }
      else {
        exchange.push({name: Exchange[key].name, id: key})
      }
    })
    return exchange;
  }
  checkType(type: string, filter: string) {
    return (new RegExp(`^${filter}$`)).exec(type)
  }
  getLoader(): IOption[] {
    let loaders: IOption[] = [];
    Object.keys(Loader).forEach((key) => {
      loaders.push({name: Loader[key].name, id: key})
    })
    return loaders;
  }
  optionFilter(name: string, loaders: IOption[]): IOption[] {
    const filterValue = name.toLowerCase();
    return loaders.filter(option => option.name.toLowerCase().includes(filterValue));
  }
  optionDisplayFn(option: IOption): string {
    return option && option.name ? option.name : '';
  }
  onOptionChange(evt: any) {
    if(evt.isUserInput) {
      this.currentWorkingFile = evt.source.value.id
    }
  }
  setModify(status: boolean, key = this.currentWorkingFile) {
    this.isJsonModified = status;
    this.editorStorage[key].modified = status;
  }
  isModified(key = this.currentWorkingFile): boolean {
    return this.editorStorage[key] && this.editorStorage[key].modified
  }
  setTitleText(key = this.currentWorkingFile) {
    this.titleText = this.editorStorage[key] ? this.editorStorage[key].filename ? this.editorStorage[key].filename : key : 'IEAM'
  }
  setArch(arch: string, org = this.getOrg()) {
    if(org) {
      org.metaVars.ARCH = arch;
    }
  }
  getServiceName(content: IService, path: string,  org = this.getOrg()) {
    let serviceName = path
    if(org && content && Object.keys(content).length > 0 && content.url) {
      serviceName = `${content.url}_${content.version}_${content.arch}`;
    }
    return serviceName;
  }
  hasServiceName(content: IService) {
    return content && content.url && content.version && content.arch;
  }
  getPropFromJson(json: any, prop: string) {
    return prop in json
    ? json[prop]
    : Object.values(json).reduce((val, obj) => {
        if (val !== undefined) return val;
        if (typeof obj === 'object') return this.getPropFromJson(obj, prop);
      }, undefined);
  }
  getPropValueFromJson(json: any, prop: string, value: string) {
    return json[prop] && json[prop] == value
    ? json[prop]
    : Object.values(json).reduce((val, obj) => {
        if (val !== undefined && val == value) return val;
        if (typeof obj === 'object') return this.getPropValueFromJson(obj, prop, value);
      }, undefined);
  }
  getParentFromJson(json: any, prop: string, value: string) {
    return json[prop] && json[prop] == value
    ? json
    : Object.values(json).reduce((val, obj) => {
        if (val !== undefined && this.getPropValueFromJson(val, prop, value) == value) return val;
        if (typeof obj === 'object') return this.getParentFromJson(obj, prop, value);
      }, undefined);
  }
  setPropValueFromJson(json: any, prop: string, value: string, newValue: string) {
    return json[prop] && json[prop] == value
    ? json
    : Object.values(json).reduce((val: any, obj) => {
        if (val !== undefined && this.getPropValueFromJson(val, prop, value) == value) {
          val.value = newValue
          return val;
        }
        if (typeof obj === 'object') return this.setPropValueFromJson(obj, prop, value, newValue);
      }, undefined);
  }
  getNodeLevel(json: any, prop: string) {
    return prop in json
    ? json[prop]
    :Object.values(json).reduce((val, obj:any, idx) => { console.log(idx, val, obj, prop)
        if(typeof obj === 'object' && obj[prop]) {
          if(this.nodeLevel < 0) this.nodeLevel = idx;
          return idx}
        else if (typeof obj === 'object') return this.getNodeLevel(obj, prop);
      }, undefined);
  }
  sha256(text: string) {
    return shajs('sha256').update(text).digest('hex')
  }
  populateJson(input, output) {
    Object.keys(output).forEach((key) => {
      output[key] = JsonKeyMap[key] ? input[JsonKeyMap[key].mapTo] : input[key]
    })
    return output
  }
  setActiveExchangeFile(json: any) {
    return new Observable((observer) => {
      if(json && Object.keys(json).length > 0) {
        let schema = JsonSchema[this.selectedCall]
        if(schema && schema.file && schema.file.length > 0) {
          this.get(schema.file)
          .subscribe((res) => {
            this.currentWorkingFile = this.selectedCall
            json = this.populateJson(json, res)
            this.addEditorStorage(json)
            observer.next()
            observer.complete()
          })
        } else {
          this.currentWorkingFile = this.selectedCall
          this.addEditorStorage(json)
          observer.next()
          observer.complete()
        }
      } else {
        observer.next()
        observer.complete()
      }
    })
  }
  mapTo(type = this.selectedLoader) {
    let actionMap = ActionMap[type]
    if(actionMap) {
      let json = this.getContent()
      this.addEditorStorage(json, actionMap.mapTo, actionMap.mapTo)
      this.selectedCall = this.currentWorkingFile = actionMap.mapTo
    }
  }
  getKeyFromValue(json: any, obj: any) {
    let key = ''
    Object.keys(json).some((val, obj, idx) => {
        key = val;
        return this.deepEqual(json[val], obj)
    })
    return key
  }
  deepEqual(x, y) {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
      ok(x).length === ok(y).length &&
        ok(x).every(key => this.deepEqual(x[key], y[key]))
    ) : (x === y);
  }
}
