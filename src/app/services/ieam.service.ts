import { Injectable, EventEmitter, Output, HostListener, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Params } from '../interface/params';
import { ISession } from '../interface/session';
import { Enum } from '../models/ieam-model';

const backendUrl = isDevMode() ? 'https://ieam-action-prod.fux62nioj9a.us-south.codeengine.appdomain.cloud' : 'https://ieam-action-prod.fux62nioj9a.us-south.codeengine.appdomain.cloud'

export interface Broadcast {
  type: string;
  payload?: any;
}
@Injectable({
  providedIn: 'root'
})
export class IeamService {
  @Output() broadcastAgent = new EventEmitter<Broadcast>();
  selectedRow!: { directory: any; type?: any; } | null;
  fileType!: { enum: { DIRECTORY: any; }; };
  offline = false;
  session!: string;
  loggedIn: boolean = false;
  welcome: string = ''

  constructor(
    private http: HttpClient
  ) {
    (window as any).ethereum.on('accountsChanged', () => {
      console.log('lock')
      this.loggedIn = false;
      this.broadcast({type: Enum.LOGGED_OUT})
    })
  }

  broadcast(data: any) {
    this.broadcastAgent.emit(data);
  }

  get(url: string) {
    return this.http.get<Params>(url);
  }

  post(url: string, data: any) {
    return this.http.post<Params>(url, data);
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

  getUserSession() {
    if(this.session) {
      return of(this.session)
    } else {
      return this.get(`${backendUrl}?action=session`)
    }
  }

  logIn() {
    this.get(`${backendUrl}?action=session`)
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
        const sigUrl = `?action=signature&sig=${encodeURIComponent(walletResp)}&addr=${encodeURIComponent(addr)}&sessionId=${encodeURIComponent(sessionId)}`
        this.get(`${backendUrl}${sigUrl}`)
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
    return this.loggedIn;
  }
}
