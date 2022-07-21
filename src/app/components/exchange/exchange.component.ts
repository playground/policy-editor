import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd} from '@angular/router';
import { Enum, Navigate, Exchange, IExchange, UrlToken, JsonSchema, ActionMap, NextAction, IOption, Loader } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';
import prettyHtml from 'json-pretty-html';
import { IDeploymentPolicy, IMethod, IService } from 'src/app/interface';
import { Observable } from 'rxjs/internal/Observable';

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(private sanitizer:DomSanitizer) {
  }

  transform(v:string):SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(v);
  }
}

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, AfterViewInit, OnDestroy {
  content: any = {};
  psAgent!: { unsubscribe: () => void; };
  method: IMethod;
  tempName: string = '';

  constructor(
    private route: ActivatedRoute,
    private ieamService: IeamService,
    private elementRef:ElementRef
  ) {
    this.ieamService.isLoggedIn()
    this.method = this.ieamService.method;
  }

  ngOnInit(): void {
    // if(!this.ieamService.signIn('/editor')) {
    //   return
    // }

    this.showContent()
    if(!this.ieamService.signIn('/exchange')) {
      return
    }

    this.psAgent = this.ieamService.broadcastAgent.subscribe({
      next: async (msg: any) => {
        if(msg.type == Enum.EXCHANGE_CALL) {
          this.run(msg.payload)
        } else if(msg.type == Enum.EXCHANGE_SELECTED) {
          let exchange = Exchange[this.ieamService.selectedCall]
          if(exchange.template && !this.ieamService.hasContent()) {
            let schema = JsonSchema[this.ieamService.currentWorkingFile]
            this.ieamService.get(schema.file)
            .subscribe((res) => {
              if(exchange.editable) {
                let json = this.ieamService.getNodeContent(res)
                this.ieamService.setActiveExchangeFile(json).subscribe(() => {
                  let actionMap = ActionMap[this.ieamService.selectedCall]
                  if(actionMap) {
                    this.ieamService.addEditorStorage(json, actionMap.mapTo, actionMap.mapTo)
                  }
                  this.ieamService.broadcast({type: Enum.NAVIGATE, to: Navigate.editor, payload: Enum.EDIT_EXCHANGE_FILE})
                })
              }
            })
          }
          else {
            this.showContent()
          }
        } else if(msg.type == Enum.EXCHANGE_CALL_REFRESH) {
          this.content = {}
          this.ieamService.editable = false
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
    if(this.ieamService.selectedCall) {
      this.content = this.ieamService.getContent()
      this.ieamService.editable = Exchange[this.ieamService.selectedCall].editable

      // this.content = this.ieamService.showJsonTree(json.content)
      // setTimeout(() => this.toggleTree(), 500)
      // this.content = prettyHtml(json.content)
    } else if(this.ieamService.selectedLoader) {
      this.content = this.ieamService.getContent()
      this.ieamService.editable = true
    }
    this.ieamService.setTitleText();
  }
  async run(task: string) {
    const json = this.ieamService.getEditorStorage()
    const exchange: IExchange = Exchange[task]
    if(json && json.modified && exchange.editable) {
      const resp:any = await this.ieamService.promptDialog(`${exchange.name}<br>This file is modified, proceed without saving?`, '', {okButton: 'Yes', cancelButton: 'No'})
      if(resp) {
        this.checkB4Calling(exchange.path, exchange)
      }
    } else {
      console.log(task, exchange.path)
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
    // const exchange: IExchange = Exchange.addServiceCert
    // let path = this.tokenReplace(exchange.path, content)
    // this.getPublicKey()
    // .subscribe({
    //   next: (key: any) => {
    //     this.callExchange(path, exchange, {key: key})
    //   }
    // })
  }
  checkB4Calling(path: string, exchange: IExchange) {
    const json:any = this.ieamService.getEditorStorage();
    let content: IService = Object.assign({}, json?.content);
    if(exchange.signature) {
      try {
        if(exchange.signature === 'getPublicKey') {
          this.getPublicKey()
          .subscribe({
            next: (key: any) => {
              let useThis = {key: key}
              this.hasServiceName(path, exchange, content, useThis)
              .subscribe((res: any) =>  this.confirmB4Calling(res.path, exchange, content, useThis))
            }
          })
        } else {
          let services = content.deployment.services
          Object.keys(services).forEach((service) => {
            let ordered = Object.keys(services[service]).sort().reduce((obj, key) => {
              obj[key] = services[service][key]
              return obj
            }, {})
            content.deployment.services[service] = ordered;
          })
          let body: any = content.deployment
          this.ieamService.post(this.method.signDeployment, body)
          .subscribe({
            next: (res) => {
              // content.deploymentSignature = res.signature.replace(/^\s+|\s+$/g, '')
              content.deploymentSignature = res.signature.replace(/[\r\n]/gm, '')
              let services = content.deployment.services
              if(typeof res.deployment === 'string') {
                content.deployment = res.deployment
              }
              this.hasServiceName(path, exchange, content)
              .subscribe((res: any) => {
                this.confirmB4Calling(res.path, exchange, content, {})
                // this.confirmB4Calling(res.path, exchange, content, {}, 'addServiceKey')
              })
            }
          })
        }
      } catch(e) {
        console.log(e)
      }
    } else {
      this.hasServiceName(path, exchange, content)
      .subscribe((res: any) =>  this.confirmB4Calling(res.path, exchange, content))
    }
  }
  checkIfHashNeeded(content) {
    switch(this.ieamService.selectedCall) {
      case 'addNode':
        content.token = this.ieamService.sha256(content.token)
        break
    }
  }
  async confirmB4Calling(path: string, exchange: IExchange, content: IService, useThis: any = {}, cb?: any) {
    let orgId = this.ieamService.selectedOrg
    // this.tempName = ''
    if(/addOrg$|patchNode$/.exec(this.ieamService.selectedCall)) {
      this.tempName = orgId = content.label ? content.label : this.ieamService.nodeId
      path = this.tokenReplace(path, content, orgId)
    } else {
      path = this.tokenReplace(path, content, orgId)
      this.tempName = this.ieamService.getServiceName(content, path)
    }
    let body = Object.keys(useThis).length > 0 ? useThis : content;
    if(!exchange.run && exchange.method != 'GET') {
      const resp:any = await this.ieamService.promptDialog(`${exchange.name}: <br>${this.tempName}`, '', {okButton: 'Yes', cancelButton: 'No'})
      if(resp) {
        if(exchange.callB4) {
          // Check if service exists, if so PUT instead of POST
          let callB4: IExchange = Object.assign({}, Exchange[exchange.callB4]);
          let callB4Path = this.tokenReplace(callB4.path, content, orgId)
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
              if(cb) {
                this[cb](content)
              }
            }
          }))
        } else {
          this.callExchange(path, exchange, body)
        }
      }
    } else if(!/GET$/.exec(exchange.method)) {
      const resp:any = await this.ieamService.promptDialog(`${exchange.name}: <br>${this.tempName}`, '', {okButton: 'Yes', cancelButton: 'No'})
      if(resp) {
        this.callExchange(path, exchange, body)
      }
    } else {
      this.callExchange(path, exchange, body)
    }
  }
  hasServiceName(path: string, exchange: IExchange, content: IService, useThis = {}) {
    return new Observable((observer) => {
      let serviceName = ''
      if(exchange.run || this.ieamService.hasServiceName(content)) {
        if(/{orgId}|{nodeId}|{agId}|{pattern}/.exec(path)) {
          let tokens = path.split('/').filter((t) => t.indexOf('${') == 0)
          let tokenInput: any[] = []
          tokens.forEach((t) => {
            let key = t.replace(/\$|{|}/g, '')
            let name = ''
            if(key == 'orgId') { name = this.ieamService.selectedOrg }
            else if(key == 'nodeId') { name = this.ieamService.nodeId }
            tokenInput.push({key: key, name: name, placeholder: key})
          })
          if(tokenInput.length > 0) {
            this.ieamService.promptDialog(`Please provide the following info`, 'multiple', {extra: tokenInput})
            .then((resp: any) => {
              if(resp) {
                resp.options.extra.forEach((op) => {
                  path = path.replace(UrlToken[op.key], op.name)
                  this.ieamService[op.key] = op.name
                  // if(op.key == 'nodeId') {
                  //   this.ieamService.nodeId = op.key
                  // }
                })
                observer.next({path: path})
                observer.complete()
              } else {
                observer.error()
              }
            })
          }
        }
        else {
          observer.next({path: path})
          observer.complete()
        }
      } else if(/addOrg$/.exec(this.ieamService.selectedCall)) {
        const orgId = content.label
        path = path.replace(UrlToken['orgId'], orgId)
        observer.next({path: path})
        observer.complete()
      } else if(this.ieamService.selectedArch.length == 0) {
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
            observer.next({path: path})
            observer.complete()
          } else {
            observer.error()
          }
        })
      } else {
        const org = this.ieamService.getOrg()
        const arch = this.ieamService.selectedArch
        if(/service$|servicePolicy$|servicePattern$/.exec(exchange.type) && this.ieamService.selectedLoader !== 'topLevelService') {
          this.tempName = `pattern-${org.envVars.SERVICE_NAME}-${arch}`
          // path = path.replace(UrlToken[exchange.type], this.tempName)
        } else if(/deploymentPolicy$|topLevelService$|topLevelServicePattern$/.exec(exchange.type)) {
          this.tempName = `pattern-${org.envVars.MMS_SERVICE_NAME}-${arch}`
          // path = path.replace(UrlToken[exchange.type], this.tempName)
        }
        observer.next({path: path})
        observer.complete()
      }
    })
  }
  tokenReplace(path: string, content: IService, orgId = this.ieamService.selectedOrg) {
    let value = '';
    Object.keys(UrlToken).forEach((key) => {
      if(path.indexOf(UrlToken[key]) >= 0) {
        value = ''
        switch(key) {
          case 'service':
            value = this.ieamService.getServiceName(content, path)
            break;
          case 'keyId':
            value = 'policy-editor'
            break;
          case 'orgId':
            value = orgId
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
  toggleTree() {
    this.elementRef.nativeElement.querySelectorAll('.caret').forEach((el) => {
      el.addEventListener('click', (event) => {
        console.log(event)
        event.currentTarget.parentElement.querySelector(".nested").classList.toggle("active");
        event.currentTarget.classList.toggle("caret-down");
      });
    })
  }
  callExchange(path: string, exchange: IExchange, body: any) {
    // const method = exchange.method ? exchange.method : 'GET'
    // const json:any = this.ieamService.getEditorStorage();
    // let content: IService = json.content;
    // let org: any = this
    // this.checkIfHashNeeded(body)
    this.ieamService.callExchange(path, exchange, body)
    .subscribe({
      next: (res: any) => {
        let html = ''
        if(typeof res == 'string') {
          html = res
        } else {
          // html = this.ieamService.showJsonTree(res)
          html = res
        }
        console.log(html)
        this.content = html ? html : {};
        this.ieamService.editable = exchange.editable == true
        if(exchange.method.toUpperCase() == 'GET' && exchange.editable) {
          this.ieamService.setActiveExchangeFile(this.ieamService.getNodeContent(res)).subscribe(() => '')
        }
        console.log(res)
        // setTimeout(() => this.toggleTree(), 500)
      }, error: (err) => console.log(err)
    })
  }
  ngAfterViewInit() {
    this.ieamService.broadcast({type: Enum.SET_EXCHANGE_CALL});
  }
}
