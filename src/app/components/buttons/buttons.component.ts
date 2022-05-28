import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd} from '@angular/router';
import { filter } from 'rxjs';
import { Enum, Organization } from 'src/app/models/ieam-model';
import { IeamService, Broadcast } from '../../services/ieam.service';

declare const window: any;

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css']
})
export class ButtonsComponent implements OnInit, OnDestroy {
  noBucket = true;
  noneSelected = true;
  notEditor = true;
  isJsonModified = false;
  selectedOrg: string;
  orgs: Organization[];
  routerObserver: any;

  constructor(
    private router: Router,
    public ieamService: IeamService
  ) { }

  ngOnInit() {
    this.routerObserver = this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      if(this.router.routerState.snapshot.url.indexOf('/editor') == 0) {
        this.notEditor = false;
        this.noBucket = true;
        this.noneSelected = true;
      } else if(this.router.routerState.snapshot.url.indexOf('/bucket') == 0) {
        this.notEditor = true;
        this.noBucket = false;
        this.noneSelected = true;
      }
    })

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
          // this.noBucket = true;
          // this.noneSelected = true;
          break;
        case Enum.JSON_MODIFIED:
          this.isJsonModified = msg.payload;
          break;
        case Enum.NETWORK:
          this.ieamService.offline = msg.payload;
          break;
        case Enum.CONFIG_LOADED:
          this.populateOrgs()
          break;
        case Enum.TRIGGER_LOAD_CONFIG:
          this.loadConfig(msg.payload)
          break;
        }
    });
  }

  ngOnDestroy() {
    this.routerObserver.unsubscribe();
  }

  populateOrgs() {
    this.orgs = [];
    Object.keys(this.ieamService.configJson).forEach((key) => {
      this.orgs.push({name: key, id: key})
    })
  }

  broadcast(type: any, payload?: any) {
    this.ieamService.broadcast({
      type: type,
      payload: payload
    });
  }

  delete() {
    console.log('none');
    this.broadcast(Enum.DELETE);
  }

  changeAccess(access) {
    this.broadcast(Enum.CHANGE_ACCESS, access);
  }

  loadPolicy(payload: any = {}) {
    this.ieamService.showOpenFilePicker()
    .subscribe({
      next: (fhandle: any) => {
        payload.fhandle = fhandle;
        this.broadcast(Enum.LOAD_POLICY, payload);
      }
    })
  }

  loadRemotePolicy() {
    this.broadcast(Enum.REMOTE_POLICY);
  }

  upload(event) {
    this.broadcast(Enum.UPLOAD, event);
  }

  loadConfig(payload:any = {}) {
    this.ieamService.showOpenFilePicker()
    .subscribe({
      next: (fhandle: any) => {
        payload.fhandle = fhandle;
        this.broadcast(Enum.LOAD_CONFIG, payload);
      }
    })
  }

  folder() {
    this.broadcast(Enum.FOLDER);
  }

  jumpTo() {
    this.broadcast(Enum.JUMP_TO);
  }

  save() {
    this.broadcast(Enum.SAVE)
  }

  shouldDisenable() {
    return !this.isJsonModified || this.ieamService.editingConfig
  }

  onChange(evt: any) {
    if(evt.isUserInput) {
      console.log(evt.source.value)
      this.broadcast(Enum.ORG_SELECTED, evt.source.value);
    }
  }

  hasConfig() {
    return Object.keys(this.ieamService.configJson).length > 0 && !this.ieamService.editingConfig
  }
}
