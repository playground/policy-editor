import { Injectable, EventEmitter, Output, HostListener, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Params } from '../interface/params';
import { ISession } from '../interface/session';
import { Enum, Navigate, EnumClass } from '../models/ieam-model';

const backendUrl = isDevMode() ? 'https://ieam-action-prod.fux62nioj9a.us-south.codeengine.appdomain.cloud' : 'https://ieam-action-prod.fux62nioj9a.us-south.codeengine.appdomain.cloud'

export const method = {
  list: `${backendUrl}?action=list`,
  mkdir: `${backendUrl}`,
  upload: `${backendUrl}/upload`,
  session: `${backendUrl}?action=session`,
  sigUrl: `${backendUrl}?action=get_signed_url`,
  signature: `${backendUrl}?action=signature`,
  post: 'post'
};

export interface Broadcast {
  type: string | Enum;
  payload?: any;
}
@Injectable({
  providedIn: 'root'
})
export class IeamService {
  @Output() broadcastAgent = new EventEmitter<Broadcast>();
  selectedRow!: { directory: any; type?: any; } | null;
  fileType!: EnumClass;
  offline = false;
  session!: string;
  loggedIn: boolean = false;
  welcome: string = ''
  loginSession: any;
  sessionExpiry = 1800000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    (window as any).ethereum.on('accountsChanged', () => {
      console.log('lock')
      this.loggedIn = false;
      this.broadcast({type: Enum.LOGGED_OUT})
    })
    this.fileType = new EnumClass(['DIRECTORY', 'FILE']);
    this.signIn()
  }

  broadcast(data: any) {
    this.broadcastAgent.emit(data);
  }

  get(url: string) {
    return this.http.get<Params>(url);
  }

  post(url: string, body: any, options = {}) {
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
  fetchCors(path: string) {
    return new Observable((observer: any) => {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
      // @ts-ignore
      fetch(`${backendUrl}/${path}`, requestOptions)
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

  setSession(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  getSession(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  removeSession(key: string) {
    sessionStorage.removeItem(key);
  }

  getSignedUrl(filename: string, bucket: string, expires = 60) {
    let url = `${method.sigUrl}&filename=${filename}&expires=${expires}&bucket=${bucket}`;
    return this.get(url)
    // 'https://ieam-action-prod.fux62nioj9a.us-south.codeengine.appdomain.cloud/?action=get_signed_url&filename=20160414_112151.jpg&expires=60&bucket=ieam-labs'
  }
  getUserSession() {
    if(this.session) {
      return of(this.session)
    } else {
      return this.get(method.session)
    }
  }
  mkdir() {

  }
  logOut() {
    this.removeSession('loggedIn')
    // TODO, should logout of Metamask too?
  }
  logIn() {
    this.get(method.session)
    .subscribe({
      next: (sessionId: any) => {
        this.connectMetamask()
        .subscribe({
          next: (addr: any) => {
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
        observer.error(err.message)
      }).catch((err: any) => {
        console.log(err)
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
        const sigUrl = `&sig=${encodeURIComponent(walletResp)}&addr=${encodeURIComponent(addr)}&sessionId=${encodeURIComponent(sessionId)}`
        this.get(`${method.signature}${sigUrl}`)
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
  isLoggedIn2() {
    return new Observable((observer: any) => {
      let session: any = this.getSession('loggedIn');
      if(session) {
        session = JSON.parse(session);

        let url = `?action=validate_session&sessionId=${encodeURIComponent(session.sessionId)}`
        this.get(`${backendUrl}${url}`)
        .subscribe({
          next: (res: any) => {
            observer.next(res)
            observer.complete()
          }, error: (err) => observer.error(err)
        })
      } else {
        observer.next({validate: false})
        observer.complete()
      }
    })
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
}
