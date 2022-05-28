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
  orginalJson: any;
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
    this.routerObserver = this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      if('/editor' !== this.router.routerState.snapshot.url) {
        return;
      }
    })
    if(this.ieamService.editorStorage) {
      this.showData = this.data = this.ieamService.editorStorage.json;
      this.shouldLoadConfig()
    } else {
      this.showData = this.data = this.template;
    }

    this.psAgent = this.ieamService.broadcastAgent.subscribe(async (msg: any) => {
      if(msg.type == Enum.SAVE) {
        this.save()
      } else if(msg.type == Enum.LOAD_CONFIG) {
        this.ieamService.editingConfig = msg.payload.toEditor ? false : true;
        console.log(msg.payload)
        this.loadFile(msg.payload, Enum.LOAD_CONFIG)
      } else if(msg.type == Enum.LOAD_POLICY) {
        this.ieamService.editingConfig = false;
        console.log(msg.payload)
        if(Object.keys(this.ieamService.configJson).length == 0) {
          this.shouldLoadConfig()
        } else {
          if(this.selectedOrg.length > 0) {
            this.updateEditorData(this.selectedOrg)
          }
        }
        this.loadFile(msg.payload, Enum.LOAD_POLICY)
      } else if(msg.type == Enum.ORG_SELECTED) {
        if(this.isModified()) {
          const resp:any = await this.promptDialog('Would you to discard your changes?', 'confirm')
          if(resp) {
            this.selectedOrg = msg.payload;
            this.updateEditorData(this.selectedOrg)
          }
        } else {
          this.selectedOrg = msg.payload;
          this.updateEditorData(this.selectedOrg)
        }
      } else if(msg.type == Enum.REMOTE_POLICY) {
        this.ieamService.editingConfig = false;
        if(this.ieamService.editorStorage && this.ieamService.editorStorage.json) {
          this.showData = this.data = this.ieamService.editorStorage.json;
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
    setTimeout(() => {
      this.ieamService.broadcast({type: Enum.NOT_EDITOR, payload: false});
    }, 0)
  }
  async shouldLoadConfig() {
    if(Object.keys(this.ieamService.configJson).length == 0) {
      const answer:any = await this.promptDialog('Would you like to load config file?', '', {okButton: 'Yes', cancelButton: 'No'})
      if(answer) {
        // payload indicates we are in editor route
        this.ieamService.broadcast({type: Enum.TRIGGER_LOAD_CONFIG, payload: {toEditor: true}});
      }
    }
  }
  async updateEditorData(org: string) {
    let envVars = this.ieamService.configJson[org].envVars;
    let policy = JSON.stringify(this.data)
    policy = policy.replace(new RegExp(`\\$HZN_ORG_ID`, 'g'), org)
    Object.keys(envVars).forEach((key) => {
      policy = policy.replace(new RegExp(`\\$${key}`, 'g'), envVars[key])
    })
    if(policy.indexOf('$ARCH') >= 0) {
      const arch:any = await this.promptDialog('What platform?', 'folder', {placeholder: 'Architecture type'})
      policy = policy.replace(new RegExp(`\\$ARCH`, 'g'), arch.name)
    }
    this.showData = JSON.parse(policy)
    this.orginalJson = this.showData;
    console.log(this.showData)
    this.editor.getEditor().set(this.showData)
  }
  loadFile(payload: any, type: Enum) {
    let $upload: any = {};
    let $files: any = {};
    let fhandle: FileSystemFileHandle[] = payload.fhandle;

    for (let i = fhandle.length - 1; i >= 0; i--) {
      $files[fhandle[i].name] = this.ieamService.readOpenFile(fhandle[i]);
    }
    forkJoin($files)
    .subscribe((res: any) => {
      Object.keys(res).forEach((key: any, idx: number) => {
        if(type == Enum.LOAD_CONFIG) {
          this.ieamService.configJson = JSON.parse(res[key]);
          if(payload.toEditor) {
            // go to editor with existing policy
            this.showData = this.data = this.ieamService.editorStorage.json;
          } else {
            this.showData = this.data = this.ieamService.configJson;
          }
          this.ieamService.broadcast({type: Enum.CONFIG_LOADED, payload: payload});
        } else if(type == Enum.LOAD_POLICY) {
          this.ieamService.editorStorage = {json: JSON.parse(res[key]), filename: key};
          this.showData = this.data = this.ieamService.editorStorage.json;
        }
      });
    })
  }
  promptDialog(title: string, type: string, options: any = {}) {
    // this.openDialog({title: `What is the name of the new folder?`, type: 'folder', placeholder: 'Folder name'}, (resp: { name: string; }) => {
    return new Promise((resolve, reject) => {
      this.openDialog({title: title, type: type, options: options}, (resp: any) => {
        if (resp) {
          console.log(resp);
          resolve(resp);
        }
      });
    })
  }
  openDialog(payload: { title: string; type: string; options: any; }, cb: { (resp: any): void; (resp: any): void; (resp: any): void; (arg0: any): void; }): void {
    this.dialogRef = this.dialog.open(DialogComponent, {
      hasBackdrop: false,
      width: '350px',
      height: '250px',
      data: payload
    });

    this.dialogRef.afterClosed().subscribe((result: any) => {
      cb(result);
      this.dialog.closeAll();
    });
  }
  loadFile2(fhandle: FileSystemFileHandle[]) {
    let $upload: any = {};
    let $files: any = {};

    for (let i = fhandle.length - 1; i >= 0; i--) {
      $files[fhandle[i].name] = this.readFile(fhandle[i]);
    }
    forkJoin($files)
    .subscribe((res: any) => {
      Object.keys(res).forEach((key: any, idx: number) => {
        let b64 = res[key].replace(/^data:.+;base64,/, '');
        this.ieamService.configJson = JSON.parse(atob(b64));
        this.showData = this.data = this.ieamService.configJson;
      });
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
    const modified = JSON.stringify(this.showData) != JSON.stringify(this.orginalJson) && this.selectedOrg.length > 0;
    this.ieamService.broadcast({type: Enum.JSON_MODIFIED, payload: modified});
    return modified;
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
