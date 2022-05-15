import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Enum, Navigate } from './models/ieam-model';
import { IeamService } from './services/ieam.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  to = Navigate;
  login = 'login'
  titleText = 'IEAM'

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ieamService: IeamService,
    private observer: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.ieamService.broadcastAgent.subscribe((data: any) => {
      if(data.type == Enum.NAVIGATE) {
        this.router.navigate([`/${data.to}`])
      } else if(data.type == Enum.JSON_LOADED) {

      }
    })
  }

  isLoggedIn() {
    return !this.ieamService.isLoggedIn()
  }
  toggle(sidenav: any) {
    if(this.sidenav.mode = 'over') {
      sidenav.toggle()
    }
  }
  navigate(to: string) {
    this.ieamService.broadcast({type: Enum.NAVIGATE, to: to})
  }
}
