import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Enum, Navigate } from '../../models/ieam-model';
import { IeamService } from 'src/app/services/ieam.service';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, AfterViewInit {

  constructor(
    private ieamService: IeamService
  ) { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.ieamService.broadcast({type: Enum.NOT_EXCHANGE, payload: false});
    }, 0)
  }

}
