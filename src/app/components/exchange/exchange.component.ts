import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd} from '@angular/router';
import { Enum, Navigate, Exchange } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, AfterViewInit, OnDestroy {
  content: string = '';
  constructor(
    private route: ActivatedRoute,
    private ieamService: IeamService
  ) { }

  ngOnInit(): void {
    if(!this.ieamService.signIn('/exchange')) {
      return
    }
    this.route.data.subscribe((data) => {
    })
    this.ieamService.broadcastAgent.subscribe({
      next: async (msg: any) => {
        if(msg.type == Enum.EXCHANGE_CALL) {
          this.run(msg.payload)
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
  run(task: string) {
    console.log(task, Exchange[task].url)
    this.ieamService.getCall(Exchange[task].url)
    .subscribe({
      next: (res: any) => {
        let html = ''
        if(typeof res == 'string') {
          html = res
        } else {
          Object.keys(res).forEach((key) => {
            html += `${key}: ${res[key]}<br>`
          })
        }
        this.content = html;
        console.log(res)
      }, error: (err) => console.log(err)
    })
  }
  ngAfterViewInit() {
  }
  ngOnDestroy() {
  }
}
