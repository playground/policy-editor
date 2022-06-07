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
  titleText = 'IEAM'
  lock = 'lock'
  loginStatus = ''
  filename = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public ieamService: IeamService,
    private observer: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.setValues()
    this.ieamService.broadcastAgent.subscribe((data: any) => {
      if(data.type == Enum.NAVIGATE) {
        this.setValues()
        this.router.navigate([`/${data.to}`], {queryParams: data.payload})
      } else if(data.type == Enum.LOGGED_IN) {
        this.setValues()
      }
    })
  }

  setValues() {
    this.ieamService.signIn()
    this.editFilename()
    this.loginText()
  }

  isBucket() {
    return location.pathname.indexOf('/bucket/') >= 0
  }
  showButtons() {
    return location.pathname.match(/\/bucket\/|\/editor|\exchange/)
    // return location.pathname.indexOf('/bucket/') >= 0 || location.pathname.indexOf('/editor') >= 0
  }
  isEditor() {
    return location.pathname.indexOf('/editor') >= 0
  }
  editFilename() {
    this.filename = this.ieamService.getCurrentFilename()
  }
  isLoggedIn() {
    return !this.ieamService.isLoggedIn()
  }
  toggle(sidenav: any) {
    if(this.sidenav.mode = 'over') {
      sidenav.toggle()
    }
  }
  loginText() {
    setTimeout(() => {
      this.lock = this.ieamService.isLoggedIn() ? 'lock_open' : 'lock'
    }, 0)
    this.loginStatus = this.ieamService.isLoggedIn() ? 'Logout' : 'Login'
  }
  navigate(to: string) {
    this.ieamService.broadcast({type: Enum.NAVIGATE, to: to})
  }
  login(evt: any) {
    if(this.loginStatus === 'Logout') {
      this.ieamService.logOut()
    }
    this.navigate(Navigate.signin)
  }
}
