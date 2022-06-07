import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, PRIMARY_OUTLET } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IeamService, Broadcast } from '../../services/ieam.service';
import { Breadcrumb } from '../../interface/breadcrumb';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  @Input()
  breadcrumbs: Breadcrumb[] = [];
  bucketName: string = '';
  bucketApi: string = '';
  psAgent!: { unsubscribe: () => void; };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ieamService: IeamService
  ) { }

  ngOnDestroy() {
    if (this.psAgent) {
      this.psAgent.unsubscribe();
    }
  }

  ngOnInit() {
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      // set breadcrumbs
      if(!this.ieamService.isLoggedIn()) {
        return;
      }
      const currentState = this.router.getCurrentNavigation();
      const state: any = currentState ? currentState.extras.state : null;
      if (state) {
        this.bucketName = state.bucketName;
        this.bucketApi = state.bucketApi;
      } else {
        let session: any = this.ieamService.getSession('cos-dashboard');
        if(session) {
          session = JSON.parse(session);
          this.bucketName = session.bucket;
          this.bucketApi = session.api;
        }
      }
      if (!this.bucketApi || !this.bucketName) {
        return;
      }
      this.setBreadcrumb(this.router.routerState.snapshot.url);
    });

    this.psAgent = this.ieamService.broadcastAgent.subscribe((msg: Broadcast) => {
      switch (msg.type) {
        case 'setBreadcrumb':
          this.setBreadcrumb(msg.payload);
          break;
      }
    });
  }

  setBreadcrumb(url: any) {
    let path = '';
    let newCrumbs: any[] = [];
    let tupple = url.replace(/^\/|\/$/g, '').split('/');
    tupple.map((t) => {
      path += `/${t}`;
      newCrumbs.push({label: t, url: path});
    });
    if (newCrumbs.length > 0) {
      this.breadcrumbs = newCrumbs;
    }
  }
}
