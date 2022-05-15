import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { IeamService } from '../../services/ieam.service';
import { Enum } from '../../models/ieam-model';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  isWallet = () => typeof (window as any).ethereum !== 'undefined';

  constructor(
    public ieamService: IeamService,
  ) { }

  ngOnInit(): void {
    this.ieamService.broadcastAgent.subscribe((data: any) => {
      if(data.type == Enum.LOGGED_IN || data.type == Enum.LOGGED_OUT) {
      }
    })
  }

  logIn() {
    this.ieamService.logIn()
  }

}
