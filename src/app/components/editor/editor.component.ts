import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { Observable, forkJoin } from  'rxjs';
import { filter } from 'rxjs/operators';
import { Enum, IEditorStorage, Navigate, Loader, JsonSchema, Exchange, JsonToken } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';
import { JsonEditorComponent, JsonEditorOptions } from '../../../../ang-jsoneditor/src/public_api';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IEnvVars } from 'src/app/interface';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editor', { static: false, read: JsonEditorComponent })
  editor: JsonEditorComponent;
  public editorOptions: JsonEditorOptions;
  public initialData: any;
  public visibleData: any;
  public showData: any;
  public data: any;
  public EditedData: any;
  psAgent!: { unsubscribe: () => void; };
  modified = false;
  routeObserver: any;
  bucketName: any;
  bucketApi: any;
  state: any;
  currentPolicy = '';
  originalJson: any;
  editJson: IEditorStorage;
  template = {}
  // {
  //   "org": "$HZN_ORG_ID",
  //   "label": "$SERVICE_NAME for $ARCH",
  //   "url": "$SERVICE_NAME",
  //   "version": "$SERVICE_VERSION",
  //   "arch": "$ARCH",
  //   "public": true,
  //   "sharable": "singleton",
  //   "requiredServices": [],
  //   "userInput": [],
  //   "deployment": {
  //     "services": {
  //       "$SERVICE_NAME": {
  //         "image": "$SERVICE_CONTAINER",
  //         "binds": [
  //           "$MMS_SHARED_VOLUME:$VOLUME_MOUNT:rw"
  //         ],
  //         "ports": [
  //           {
  //           "HostIP": "0.0.0.0",
  //           "HostPort": "3000:3000/tcp"
  //           }
  //         ],
  //         "privileged": true
  //       }
  //     }
  //   }
  // }
  dialogRef?: MatDialogRef<DialogComponent, any>;
  selectedOrg = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ieamService: IeamService,
    private dialog: MatDialog
  ) {
    this.ieamService.isLoggedIn()
    this.routeObserver = this.route.queryParams.subscribe((params: any) => {
      console.log(params)
      this.editExchangeFile(+params.type)
    })

    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view'];

    // this.initialData = {"products":[{"name":"car","product":[{"name":"honda","model":[{"id":"civic","name":"civic"},{"id":"accord","name":"accord"},{"id":"crv","name":"crv"},{"id":"pilot","name":"pilot"},{"id":"odyssey","name":"odyssey"}]}]}]}
    // this.visibleData = this.initialData;
  }

  async ngOnInit() {
    if(!this.ieamService.signIn('/editor')) {
      return
    }
    // this.editJson = this.ieamService.getEditorStorage()
    // if(this.editJson) {
    //   this.showData = this.data = this.editJson.content;
    //   this.shouldLoadConfig().then(() => '')
    // } else {
    //   this.originalJson = this.showData = this.data = this.template;
    // }

    this.psAgent = this.ieamService.broadcastAgent.subscribe(async (msg: any) => {
      this.ieamService.editingConfig = false;
      this.ieamService.setTitleText();
      switch(msg.type) {
        case Enum.SAVE:
          this.save()
          break;
        case Enum.EDIT_EXCHANGE_FILE:
          this.editExchangeFile(msg.payload)
          break;
        case Enum.LOAD_TEMPLATE_POLICY:
          this.ieamService.get(Loader[this.ieamService.currentWorkingFile].file)
          .subscribe((res) => {
            console.log(res)
            this.ieamService.addEditorStorage(res, Loader[this.ieamService.currentWorkingFile].name)
            this.editJson = this.ieamService.getEditorStorage()
            this.showData = this.data = this.editJson.content;
            console.log('is config loaded')
            this.isConfigLoaded()
            .subscribe(() => '')
          })
          break;
        case Enum.LOAD_EXISTING_CONFIG:
          this.ieamService.editingConfig = true;
          this.editJson = this.ieamService.getEditorStorage('hznConfig')
          this.originalJson = this.showData = this.data = this.editJson.content;
          this.ieamService.broadcast({type: Enum.CONFIG_LOADED, payload: {}});
          break;
        case Enum.LOAD_CONFIG:
          this.ieamService.editingConfig = msg.payload.toEditor ? false : true;
          this.loadFile(msg.payload, Enum.LOAD_CONFIG)
          break;
        case Enum.LOAD_EXISTING_POLICY:
          this.ieamService.editingConfig = false;
          this.editJson = this.ieamService.getEditorStorage()
          this.originalJson = this.showData = this.data = this.editJson.content;
          if(this.ieamService.selectedOrg.length > 0) {
            this.updateEditorData(this.ieamService.selectedOrg)
          }
          break;
        case Enum.LOAD_POLICY:
          this.ieamService.editingConfig = false;
          this.loadFile(msg.payload, Enum.LOAD_POLICY)
          console.log(msg.payload)
          this.isConfigLoaded()
          .subscribe(() => {
            console.log('loaded config')
            // this.loadFile(msg.payload, Enum.LOAD_POLICY)
          })
          break;
        case Enum.ORG_SELECTED:
          if(this.ieamService.isModified()) {
            const resp:any = await this.ieamService.promptDialog('Would you to discard your changes?', '', {okButton: 'Yes', cancelButton: 'No'})
            if(resp) {
              this.ieamService.selectedOrg = msg.payload;
              this.updateEditorData(this.ieamService.selectedOrg)
            }
          } else {
            this.ieamService.selectedOrg = msg.payload;
            this.updateEditorData(this.ieamService.selectedOrg)
          }
          break;
        case Enum.REMOTE_POLICY:
          this.ieamService.editingConfig = false;
          this.editJson = this.ieamService.getEditorStorage()
          if(this.editJson) {
            this.showData = this.data = this.editJson.content;
          } else {
            this.ieamService.broadcast({type: Enum.NAVIGATE, to: Navigate.bucket})
          }
          break;
      }
    });

    // this.showData = this.data = {
    //   'randomNumber': 2,
    //   'products': [
    //     {
    //       'name': 'car',
    //       'product':
    //         [
    //           {
    //             'name': 'honda',
    //             'model': [
    //               { 'id': 'civic', 'name': 'civic' },
    //               { 'id': 'accord', 'name': 'accord' }, { 'id': 'crv', 'name': 'crv' },
    //               { 'id': 'pilot', 'name': 'pilot' }, { 'id': 'odyssey', 'name': 'odyssey' }
    //             ]
    //           }
    //         ]
    //     }
    //   ]
    // };
  }
  ngAfterViewInit() {
  }
  populateJson(input, output) {
    Object.keys(output).forEach((key) => {
      output[key] = input[key]
    })
    return output
  }
  editExchangeFile(type: number) {
    switch(type) {
      // case Enum.EDIT_EXCHANGE_FILE:
      //   let json = this.ieamService.activeExchangeFile ? Object.assign({}, this.ieamService.activeExchangeFile) : this.ieamService.getContent()
      //   let schema = JsonSchema[this.ieamService.selectedCall]
      //   let exchange = Exchange[this.ieamService.selectedCall]
      //   this.ieamService.activeExchangeFile = null
      //   if(exchange && !exchange.template && schema && schema.file && schema.file.length > 0) {
      //     this.ieamService.get(schema.file)
      //     .subscribe((res) => {
      //       this.ieamService.currentWorkingFile = this.ieamService.selectedCall
      //       json = this.populateJson(json, res)
      //       this.ieamService.addEditorStorage(json, this.ieamService.selectedCall)
      //       this.editJson = this.ieamService.getEditorStorage()
      //       if(this.editJson) {
      //         this.showData = this.data = this.editJson.content;
      //         this.shouldLoadConfig().then(() => '')
      //       } else {
      //         console.log('file not found');
      //       }
      //     })
      //   } else {
      //     this.ieamService.currentWorkingFile = this.ieamService.selectedCall
      //     this.ieamService.addEditorStorage(json, this.ieamService.selectedCall)
      //     this.editJson = this.ieamService.getEditorStorage()
      //     this.showData = this.data = this.editJson.content;
      //     this.shouldLoadConfig().then(() => '')
      //   }
      //   break;
      case Enum.EDIT_EXCHANGE_FILE:
      default:
        this.editJson = this.ieamService.getEditorStorage()
        if(this.editJson) {
          this.showData = this.data = this.editJson.content;
          this.shouldLoadConfig().then(() => '')
        } else {
          this.originalJson = this.showData = this.data = this.template;
        }
        break;
    }
  }
  isConfigLoaded() {
    return new Observable((observer) => {
      this.editJson = this.ieamService.getEditorStorage('hznConfig')
      if(!this.editJson || Object.keys(this.editJson.content).length == 0) {
        this.shouldLoadConfig().then(() => observer.complete())
      } else {
        if(this.ieamService.selectedOrg.length > 0) {
          this.updateEditorData(this.ieamService.selectedOrg)
        }
        observer.complete()
      }
    })
  }
  shouldLoadConfig() {
    // TODO:  move this to ieamService
    return new Promise(async (resolve, reject) => {
      this.editJson= this.ieamService.getEditorStorage('hznConfig')
      if(!this.editJson || Object.keys(this.editJson.content).length == 0) {
        const answer:any = await this.ieamService.promptDialog('Would you like to load config file?', '', {okButton: 'Yes', cancelButton: 'No'})
        if(answer) {
          // payload indicates we are in editor route
          this.ieamService.broadcast({type: Enum.TRIGGER_LOAD_CONFIG, payload: {toEditor: true}});
        }
        resolve('');
      }
    })
  }
  async updateEditorData(org: string) {
    if(this.data && this.ieamService.configJson[org]) {
      let envVars: IEnvVars = this.ieamService.configJson[org].envVars;
      let policy = JSON.stringify(this.data)
      policy = policy.replace(new RegExp(`\\$HZN_ORG_ID`, 'g'), org)
      Object.keys(envVars).forEach((key) => {
        policy = policy.replace(new RegExp(`"\\$${key}"`, 'g'), `"${envVars[key]}"`)
        if(key === 'VOLUME_MOUNT') {
          policy = policy.replace(new RegExp(`\\$MMS_SHARED_VOLUME:\\$${key}`, 'g'), `${envVars['MMS_SHARED_VOLUME']}:${envVars[key]}`)
        }
      })
      Object.keys(envVars).forEach((key) => {
        policy = policy.replace(new RegExp(`\\$${key}`, 'g'), envVars[key])
      })
      if(policy.indexOf('$ARCH') >= 0) {
        const arch:any = await this.ieamService.promptDialog('What platform?', 'folder', {placeholder: 'Architecture type', name: this.ieamService.selectedArch})
        if(arch) {
          this.ieamService.setArch(arch.options.name)
          this.ieamService.selectedArch = arch.options.name;
          policy = policy.replace(new RegExp(`\\$ARCH`, 'g'), arch.options.name)
          if(policy.indexOf('$MMS_CONTAINER') > 0) {
            const answer:any = await this.ieamService.promptDialog('Please enter docker id', 'folder', {placeholder: 'Your Docker Id', name: this.ieamService.selectedDockerHubId})
            if(answer) {
              this.ieamService.selectedDockerHubId = answer.options.name;
              let container = `${answer.options.name}/${envVars['MMS_CONTAINER_NAME']}_${arch.options.name}:${envVars['MMS_SERVICE_VERSION']}`
              policy = policy.replace(new RegExp(`\\$MMS_CONTAINER`, 'g'), container)
            }
          }
          if(policy.indexOf('$SERVICE_CONTAINER') > 0) {
            const answer:any = await this.ieamService.promptDialog('Please enter docker id', 'folder', {placeholder: 'Your Docker Id', name: this.ieamService.selectedDockerHubId})
            if(answer) {
              this.ieamService.selectedDockerHubId = answer.options.name;
              let container = `${answer.options.name}/${envVars['SERVICE_CONTAINER_NAME']}_${arch.options.name}:${envVars['SERVICE_VERSION']}`
              policy = policy.replace(new RegExp(`\\$SERVICE_CONTAINER`, 'g'), container)
            }
          }
        }
      }
      this.massageContent(JSON.parse(policy))
      .subscribe((json) => {
        // this.originalJson = this.showData;
        this.showData = json
        console.log(this.showData)
        this.editor.getEditor().set(this.showData)
        this.isModified()
        // this.editor.collapseAll()
      })
    }
  }
  massageContent(json: any) {
    return new Observable((observer) => {
      let schema = JsonSchema[this.ieamService.selectedCall]
      switch(this.ieamService.selectedCall) {
        case 'getNode':
          this.ieamService.get(schema.policy)
          .subscribe((res) => {
            try {
              let oContent = this.ieamService.getOriginalContent()
              let oServices = oContent['registeredServices']
              if(oServices.length > 0) {
                json['registeredServices'].forEach((service, idx) => {
                  if(service.url.indexOf(this.ieamService.selectedOrg) == 0) {
                    let orgService = service.url.split('/')
                    let policy = JSON.stringify(res)
                    // we only need to read from first oServices[0]
                    let oPolicy = JSON.parse(oServices[0].policy)
                    let obj = this.ieamService.getParentFromJson(oPolicy, 'name', 'cpus')
                    if(obj) {
                      policy = policy.replace(/\${cpus}/g, obj.value)
                    }
                    obj = this.ieamService.getParentFromJson(oPolicy, 'name', 'ram')
                    if(obj) {
                      policy = policy.replace(/\${ram}/g, obj.value)
                    }
                    policy = policy.replace(/\${orgId}/g, orgService[0])
                    policy = policy.replace(/\${service}/g, orgService[1])
                    policy = policy.replace(/\${version}/g, service.version)
                    policy = policy.replace(/\${arch}/g, json.arch)
                    obj = this.ieamService.setPropValueFromJson(service, 'propType', 'version', service.version)
                    if(obj) {
                      policy = policy.replace(/\${ram}/g, obj.value)
                    }
                    console.log(policy)
                    json.registeredServices[idx].policy = policy
                  }
                })
              }
              observer.next(json)
              observer.complete()
            } catch(e) {
              console.log(e)
            }
          })
          break;
        default:
          observer.next(json)
          observer.complete()
      }

    })
  }
  loadFile(payload: any, type: Enum) {
    this.ieamService.loadFile(payload, type)
    .subscribe({
      complete: async () => {
        if(type == Enum.LOAD_CONFIG) {
          if(payload.toEditor) {
            // go to editor with existing policy
            this.editJson = this.ieamService.getEditorStorage()
            this.showData = this.data = this.editJson.content;
          } else {
            this.editJson = this.ieamService.getEditorStorage('hznConfig')
            this.showData = this.data = this.editJson.content;
          }
        } else if(type == Enum.LOAD_POLICY) {
          this.editJson = this.ieamService.getEditorStorage()
          this.showData = this.data = this.editJson.content;
        }
        this.originalJson = this.showData;
      }
    })
  }
  readFile(file: any) {
    const reader = new FileReader();
    return new Observable((observer: { next: (arg0: any) => void; complete: () => void; }) => {
      reader.onload = (e: any) => {
        observer.next(e.target.result);
        observer.complete();
      };
      reader.onloadend = (e) => {
        console.log(reader);
      };
      reader.readAsDataURL(file);
    });
  }
  save() {
    this.ieamService.saveFile(this.ieamService.getCurrentFilename(), JSON.stringify(this.editor.get()))
  }
  changeLog(event = null) {
    console.log(event);
    console.log('change:', this.editor.get());
    this.updateEditor()
  }

  updateEditor() {
    /**
     * Manual validation based on the schema
     * if the change does not meet the JSON Schema, it will use the last data
     * and will revert the user change.
     */
     const editorJson = this.editor.getEditor()
    editorJson.validate()
    const errors = editorJson.validateSchema ? editorJson.validateSchema.errors : null;
    if (errors && errors.length > 0) {
      console.log('Errors found', errors)
      editorJson.set(this.showData);
    } else {
      this.massageContent(this.editor.get())
      .subscribe((json) => {
        this.showData = json
        this.editor.update(this.showData)
        this.isModified()
        // this.editor.getEditor().set(this.showData)
        // this.editor.expandAll()
      })
    }
  }
  isModified() {
    this.ieamService.isJsonModified = JSON.stringify(this.showData) != JSON.stringify(this.originalJson) //&& this.ieamService.selectedOrg.length > 0;
    this.editJson.content = this.showData;
    this.editJson.modified = this.ieamService.isJsonModified;
    this.ieamService.updateEditorStorage(this.editJson);
    return this.ieamService.isJsonModified;
  }
  changeEvent(event) {
    console.log(event);
  }

  initEditorOptions(editorOptions) {
    // this.editorOptions.mode = 'code'; // set only one mode
    editorOptions.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
    // this.editorOptions.ace = (<any>window).ace.edit('editor');
  }

  setLanguage(lang) {
    this.editorOptions.language = lang; // force a specific language, ie. pt-BR
    this.editor.setOptions(this.editorOptions);
  }

  // setAce() {
  //   const aceEditor = (<any>window).ace.edit(document.querySelector('#a' + this.editor.id + '>div'));
  //   // custom your ace here
  //   aceEditor.setReadOnly(true);
  //   aceEditor.setFontSize('110pt');
  //   this.editorOptions.ace = aceEditor;
  //   this.editor.setOptions(this.editorOptions);
  // }

  toggleNav() {
    this.editorOptions.navigationBar = !this.editorOptions.navigationBar;
    this.editor.setOptions(this.editorOptions);
  }

  toggleStatus() {
    this.editorOptions.statusBar = !this.editorOptions.statusBar;
    this.editor.setOptions(this.editorOptions);
  }

  customLanguage() {
    this.editorOptions.languages = {
      'pt-BR': {
        'auto': 'Automático testing'
      },
      'en': {
        'auto': 'Auto testing'
      }
    };
    this.editor.setOptions(this.editorOptions);
  }

  changeObject() {
    this.data.randomNumber = Math.floor(Math.random() * 8);
  }

  changeData() {
    this.data = Object.assign({}, this.data,
      { randomNumber: Math.floor(Math.random() * 8) });
  }
    /**
   * Example on how get the json changed from the jsoneditor
   */
    getData() {
    const changedJson = this.editor.get();
    console.log(changedJson);
  }

  makeOptions = () => {
    return new JsonEditorOptions();
  }

  ngOnDestroy() {
    delete this.dialogRef;
    if (this.psAgent) {
      this.psAgent.unsubscribe();
    }
    this.routeObserver.unsubscribe();
    this.editor.destroy()
  }
}
