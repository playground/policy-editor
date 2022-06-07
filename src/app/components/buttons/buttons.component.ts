import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { filter } from 'rxjs';
import { Enum, Organization, Exchange, Option } from 'src/app/models/ieam-model';
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
  notExchange = true;
  isJsonModified = false;
  orgs: Organization[] = [];
  routerObserver: any;
  exchangeCalls: Option[] = [];
  psAgent!: { unsubscribe: () => void; };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public ieamService: IeamService
  ) { }

  ngOnInit() {
    Object.keys(Exchange).forEach((key) => {
      this.exchangeCalls.push({name: Exchange[key].name, id: key})
    })

    this.route.data.subscribe((data) => {
      if('/editor' == this.router.routerState.snapshot.url) {
        this.populateOrgs()
      }
    })

    this.routerObserver = this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.notEditor = true;
      this.noBucket = true;
      this.noneSelected = true;
      this.notExchange = true;
      this.ieamService.signIn()
      if(this.router.routerState.snapshot.url.indexOf('/editor') == 0) {
        this.populateOrgs()
        this.notEditor = false;
      } else if(this.router.routerState.snapshot.url.indexOf('/bucket') == 0) {
        this.noBucket = false;
      } else if(this.router.routerState.snapshot.url.indexOf('/exchange') == 0) {
        this.notExchange = false;
      }
    })

    this.psAgent = this.ieamService.broadcastAgent.subscribe((msg: Broadcast) => {
      switch (msg.type) {
        case Enum.NO_BUCKET:
          this.noBucket = msg.payload;
          break;
        case Enum.NONE_SELECTED:
          this.noneSelected = msg.payload;
          break;
        case Enum.NOT_EDITOR:
          this.notEditor = msg.payload;
          break;
        case Enum.NOT_EXCHANGE:
          this.notExchange = msg.payload;
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
    if (this.psAgent) {
      this.psAgent.unsubscribe();
    }
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
    if(this.ieamService.isJsonModified) {
      this.ieamService.promptDialog('Would you like to discard your changes?', '', {okButton: 'Yes', cancelButton: 'No'})
      .then((answer) => {
        if(answer) {
          this.openFilePicker(payload, Enum.LOAD_POLICY)
        }
      })
    } else if(this.ieamService.editorStorage && Object.keys(this.ieamService.editorStorage.json).length > 0) {
      this.loadNewFile('Would you like to load a new file?', Enum.LOAD_POLICY, payload, Enum.LOAD_EXISTING_POLICY)
      // this.ieamService.promptDialog('Would you like to load a new file?', '', {okButton: 'Yes', cancelButton: 'No'})
      // .then((answer) => {
      //   if(answer) {
      //     this.openFilePicker(payload, Enum.LOAD_POLICY)
      //   } else {
      //     this.broadcast(Enum.LOAD_EXISTING_POLICY, payload);
      //   }
      // })
    } else {
      this.openFilePicker(payload, Enum.LOAD_POLICY)
    }
  }

  loadNewFile(prompt: string, type: Enum, payload: any, broadcastType: Enum) {
    this.ieamService.promptDialog(prompt, '', {okButton: 'Yes', cancelButton: 'No'})
    .then((answer) => {
      if(answer) {
        this.openFilePicker(payload, type)
      } else {
        this.broadcast(broadcastType, payload);
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
    if(this.ieamService.isJsonModified) {
      this.ieamService.promptDialog('Would you like to discard your changes?', '', {okButton: 'Yes', cancelButton: 'No'})
      .then((answer) => {
        if(answer) {
          this.openFilePicker(payload, Enum.LOAD_CONFIG)
        }
      })
    } else if(Object.keys(this.ieamService.configJson).length > 0) {
      this.loadNewFile('Would you like to load a new config file?', Enum.LOAD_CONFIG, payload, Enum.LOAD_EXISTING_CONFIG)
      // this.ieamService.promptDialog('Would you like to load a new config file?', '', {okButton: 'Yes', cancelButton: 'No'})
      // .then((answer) => {
      //   if(answer) {
      //     this.openFilePicker(payload, Enum.LOAD_CONFIG)
      //   } else {
      //     this.broadcast(Enum.LOAD_EXISTING_CONFIG, payload);
      //   }
      // })
    } else {
      this.openFilePicker(payload, Enum.LOAD_CONFIG)
    }
  }

  openFilePicker(payload:any = {}, type: Enum) {
    this.ieamService.showOpenFilePicker()
    .subscribe({
      next: (fhandle: any) => {
        payload.fhandle = fhandle;
        this.broadcast(type, payload);
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

  publish() {
    this.broadcast(Enum.PUBLISH)
  }

  shouldDisenable() {
    return !this.ieamService.isJsonModified  //|| this.ieamService.editingConfig
  }

  shouldNotRun() {
    return this.ieamService.selectedCall.length == 0 || this.ieamService.selectedOrg.length == 0 || Object.keys(this.ieamService.configJson).length == 0
  }

  onChange(evt: any) {
    if(evt.isUserInput) {
      console.log(evt.source.value)
      this.ieamService.selectedOrg = evt.source.value
      this.broadcast(Enum.ORG_SELECTED, this.ieamService.selectedOrg);
    }
  }

  onExchangeChange(evt: any) {
    if(evt.isUserInput) {
      console.log(evt.source.value)
      this.ieamService.selectedCall = evt.source.value
    }
  }

  hasConfig() {
    return Object.keys(this.ieamService.configJson).length > 0 && !this.ieamService.editingConfig
  }

  isEditor() {
    return !(location.pathname.indexOf('/editor') == 0)
  }

  isExchange() {
    return !(location.pathname.indexOf('/exchange') == 0)
  }

  isBucket() {
    return !(location.pathname.indexOf('/bucket') == 0)
  }

  run() {
    this.broadcast(Enum.EXCHANGE_CALL, this.ieamService.selectedCall);
  }
}
