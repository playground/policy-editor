import { Injectable, EventEmitter, Output, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Params } from '../interface/params';

export interface Broadcast {
  type: string;
  payload?: any;
}
@Injectable({
  providedIn: 'root'
})
export class IeamService {
  @Output() broadcastAgent = new EventEmitter<Broadcast>();

  constructor(
    private http: HttpClient
  ) {
  }

  broadcast(data: any) {
    this.broadcastAgent.emit(data);
  }

  get(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url);
        resolve(await response.json());
      } catch (e) {
        resolve(null);
      }
    });
  }

  post(url: string, data: any) {
    return this.http.post<Params>(url, data);
  }
}
