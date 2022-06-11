import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd} from '@angular/router';
import { Enum, Navigate, Exchange, IExchange, UrlToken } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';
import prettyHtml from 'json-pretty-html';
import { IService } from 'src/app/interface';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, AfterViewInit, OnDestroy {
  content: string = '';
  psAgent!: { unsubscribe: () => void; };

  constructor(
    private route: ActivatedRoute,
    private ieamService: IeamService
  ) { }

  ngOnInit(): void {
    if(!this.ieamService.signIn('/editor')) {
      return
    }

    this.showContent()
    if(!this.ieamService.signIn('/exchange')) {
      return
    }

    this.psAgent = this.ieamService.broadcastAgent.subscribe({
      next: async (msg: any) => {
        if(msg.type == Enum.EXCHANGE_CALL) {
          this.run(msg.payload)
        } else if(msg.type == Enum.EXCHANGE_SELECTED) {
          if(msg.payload && msg.payload.type == this.ieamService.currentWorkingFile) {
            this.showContent()
          }
        } else if(msg.type == Enum.LOAD_CONFIG) {
          this.ieamService.loadFile(msg.payload, msg.type)
          .subscribe({
            complete: () => {

            }
          })
        }
      }
    })
  }
  ngOnDestroy() {
    if (this.psAgent) {
      this.psAgent.unsubscribe();
    }
  }
  showContent() {
    let json = this.ieamService.getEditorStorage()
    if(json) {
      this.content = prettyHtml(json.content)
    }
  }
  async run(task: string) {
    const exchange: IExchange = Exchange[task]
    console.log(task, exchange.path)
    if(exchange.prompt) {
      const answer:any = await this.ieamService.promptDialog(exchange.title, 'folder', {placeholder: exchange.placeholder})
      if(answer) {
        const path = `${exchange.path}/${answer.options.name}`
        this.callExchange(path, exchange)
      }
    } else {
      this.callExchange(exchange.path, exchange)
    }
  }
  tokenReplace(path: string, content: any, org: any) {
    let value = '';
    Object.keys(UrlToken).forEach((key) => {
      switch(key) {
        case 'service':
          value = org.envVars.SERVICE_NAME
          break;
        case 'orgid':
          value = this.ieamService.selectedOrg
          break;
      }
      path = path.replace(UrlToken[key], value)
    })
    console.log(path)
    return path;
  }
  callExchange(path: string, exchange: IExchange) {
    const method = exchange.method ? exchange.method : 'GET'
    const json:any = this.ieamService.getEditorStorage();
    let content: IService = json.content;
    let org: any = this
    path = this.tokenReplace(path, content, this.ieamService.getOrg())
    this.ieamService.callExchange(path, exchange, content)
    .subscribe({
      next: (res: any) => {
        let html = ''
        if(typeof res == 'string') {
          html = res
        } else {
          html = prettyHtml(res)
        }
        this.content = html;
        console.log(res)
      }, error: (err) => console.log(err)
    })
  }
  ngAfterViewInit() {
  }
}
