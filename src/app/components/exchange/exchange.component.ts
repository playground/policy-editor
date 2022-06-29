import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd} from '@angular/router';
import { Enum, Navigate, Exchange, IExchange, UrlToken } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';
import prettyHtml from 'json-pretty-html';
import { IDeploymentPolicy, IMethod, IService } from 'src/app/interface';
import { Observable } from 'rxjs/internal/Observable';

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
      const answer:any = await this.ieamService.promptDialog(exchange.title || '', 'folder', {placeholder: exchange.placeholder})
      if(answer) {
        const path = `${exchange.path}/${answer.options.name}`
        this.checkB4Calling(path, exchange)
      }
    } else {
      this.checkB4Calling(exchange.path, exchange)
    }
  }
  checkIfExist(path: string, exchange: IExchange) {
    return new Observable((observer) => {
      this.ieamService.callExchange(path, exchange)
      .subscribe(({
        next: (data) => {
          if(Object.keys(data).length > 0) {
            observer.next({found: true})
            observer.complete()
          }
        },
        error: (err) => {
          console.log(err)
          // TODO: exchange-api /v1/orgs/root/services/<service> should not return 404 when service not found
          observer.next({found: false})
          observer.complete()
        }
      }))
    })
  }
  getPublicKey() {
    return new Observable((observer) => {
      this.ieamService.get(this.method.getPublicKey)
      .subscribe({
        next: (res: any) => observer.next(res.publicKey.replace(/^\s+|\s+$/g, '')),
        error: (err) => {
          console.log(err)
          observer.error(err)
        }
      })
    })
  }
  addServiceKey(content: IService) {
    const exchange: IExchange = Exchange.addServiceCert
    let path = this.tokenReplace(exchange.path, content)
    this.getPublicKey()
    .subscribe({
      next: (key: any) => {
        this.callExchange(path, exchange, {key: key})
      }
    })
  }
  checkB4Calling(path: string, exchange: IExchange) {
    const json:any = this.ieamService.getEditorStorage();
    let content: IService = Object.assign({}, json.content);
    if(exchange.signature) {
      try {
        if(exchange.signature === 'getPublicKey') {
          this.getPublicKey()
          .subscribe({
            next: (key: any) => {
              let useThis = {key: key}
              this.hasServiceName(path, exchange, content, useThis)
            }
          })
        } else {
          let body: any = content.deployment
          this.ieamService.post(this.method.signDeployment, body)
          .subscribe({
            next: (res) => {
              content.deployment = JSON.stringify(body)
              content.deploymentSignature = res.signature.replace(/^\s+|\s+$/g, '')
              this.hasServiceName(path, exchange, content)
              this.addServiceKey(content)
            }
          })
        }
      } catch(e) {
        console.log(e)
      }
    } else {
      this.hasServiceName(path, exchange, content)
    }
  }
  async confirmB4Calling(path: string, exchange: IExchange, content: IService, useThis: any = {}) {
    path = this.tokenReplace(path, content)
    let body = Object.keys(useThis).length > 0 ? useThis : content;
    if(!exchange.run && exchange.method != 'GET') {
      this.tempName = this.tempName ? this.tempName : this.ieamService.getServiceName(content)
      const resp:any = await this.ieamService.promptDialog(`${exchange.name}: <br>${this.tempName}`, '', {okButton: 'Yes', cancelButton: 'No'})
      if(resp) {
        if(exchange.callB4) {
          // Check if service exists, if so PUT instead of POST
          let callB4: IExchange = Object.assign({}, Exchange[exchange.callB4]);
          let callB4Path = this.tokenReplace(callB4.path, content)
          this.checkIfExist(callB4Path, callB4)
          .subscribe(({
            next: (data: any) => {
              if(!data.found) {
                exchange.method = 'POST'
                path = this.tokenReplace(path, content)
                this.callExchange(path, exchange, body)
              } else {
                callB4.method = 'PUT'
                this.callExchange(callB4Path, callB4, body)
              }
            }
          }))
        } else {
          this.callExchange(path, exchange, body)
        }
      }
    } else {
      this.callExchange(path, exchange, body)
    }
  }
  hasServiceName(path: string, exchange: IExchange, content: IService, useThis = {}) {
    let serviceName = ''
    if(exchange.run || this.ieamService.hasServiceName(content)) {
      if(/{nodeId}|{agId}|{pattern}/.exec(path)) {
        if(path.indexOf('${nodeId}') >= 0) {
          this.ieamService.promptDialog(`What is the Node Id?`, 'folder', {placeholder: 'Node Id'})
          .then((resp: any) => {
            const nodeId = resp.options.name;
            path = path.replace(UrlToken['nodeId'], nodeId)
            this.confirmB4Calling(path, exchange, content, useThis)
          })
        }
        if(path.indexOf('${agId}') >= 0) {
          this.ieamService.promptDialog(`What is the Agreement Id?`, 'folder', {placeholder: 'Agreement Id'})
          .then((resp: any) => {
            const nodeId = resp.options.name;
            path = path.replace(UrlToken['agId'], nodeId)
            this.confirmB4Calling(path, exchange, content, useThis)
          })
        }
        if(path.indexOf('${pattern}') >= 0) {
          this.ieamService.promptDialog(`What is the Pattern Name`, 'folder', {placeholder: 'Pattern Name'})
          .then((resp: any) => {
            const nodeId = resp.options.name;
            path = path.replace(UrlToken['pattern'], nodeId)
            this.confirmB4Calling(path, exchange, content, useThis)
          })
        }
      }
      else {
        this.confirmB4Calling(path, exchange, content, useThis)
      }
    } else {
      this.ieamService.promptDialog(`What is the archecture?`, 'folder', {placeholder: 'Architecture', name: this.ieamService.selectedArch})
      .then((resp: any) => {
        if (resp) {
          const arch = this.ieamService.selectedArch = resp.options.name;
          const org = this.ieamService.getOrg()
          if(/service$|servicePolicy$|servicePattern$/.exec(exchange.type) && this.ieamService.selectedLoader !== 'topLevelService') {
            this.tempName = `${org.envVars.SERVICE_NAME}_${org.envVars.SERVICE_VERSION}_${arch}`
            // path = path.replace(UrlToken[exchange.type], this.tempName)
          } else if(/deploymentPolicy$|topLevelService$|topLevelServicePattern$/.exec(exchange.type)) {
            this.tempName = `${org.envVars.MMS_SERVICE_NAME}_${org.envVars.MMS_SERVICE_VERSION}_${arch}`
            // path = path.replace(UrlToken[exchange.type], this.tempName)
          }
          this.confirmB4Calling(path, exchange, content, useThis)
        } else {
        }
      })
    }
  }
  tokenReplace(path: string, content: IService) {
    let value = '';
    Object.keys(UrlToken).forEach((key) => {
      if(path.indexOf(UrlToken[key]) >= 0) {
        value = ''
        switch(key) {
          case 'service':
            value = this.ieamService.getServiceName(content)
            break;
          case 'keyId':
            value = 'policy-editor'
            break;
          case 'orgId':
            value = this.ieamService.selectedOrg
            break;
          case 'pattern':
            value = content.label
            break;
          case 'deploymentPolicy':
            const policy = content as IDeploymentPolicy;
            const version = policy.service.serviceVersions[0] ? `_${policy.service.serviceVersions[0].version}_` : '_'
            value = `${policy.service.name}${version}${this.ieamService.selectedArch}`
            break;
          }
        path = path.replace(UrlToken[key], value)
      }
    })
    console.log(path)
    return path;
  }
  callExchange(path: string, exchange: IExchange, body: any) {
    // const method = exchange.method ? exchange.method : 'GET'
    // const json:any = this.ieamService.getEditorStorage();
    // let content: IService = json.content;
    // let org: any = this
    this.ieamService.callExchange(path, exchange, body)
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
