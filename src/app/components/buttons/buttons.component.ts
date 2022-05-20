import { Component, OnInit } from '@angular/core';
import { Enum } from 'src/app/models/ieam-model';
import { IeamService, Broadcast } from '../../services/ieam.service';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css']
})
export class ButtonsComponent implements OnInit {
  noBucket = true;
  noneSelected = true;
  notEditor = true;
  isJsonModified = false;

  constructor(
    public ieamService: IeamService
  ) { }

  ngOnInit() {
    this.ieamService.broadcastAgent.subscribe((msg: Broadcast) => {
      switch (msg.type) {
        case Enum.NO_BUCKET:
          this.noBucket = msg.payload;
          break;
        case Enum.NONE_SELECTED:
          this.noneSelected = msg.payload;
          break;
        case Enum.NOT_EDITOR:
          this.notEditor = msg.payload;
          this.noBucket = true;
          this.noneSelected = true;
          break;
        case Enum.JSON_MODIFIED:
          this.isJsonModified = msg.payload;
          break;
        case Enum.NETWORK:
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

  save() {
    this.broadcast('save')
  }
}
