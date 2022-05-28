import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd} from '@angular/router';
import { Enum, Navigate } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, AfterViewInit {

  constructor(
    private route: ActivatedRoute,
    private ieamService: IeamService
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      if(!this.route.snapshot.queryParamMap.get('fromMenu')) {
        this.ieamService.broadcast({type: Enum.NOT_EXCHANGE, payload: false});
      }
    })

  }
  ngAfterViewInit() {
  }

}
