import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { IeamService } from '../../services/ieam.service';
import { Enum, Navigate } from '../../models/ieam-model';
import MetaMaskOnboarding from '@metamask/onboarding';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit, OnDestroy {
  @ViewChild('login', { static: false, read: ElementRef})
  loginButton: ElementRef;
  loginHtml = 'Log in with <span>MetaMask</span>';
  isWallet = () => typeof (window as any).ethereum !== 'undefined';
  psAgent!: { unsubscribe: () => void; };

  constructor(
    public ieamService: IeamService,
  ) { }

  ngOnInit(): void {
    this.hasMetaMask()
    this.psAgent = this.ieamService.broadcastAgent.subscribe((data: any) => {
      if(data.type == Enum.LOGGED_IN) {
        setTimeout(() => {
          this.ieamService.broadcast({type: Enum.NAVIGATE, to: Navigate.exchange})
        }, 2000)
      } else if(data.type == Enum.LOGGED_OUT) {

      } else if(data.type == Enum.INSTALL_METAMASK) {
        console.log('install metamask')
        this.loginHtml = 'Click here to install <span>MetaMask</span>';
      }
    })
  }

  ngOnDestroy() {
    if (this.psAgent) {
      this.psAgent.unsubscribe();
    }
  }
  hasMetaMask() {
    if(!this.ieamService.isMetaMaskInstalled()) {
      this.loginHtml = 'Click here to install <span>MetaMask</span>';
    } else {
      this.loginHtml = 'Log in with <span>MetaMask</span>';
    }
    return this.loginHtml
  }

  logIn() {
    if(this.loginHtml.indexOf('Click here to install') == 0) {
      const onboarding = new MetaMaskOnboarding();
      onboarding.startOnboarding()

    } else {
      this.ieamService.logIn()
    }
  }

}
