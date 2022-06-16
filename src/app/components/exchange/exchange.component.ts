import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd} from '@angular/router';
import { Enum, Navigate, Exchange, IExchange, UrlToken } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';
import prettyHtml from 'json-pretty-html';
import { IMethod, IService } from 'src/app/interface';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, AfterViewInit, OnDestroy {
  content: string = '';
  psAgent!: { unsubscribe: () => void; };
  method: IMethod;
  tempName: string = '';

  constructor(
    private route: ActivatedRoute,
    private ieamService: IeamService
  ) {
    this.method = this.ieamService.method;
  }

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
          this.showContent()
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
        this.checkB4Calling(path, exchange)
      }
    } else {
      this.checkB4Calling(exchange.path, exchange)
    }
  }
  checkB4Calling(path: string, exchange: IExchange) {
    const json:any = this.ieamService.getEditorStorage();
    let content: IService = Object.assign({}, json.content);
    if(exchange.signature) {
      try {
        let body: any = content.deployment
        this.ieamService.post(this.method.signDeployment, body)
        .subscribe({
          next: (res) => {
            content.deployment = JSON.stringify(body)
            content.deploymentSignature = res.signature.replace(/^\s+|\s+$/g, '')
            let callB4: IExchange = Object.assign({}, Exchange[exchange.callB4]);
            if(callB4) {
              // Check if service exists, if so PUT instead of POST
              let callB4Path = this.tokenReplace(callB4.path, content)
              this.ieamService.callExchange(callB4Path, callB4)
              .subscribe(({
                next: (data) => {
                  if(Object.keys(data).length > 0) {
                    callB4.method = 'PUT'
                    this.callExchange(callB4Path, callB4, content)
                  }
                },
                error: (err) => {
                  console.log(err)
                  // TODO: exchange-api /v1/orgs/root/services/<service> should not return 404 when service not found
                  this.hasServiceName(path, exchange, content);
                }
              }))
            } else {
              this.hasServiceName(path, exchange, content);
            }
          }
        })
      } catch(e) {
        console.log(e)
      }
    } else {
      this.hasServiceName(path, exchange, content)
    }
  }
  async confirmB4Calling(path: string, exchange: IExchange, content: IService) {
    path = this.tokenReplace(path, content)
    if(!exchange.run && exchange.method != 'GET') {
      const resp:any = await this.ieamService.promptDialog(`${exchange.name}: <br>${this.tempName}`, '', {okButton: 'Yes', cancelButton: 'No'})
      if(resp) {
        this.callExchange(path, exchange, content)
      }
    } else {
      this.callExchange(path, exchange, content)
    }
  }
  hasServiceName(path: string, exchange: IExchange, content: IService) {
    let serviceName = ''
    if(exchange.run || this.ieamService.hasServiceName(content)) {
      this.confirmB4Calling(path, exchange, content)
    } else {
      this.ieamService.promptDialog(`What is the archecture?`, 'folder', {placeholder: 'Architecture'})
      .then((resp: any) => {
        if (resp) {
          const arch = resp.options.name;
          const org = this.ieamService.getOrg()
          if(exchange.type == 'servicePolicy') {
            this.tempName = `${org.envVars.SERVICE_NAME}_${org.envVars.SERVICE_VERSION}_${arch}`
            path = path.replace(UrlToken[exchange.type], this.tempName)
          } else if(exchange.type == 'deploymentPolicy') {
            this.tempName = `${org.envVars.MMS_SERVICE_NAME}_${org.envVars.MMS_SERVICE_VERSION}_${arch}`
            path = path.replace(UrlToken[exchange.type], this.tempName)
          }
          this.confirmB4Calling(path, exchange, content)
        } else {
        }
      })

    }
  }
  tokenReplace(path: string, content: IService) {
    let value = '';
    Object.keys(UrlToken).forEach((key) => {
      switch(key) {
        case 'service':
          value = this.ieamService.getServiceName(content)
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
  callExchange(path: string, exchange: IExchange, content: IService) {
    // const method = exchange.method ? exchange.method : 'GET'
    // const json:any = this.ieamService.getEditorStorage();
    // let content: IService = json.content;
    // let org: any = this
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
