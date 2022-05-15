import { Injectable, EventEmitter, Output, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

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
  }}
