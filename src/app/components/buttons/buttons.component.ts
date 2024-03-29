import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { FormControl } from '@angular/forms';
import { filter, Observable, map, startWith } from 'rxjs';
import { Enum, Organization, Exchange, IOption, Loader, Navigate, ActionMap } from 'src/app/models/ieam-model';
import { IeamService, Broadcast } from '../../services/ieam.service';

declare const window: any;

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css']
})
export class ButtonsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('autoExchange')
  exchangeInput: ElementRef;
  noBucket = true;
  noneSelected = true;
  notEditor = true;
  notExchange = true;
  isJsonModified = false;
  orgs: Organization[] = [];
  routerObserver: any;
  routeObserver: any;
  loaders: IOption[] = [];
  exchangeCalls: IOption[] = [];
  psAgent!: { unsubscribe: () => void; };
  loaderControl = new FormControl('');
  filteredOptions: Observable<IOption[]>;
  exchangeControl = new FormControl('');
  filterExchangeOptions: Observable<IOption[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public ieamService: IeamService,
    private changeDetector: ChangeDetectorRef
  ) { }

  setExchangeOptions() {
    this.exchangeCalls.sort((a,b) => a.name.localeCompare(b.name))
    this.filterExchangeOptions = this.exchangeControl.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value?.id)),
      map(name => (name ? this.ieamService.optionFilter(name, this.exchangeCalls) : this.exchangeCalls.slice()))
    )
  }
  ngOnInit() {
    this.exchangeCalls = this.ieamService.getExchange()
    this.loaders = this.ieamService.getLoader();
    this.loaders.sort((a,b) => a.name.localeCompare(b.name))

    this.filteredOptions = this.loaderControl.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value?.id)),
      map(name => (name ? this.ieamService.optionFilter(name, this.loaders) : this.loaders.slice()))
    )
    this.setExchangeOptions()

    this.routeObserver = this.route.data.subscribe((data) => {
    })

    this.routerObserver = this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.notEditor = true;
      this.noBucket = true;
      this.noneSelected = true;
      this.notExchange = true;
      this.ieamService.signIn()
      this.populateOrgs()
      if(this.router.routerState.snapshot.url.indexOf('/editor') == 0) {
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
        case Enum.NAVIGATE:
        case Enum.LOGGED_IN:
        case Enum.CONFIG_LOADED:
          this.populateOrgs()
          break;
        case Enum.TRIGGER_LOAD_CONFIG:
          this.loadConfig(msg.payload)
          break;
        case Enum.SET_EXCHANGE_CALL:
          this.populateOrgs()
          this.setValue()
          break;
        }
    });
  }

  ngOnDestroy() {
    if (this.psAgent) {
      this.psAgent.unsubscribe();
    }
    this.routerObserver.unsubscribe();
    this.routeObserver.unsubscribe();
  }

  ngAfterViewInit(): void {
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

  loadRemotePolicy() {
    this.loadPolicy(Enum.REMOTE_POLICY);
  }
  loadLocalPolicy() {
    this.loadPolicy(Enum.LOAD_POLICY)
  }
  loadTemplatePoicy() {
    this.loadPolicy(Enum.LOAD_TEMPLATE_POLICY)
  }
  loadPolicy(type: Enum, payload: any = {}) {
    let json = this.ieamService.getEditorStorage();
    if(this.ieamService.isModified()) {
      this.ieamService.promptDialog('Would you like to save your changes?', '', {okButton: 'Yes', cancelButton: 'No'})
      .then((answer) => {
        this.ieamService.setModify(false);
        if(answer) {
          // save file
          this.save()
        } else {
          this.doThis(type, payload)
        }
      })
    } else if(json && Object.keys(json.content).length > 0) {
      this.loadNewFile('Would you like to load a new file?', type, payload, this.ieamService.selectedLoader === 'localPolicy' ? Enum.LOAD_EXISTING_POLICY : Enum.LOAD_TEMPLATE_POLICY)
    } else {
      this.doThis(type, payload)
    }
  }

  private doThis(type: Enum, payload: any) {
    if(type === Enum.LOAD_TEMPLATE_POLICY) {
      this.broadcast(type, payload);
    } else {
      this.ieamService.promptDialog('What type of file?', 'loader', {loaders: this.ieamService.getLoader()})
      .then((answer: any) => {
        if(answer) {
          this.ieamService.openFilePicker(payload, type)
        }
      })
    }
  }
  loadNewFile(prompt: string, type: Enum, payload: any, broadcastType: Enum) {
    this.ieamService.promptDialog(prompt, '', {okButton: 'Yes', cancelButton: 'No'})
    .then((answer) => {
      if(answer) {
        this.doThis(type, payload)
        // this.ieamService.promptDialog('What type of file?', 'loader')
        // .then((answer: any) => {
        //   if(answer) {
        //     this.ieamService.openFilePicker(payload, type)
        //   }
        // })
      } else {
        this.broadcast(broadcastType, payload);
      }
    })
  }

  upload(event) {
    this.broadcast(Enum.UPLOAD, event);
  }

  loadConfig(payload:any = {}) {
    let json = this.ieamService.getEditorStorage('hznConfig');
    if(!json) {
      this.ieamService.loadConfig()
      .subscribe(() => {
        this.ieamService.broadcast({type: Enum.NAVIGATE, to: Navigate.editor, payload: Enum.CONFIG_LOADED})
      })
    } else {
      this.ieamService.broadcast({type: Enum.NAVIGATE, to: Navigate.editor, payload: Enum.CONFIG_LOADED})
    }
  }
  loadConfig2(payload:any = {}) {
    let json = this.ieamService.getEditorStorage('hznConfig');
    if(this.ieamService.isJsonModified) {
      this.ieamService.promptDialog('Would you like to discard your changes?', '', {okButton: 'Yes', cancelButton: 'No'})
      .then((answer) => {
        if(answer) {
          this.ieamService.openFilePicker(payload, Enum.LOAD_CONFIG)
        }
      })
    } else if(json && Object.keys(json).length > 0) {
      this.loadNewFile('Would you like to load a new config file?', Enum.LOAD_CONFIG, payload, Enum.LOAD_EXISTING_CONFIG)
    } else {
      this.ieamService.openFilePicker(payload, Enum.LOAD_CONFIG)
    }
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
    this.exchangeCalls = this.ieamService.getExchange(this.ieamService.selectedCall)
    this.setExchangeOptions()
    this.ieamService.broadcast({type: Enum.NAVIGATE, to: Navigate.exchange})
  }

  shouldDisenable() {
    return !this.ieamService.isModified()
  }

  shouldNotPublish() {
    return this.ieamService.selectedOrg.length == 0 || Object.keys(this.ieamService.configJson).length == 0
  }

  shouldNotRun() {
    // const match = this.ieamService.selectedCall && (new RegExp(`^${Exchange[this.ieamService.selectedCall].type}$`)).exec(this.ieamService.selectedLoader)
    // const run = this.ieamService.selectedCall && Exchange[this.ieamService.selectedCall].run
    return (this.ieamService.selectedCall.length == 0 || this.ieamService.selectedOrg.length == 0 || Object.keys(this.ieamService.configJson).length == 0 || (!this.ieamService.editorStorage[this.ieamService.selectedCall] && Exchange[this.ieamService.selectedCall].run != true))
  }

  shouldNotEdit() {
    return !this.ieamService.selectedOrg.length || (Object.keys(this.ieamService.getContent()).length == 0 || !this.ieamService.editable)
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
      this.ieamService.selectedCall = evt.source.value.id ? evt.source.value.id : evt.source.value
      this.ieamService.currentWorkingFile = this.ieamService.selectedCall
      if(Exchange[this.ieamService.selectedCall].template) {
        this.broadcast(Enum.EXCHANGE_SELECTED, Exchange[this.ieamService.selectedCall]);
      } else {
        this.ieamService.shouldLoadConfig().then(() => {
          this.broadcast(Enum.EXCHANGE_SELECTED, Exchange[this.ieamService.selectedCall]);
        })
      }
    }
  }

  onOptionChange(evt: any) {
    if(evt.isUserInput) {
      this.ieamService.onOptionChange(evt);
      const id = this.ieamService.selectedLoader = evt.source.value.id;
      if(Loader[id].template) {
        this.loadTemplatePoicy()
      } else if(id === 'hznConfig') {
        this.loadConfig()
      } else if(id === 'localPolicy') {
        this.loadLocalPolicy()
      } else if(id === 'remotePolicy') {
        this.loadRemotePolicy()
      }
    }
  }
  hasConfig() {
    return Object.keys(this.ieamService.configJson).length > 0 && !this.ieamService.editingConfig
  }

  isEditor() {
    return !(location.pathname.indexOf('/editor') == 0)
  }

  isExchange() {
    return location.pathname.indexOf('/exchange') == 0
  }

  isBucket() {
    return !(location.pathname.indexOf('/bucket') == 0)
  }

  run() {
    if(this.ieamService.isLoggedIn()) {
      this.broadcast(Enum.EXCHANGE_CALL, this.ieamService.selectedCall);
    }
  }

  edit() {
    if(this.ieamService.isLoggedIn()) {
      this.ieamService.mapTo(this.ieamService.selectedCall)
      // let actionMap = ActionMap[this.ieamService.selectedCall]
      // if(actionMap) {
      //   let json = this.ieamService.getContent()
      //   this.ieamService.addEditorStorage(json, actionMap.mapTo, actionMap.mapTo)
      //   this.ieamService.selectedCall = this.ieamService.currentWorkingFile = actionMap.mapTo
      // }
      this.ieamService.broadcast({type: Enum.NAVIGATE, to: Navigate.editor, payload: Enum.EDIT_EXCHANGE_FILE})
    }
  }

  refresh() {
    // this.ieamService.selectedCall = this.ieamService.selectedLoader = ''
    this.exchangeCalls = this.ieamService.getExchange()
    this.setExchangeOptions()
    this.ieamService.resetToOriginal()
    this.broadcast(Enum.EXCHANGE_CALL_REFRESH, this.ieamService.selectedCall);
  }
  help() {
    let msg = this.ieamService.selectedCall ? Exchange[this.ieamService.selectedCall].description :
      'Select a task you would like to perform'
    if(!msg || msg.length == 0) {
      msg = 'Info not available!'
    }
    this.ieamService.showMessage(msg);
  }
  setValue() {
    const exchange = Exchange[this.ieamService.selectedCall]
    if(exchange) {
      this.changeDetector.detectChanges()
      this.exchangeControl.setValue({name: Exchange[this.ieamService.selectedCall].name, id: this.ieamService.selectedCall})
      this.changeDetector.detectChanges()
    }
  }
}
