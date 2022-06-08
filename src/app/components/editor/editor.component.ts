import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { Observable, forkJoin } from  'rxjs';
import { filter } from 'rxjs/operators';
import { Enum, Navigate } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';
import { JsonEditorComponent, JsonEditorOptions } from '../../../../ang-jsoneditor/src/public_api';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

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
  routerObserver: any;
  bucketName: any;
  bucketApi: any;
  state: any;
  currentPolicy = '';
  originalJson: any;
  template = {
    "org": "$HZN_ORG_ID",
    "label": "$SERVICE_NAME for $ARCH",
    "url": "$SERVICE_NAME",
    "version": "$SERVICE_VERSION",
    "arch": "$ARCH",
    "public": true,
    "sharable": "singleton",
    "requiredServices": [],
    "userInput": [],
    "deployment": {
      "services": {
        "$SERVICE_NAME": {
          "image": "$SERVICE_CONTAINER",
          "binds": [
            "$MMS_SHARED_VOLUME:$VOLUME_MOUNT:rw"
          ],
          "ports": [
            {
            "HostIP": "0.0.0.0",
            "HostPort": "3000:3000/tcp"
            }
          ],
          "privileged": true
        }
      }
    }
  }
  dialogRef?: MatDialogRef<DialogComponent, any>;
  selectedOrg = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ieamService: IeamService,
    private dialog: MatDialog
  ) {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view'];

    // this.initialData = {"products":[{"name":"car","product":[{"name":"honda","model":[{"id":"civic","name":"civic"},{"id":"accord","name":"accord"},{"id":"crv","name":"crv"},{"id":"pilot","name":"pilot"},{"id":"odyssey","name":"odyssey"}]}]}]}
    // this.visibleData = this.initialData;
  }

  async ngOnInit() {
    if(!this.ieamService.signIn('/editor')) {
      return
    }
    let json = this.ieamService.getEditorStorage()
    if(json) {
      this.showData = this.data = json.content;
      this.shouldLoadConfig()
    } else {
      this.originalJson = this.showData = this.data = this.template;
    }

    this.route.data.subscribe((data) => {
      if(!this.route.snapshot.queryParamMap.get('fromMenu')) {
        // this.ieamService.broadcast({type: Enum.NOT_EDITOR, payload: false});
      } else {
      }
    })
    this.routerObserver = this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      // if('/editor' !== this.router.routerState.snapshot.url) {
      //   return;
      // }
    })

    this.psAgent = this.ieamService.broadcastAgent.subscribe(async (msg: any) => {
      if(msg.type == Enum.SAVE) {
        this.save()
      } else if(msg.type == Enum.LOAD_EXISTING_CONFIG) {
        this.ieamService.editingConfig = true;
        this.originalJson = this.showData = this.data = this.ieamService.configJson;
        this.ieamService.broadcast({type: Enum.CONFIG_LOADED, payload: {}});
      } else if(msg.type == Enum.LOAD_CONFIG) {
        this.ieamService.editingConfig = msg.payload.toEditor ? false : true;
        console.log(msg.payload)
        this.loadFile(msg.payload, Enum.LOAD_CONFIG)
      } else if(msg.type == Enum.LOAD_EXISTING_POLICY) {
        this.ieamService.editingConfig = false;
        this.originalJson = this.showData = this.data = this.ieamService.getEditorStorage(this.ieamService.currentWorkingFile);
        if(this.ieamService.selectedOrg.length > 0) {
          this.updateEditorData(this.ieamService.selectedOrg)
        }
      } else if(msg.type == Enum.LOAD_POLICY) {
        this.ieamService.editingConfig = false;
        console.log(msg.payload)
        let json = this.ieamService.getEditorStorage('hznConfig')
        if(!json || Object.keys(json.content).length == 0) {
          this.shouldLoadConfig()
        } else {
          if(this.ieamService.selectedOrg.length > 0) {
            this.updateEditorData(this.ieamService.selectedOrg)
          }
        }
        this.loadFile(msg.payload, Enum.LOAD_POLICY)
      } else if(msg.type == Enum.ORG_SELECTED) {
        if(this.isModified()) {
          const resp:any = await this.ieamService.promptDialog('Would you to discard your changes?', '', {okButton: 'Yes', cancelButton: 'No'})
          if(resp) {
            this.ieamService.selectedOrg = msg.payload;
            this.updateEditorData(this.ieamService.selectedOrg)
          }
        } else {
          this.ieamService.selectedOrg = msg.payload;
          this.updateEditorData(this.ieamService.selectedOrg)
        }
      } else if(msg.type == Enum.REMOTE_POLICY) {
        this.ieamService.editingConfig = false;
        let json = this.ieamService.getEditorStorage()
        if(json) {
          this.showData = this.data = json.content;
        } else {
          this.ieamService.broadcast({type: Enum.NAVIGATE, to: Navigate.bucket})
        }
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
    if(this.ieamService.selectedOrg.length > 0) {
      this.updateEditorData(this.ieamService.selectedOrg)
    }
  }
  async shouldLoadConfig() {
    let json = this.ieamService.getEditorStorage('hznConfig')
    if(!json || Object.keys(json.content).length == 0) {
      const answer:any = await this.ieamService.promptDialog('Would you like to load config file?', '', {okButton: 'Yes', cancelButton: 'No'})
      if(answer) {
        // payload indicates we are in editor route
        this.ieamService.broadcast({type: Enum.TRIGGER_LOAD_CONFIG, payload: {toEditor: true}});
      }
    }
  }
  async updateEditorData(org: string) {
    if(this.ieamService.configJson[org]) {
      let envVars = this.ieamService.configJson[org].envVars;
      let policy = JSON.stringify(this.data)
      policy = policy.replace(new RegExp(`\\$HZN_ORG_ID`, 'g'), org)
      Object.keys(envVars).forEach((key) => {
        policy = policy.replace(new RegExp(`\\$${key}`, 'g'), envVars[key])
      })
      if(policy.indexOf('$ARCH') >= 0) {
        const arch:any = await this.ieamService.promptDialog('What platform?', 'folder', {placeholder: 'Architecture type'})
        if(arch) {
          policy = policy.replace(new RegExp(`\\$ARCH`, 'g'), arch.options.name)

          if(policy.indexOf('$MMS_CONTAINER') > 0) {
            const answer:any = await this.ieamService.promptDialog('Please enter docker id', 'folder', {placeholder: 'Your Docker Id'})
            if(answer) {
              let container = `${answer.options.name}/${envVars['MMS_CONTAINER_NAME']}_${arch.options.name}:${envVars['MMS_SERVICE_VERSION']}`
              policy = policy.replace(new RegExp(`\\$MMS_CONTAINER`, 'g'), container)
            }
          }
          if(policy.indexOf('$SERVICE_CONTAINER') > 0) {
            const answer:any = await this.ieamService.promptDialog('Please enter docker id', 'folder', {placeholder: 'Your Docker Id'})
            if(answer) {
              let container = `${answer.options.name}/${envVars['SERVICE_CONTAINER_NAME']}_${arch.options.name}:${envVars['SERVICE_VERSION']}`
              policy = policy.replace(new RegExp(`\\$MMS_CONTAINER`, 'g'), container)
            }
          }
        }
      }
      this.showData = JSON.parse(policy)
      this.isModified()
      // this.originalJson = this.showData;
      console.log(this.showData)
      this.editor.getEditor().set(this.showData)
    }
  }
  loadFile(payload: any, type: Enum) {
    this.ieamService.loadFile(payload, type)
    .subscribe({
      complete: async () => {
        if(type == Enum.LOAD_CONFIG) {
          if(payload.toEditor) {
            // go to editor with existing policy
            this.showData = this.data = this.ieamService.getEditorStorage().content;
          } else {
            this.showData = this.data = this.ieamService.getEditorStorage('hznConfig').content;
          }
        } else if(type == Enum.LOAD_POLICY) {
          this.showData = this.data = this.ieamService.getEditorStorage().content;
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
      this.showData = this.editor.get();
      this.isModified()
    }
  }
  isModified() {
    this.ieamService.isJsonModified = JSON.stringify(this.showData) != JSON.stringify(this.originalJson) //&& this.ieamService.selectedOrg.length > 0;
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
    this.routerObserver.unsubscribe();
  }
}
