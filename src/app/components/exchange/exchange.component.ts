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

    this.ieamService.broadcastAgent.subscribe(async (msg: any) => {
      if(msg.type == Enum.EXCHANGE_CALL) {
        this.run(msg.payload)
      }
    })
  }
  run(task: string) {
    console.log(task, Exchange[task].url)
  }
  ngAfterViewInit() {
  }
  ngOnDestroy() {
  }

}
