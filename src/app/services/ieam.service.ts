import { Injectable, EventEmitter, Output, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Params } from '../interface/params';
import { ISession } from '../interface/session';

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

  constructor(
    private http: HttpClient
  ) {
  }

  broadcast(data: any) {
    this.broadcastAgent.emit(data);
  }

  get(url) {
    return this.http.get<Params>(url);
    // return new Promise(async (resolve, reject) => {
    //   try {
    //     const response = await fetch(url);
    //     resolve(await response.json());
    //   } catch (e) {
    //     resolve(null);
    //   }
    // });
  }

  post(url: string, data: any) {
    return this.http.post<Params>(url, data);
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

}
