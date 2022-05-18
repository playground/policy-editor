import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { filter } from 'rxjs/operators';
import { IeamService } from 'src/app/services/ieam.service';
import { JsonEditorComponent, JsonEditorOptions } from '../../../../ang-jsoneditor/src/public_api';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  @ViewChild('editor', { static: false, read: ElementRef })
  editor: JsonEditorComponent;
  public editorOptions: JsonEditorOptions;
  public initialData: any;
  public visibleData: any;
  public showData: any;
  public data: any;
  public EditedData: any;
  routerObserver: any;
  bucketName: any;
  bucketApi: any;
  state: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ieamService: IeamService,
  ) {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view'];

    this.initialData = {"products":[{"name":"car","product":[{"name":"honda","model":[{"id":"civic","name":"civic"},{"id":"accord","name":"accord"},{"id":"crv","name":"crv"},{"id":"pilot","name":"pilot"},{"id":"odyssey","name":"odyssey"}]}]}]}
    this.visibleData = this.initialData;
  }

  ngOnInit(): void {
    this.routerObserver = this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      const currentState = this.router.getCurrentNavigation();
      this.state = currentState ? currentState.extras.state : null;
      if (this.state) {
        this.ieamService.get(this.state.url)
        .subscribe({
          next: (res: any) => {
            console.log(res)
          }, error: (err: any) => console.log(err)
        })
      }
    })

    this.showData = this.data = {
      'randomNumber': 2,
      'products': [
        {
          'name': 'car',
          'product':
            [
              {
                'name': 'honda',
                'model': [
                  { 'id': 'civic', 'name': 'civic' },
                  { 'id': 'accord', 'name': 'accord' }, { 'id': 'crv', 'name': 'crv' },
                  { 'id': 'pilot', 'name': 'pilot' }, { 'id': 'odyssey', 'name': 'odyssey' }
                ]
              }
            ]
        }
      ]
    };
  }
  changeLog(event = null) {
    console.log(event);
    console.log('change:', this.editor);

    /**
     * Manual validation based on the schema
     * if the change does not meet the JSON Schema, it will use the last data
     * and will revert the user change.
     */
    const editorJson = this.editor.getEditor()
    editorJson.validate()
    const errors = editorJson.validateSchema.errors
    if (errors && errors.length > 0) {
      console.log('Errors found', errors)
      editorJson.set(this.showData);
    } else {
      this.showData = this.editor.get();
    }
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

    print(v) {
      return JSON.stringify(v, null, 2);
    }
    showJson(d) {
      console.log(d)
      this.EditedData = JSON.stringify(d, null, 2);
    }

    makeOptions = () => {
      return new JsonEditorOptions();
    }
}
