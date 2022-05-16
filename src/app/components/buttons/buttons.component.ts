import { Component, OnInit } from '@angular/core';
import { IeamService, Broadcast } from '../../services/ieam.service';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css']
})
export class ButtonsComponent implements OnInit {
  noBucket = true;
  noneSelected = true;

  constructor(
    public ieamService: IeamService
  ) { }

  ngOnInit() {
    this.ieamService.broadcastAgent.subscribe((msg: Broadcast) => {
      switch (msg.type) {
        case 'noBucket':
          this.noBucket = msg.payload;
          break;
        case 'noneSelected':
          this.noneSelected = msg.payload;
          break;
        case 'network':
          this.ieamService.offline = msg.payload;
          break;
        }
    });
  }

  broadcast(type: string, payload?: any) {
    this.ieamService.broadcast({
      type: type,
      payload: payload
    });
  }

  delete() {
    console.log('none');
    this.broadcast('delete');
  }

  changeAccess(access) {
    this.broadcast('changeAccess', access);
  }

  upload(event) {
    this.broadcast('upload', event);
  }

  folder() {
    this.broadcast('folder');
  }

  jumpTo() {
    this.broadcast('jumpTo');
  }
}
