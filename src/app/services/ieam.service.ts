import { Injectable, EventEmitter, Output, HostListener, isDevMode } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { Params } from '../interface/params';
import { ISession } from '../interface/session';
import { Enum, Navigate, EnumClass, HeaderOptions, IExchange, IEditorStorage } from '../models/ieam-model';
import { ObserversModule } from '@angular/cdk/observers';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '../components/dialog/dialog.component';

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
  editorStorage: IEditorStorage;
  configJson: any = {};
  editingConfig = false;
  dialogRef?: MatDialogRef<DialogComponent, any>;
  selectedOrg: string = '';
  selectedCall: string = '';
  currentFilename = '';
  configFilename = '';
  isJsonModified = false;
  method: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    const backendUrl = isDevMode() ? 'http://localhost:3000' : '';
    this.method = {
      list: `${backendUrl}/list`,
      mkdir: `${backendUrl}`,
      upload: `${backendUrl}/upload`,
      session: `${backendUrl}/session`,
      sigUrl: `${backendUrl}/get_signed_url`,
      signature: `${backendUrl}/signature`,
      delete: `${backendUrl}/delete`,
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
            this.broadcast({type: Enum.CONFIG_LOADED, payload: payload});
          } else if(type == Enum.LOAD_POLICY) {
            this.currentFilename = key
            this.editorStorage = {json: JSON.parse(res[key]), filename: key};
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
  getCurrentFilename() {
    return this.editingConfig ? this.configFilename : this.currentFilename;
  }
  callExchange(endpoint: string, exchange: IExchange) {
    const credential = this.configJson[this.selectedOrg]['credential']
    const b64 = btoa(`${this.selectedOrg}/${credential['HZN_EXCHANGE_USER_AUTH']}`)
    const url = credential['HZN_EXCHANGE_URL']
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
    switch(exchange.method) {
      case 'GET':
      default:
        return this.get(`${url}/${endpoint}`, {headers: header})
        break;
      case 'POST':
        return this.http.post(`${url}/${endpoint}`, {headers: header})
        break;
    }
    // header = header.append('Access-Control-Allow-Credentials', 'true')
    // header = header.append('Access-Control-Allow-Origin', '*')
    // header = header.append('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    return this.get(`${url}/${endpoint}`, {headers: header})
  }
}
