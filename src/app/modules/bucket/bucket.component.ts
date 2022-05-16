import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { forkJoin, Observable, Subscription, zip } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IeamService, Broadcast } from '../../services/ieam.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { Enum, Navigate } from '../../models/ieam-model';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css']
})
export class BucketComponent implements OnInit, OnDestroy {
  bucketName = 'ieam-labs'; // 's-dev.w-x.co'; // 'intellicast';
  bucketApi = 'https://ieam-action-prod.fux62nioj9a.us-south.codeengine.appdomain.cloud/'; // 'c4110d5ff704485dc3cd42f1cf6c6bb49ce75e748ddee3e56abacd327c8c880d/cosapi/';
  // '646d429a9e5f06572b1056ccc9f5ba4de6f5c30159f10fcd1f1773f58d35579b/cosapi/'
  bucketBase = '/bucket';
  filePath!: string;
  currentRoute!: string;
  result!: any[];
  fileType = ['folder', 'receipt'];
  displayColumns = ['check', 'type', 'name', 'size', 'date'];
  highlightRows: any[] = [];
  dataSource!: any[];
  checkAll = false;
  gateway =  ''; //'https://openwhisk.ng.bluemix.net/api/v1/web/';
  // gateway = 'https://service.us.apiconnect.ibmcloud.com/gws/apigateway/api/';
  routerObserver: Subscription;
  method = {
    list: '?action=list',
    post: 'post'
  };
  dialogRef?: MatDialogRef<DialogComponent, any>;
  psAgent!: { unsubscribe: () => void; };
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: IeamService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.routerObserver = this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.currentRoute = this.router.routerState.snapshot.url;
      let directory = '';
      if (this.currentRoute !== this.bucketBase) {
        const currentState = this.router.getCurrentNavigation();
        const state: any = currentState ? currentState.extras.state : null;
        if (state) {
          this.bucketName = state.bucketName;
          this.bucketApi = state.bucketApi;
        } else {
          let session: any = this.appService.getSession('cos-dashboard');
          if(session) {
            session = JSON.parse(session);
            this.bucketName = session.bucket;
            this.bucketApi = session.api;
          }
        }
        if (this.appService.selectedRow) {
          directory = `&directory=${this.appService.selectedRow.directory}`;
          this.appService.selectedRow = null;
        } else {
          directory = this.getCurrentDirectory();
        }
        if (this.bucketApi && this.bucketName) {
          this.listAssets('&delimiter=/', directory);
        } else {
          this.router.navigateByUrl('');
        }
      }
    });
  }

  ngOnInit() {
    this.noneSelected();
    this.result = [];
    this.psAgent = this.appService.broadcastAgent.subscribe((msg: any) => {
      console.log(msg, msg.type)
      if(msg.type == Enum.NAVIGATE) {
        this.router.navigate([`/${msg.to}`])
      } else {
        switch (msg.type) {
          case 'delete':
            this.delete();
            break;
          case 'upload':
            this.upload(msg.payload);
            break;
          case 'changeAccess':
            this.changeAccess(msg.payload);
            break;
          case 'folder':
            this.folder();
            break;
          case 'jumpTo':
            this.jumpTo();
            break;
        }
      }
    });
    if(!this.appService.signIn()) {
      return
    }
  }

  ngOnDestroy() {
    delete this.dialogRef;
    if (this.psAgent) {
      this.psAgent.unsubscribe();
    }
    this.routerObserver.unsubscribe();
  }

  getCurrentDirectory() {
    const basePath = `${this.bucketBase}/${this.bucketName}`;
    let directory = basePath === this.currentRoute ? '' : this.currentRoute.replace(`${basePath}/`, '');
    if (directory.length > 0) {
      const filePath = `&directory=${directory}` + (directory[directory.length - 1] !== '/' ? '/' : '');
      directory = filePath;
    }
    return directory;
  }

  getBucket() {
    console.log(this.bucketName);
    this.appService.setSession('cos-dashboard', JSON.stringify({bucket: this.bucketName, api: this.bucketApi}));
    this.router.navigateByUrl(`${this.bucketBase}/${this.bucketName}`,
      {state: {bucketName: this.bucketName, bucketApi: this.bucketApi}});
  }

  listAssets(delimiter = '', directory = '') {
    this.appService.get(`${this.bucketApi}${this.method.list}${delimiter}${directory}&bucket=${this.bucketName}`)
    .subscribe((data: any) => {
      this.result = [];
      Object.keys(data).map((key) => {
        if (key === 'files') {
          data[key].map((f: { key: string; date: any; size: any; }) => {
            this.result.push({check: false, type: 1, name: this.appService.getFilename(f.key), date: f.date, size: this.getSize(f.size)});
          });
        } else {
          data[key].map((f: string) => {
            if (f.indexOf('\/\/') < 0 && f !== '\/') {
              this.result.push({check: false, type: 0, name: this.appService.getDirectory(f), directory: f});
            }
          });
        }
      });
      this.dataSource = this.result;
      this.noneSelected();
      this.appService.broadcast({
        type: 'setBreadcrumb',
        payload: location.pathname
      });
  });
  }

  getSize(size: string) {
    return parseInt(size, 10) >= 1000 ? `${(parseInt(size) / 1000).toFixed(1)}k` : size;
  }

  selectRow(row: any) {
    this.highlightRows = [row];
  }

  fetchRow(row: { type: any; directory: any; name: string}) {
    if(row.type === this.appService.fileType.getEnum('DIRECTORY')) {
      this.appService.selectedRow = row;
      // this.router.navigate([`bucket/${this.bucketName}/${row.directory}`]);
      this.router.navigateByUrl(`${this.bucketBase}/${this.bucketName}/${row.directory}`,
      {state: {bucketName: this.bucketName, bucketApi: this.bucketApi}});
    } else if(row.type === this.appService.fileType.getEnum('FILE')) {
      this.appService.getSignedUrl(row.name, this.bucketName)
      .subscribe((res: any) => console.log(res.url))
    }
  }

  broadcast(type: string, payload: boolean) {
    this.appService.broadcast({
      type: type,
      payload: payload
    });
  }

  noneSelected() {
    if (this.result) {
      const found = this.result.filter((res) => res.check);
      this.broadcast('noneSelected', found.length === 0);
      this.broadcast('noBucket', false);
    } else {
      this.broadcast('noneSelected', true);
      this.broadcast('noBucket', true);
    }
  }

  checkItem(row: { check: any; name: any; }, event: { checked: any; }) {
    row.check = event.checked;
    let num = this.result.filter((res) => {
      if (res.name === row.name) {
        res.check = event.checked;
      }
      return res.check;
    });
    this.checkAll = num.length === this.result.length;
    this.noneSelected();
  }

  checkAllItem(event: { checked: any; }) {
    this.checkAll = true;
    this.result.map((res) => res.check = event.checked);
    this.noneSelected();
  }

  refreshItems() {
    this.listAssets('&delimiter=/', this.getCurrentDirectory());
  }

  openDialog(payload: { title: string; type: string; placeholder?: string; }, cb: { (resp: any): void; (resp: any): void; (resp: any): void; (arg0: any): void; }): void {
    this.dialogRef = this.dialog.open(DialogComponent, {
      hasBackdrop: false,
      width: '350px',
      height: '250px',
      data: payload
    });

    this.dialogRef.afterClosed().subscribe((result: any) => {
      cb(result);
      this.dialog.closeAll();
    });
  }

  delete() {
    console.log('delete');
    let dir: any[] = [];
    let file: any[] = [];
    const found = this.result.filter((res: any) => {
      if (res.check && res.name.length > 0) {
        if (res.type === 0) {
          dir.push(res);
        } else {
          file.push(res);
        }
        return true;
      } else {
        return false;
      }
    });
    let msg = dir.length > 0 ? `${dir.length} folder(s)` : '';
    msg += file.length > 0 ? `& ${file.length} file(s)` : '';
    this.openDialog({title: `Deleting ${msg}.  Are you sure?`, type: 'delete'}, (resp: any) => {
      if (resp) {
        if (found.length > 0) {
          let filename: unknown[] = [];
          let dirname: unknown[] = [];
          const regex = new RegExp(`${this.bucketBase}/${this.bucketName}/?`);
          const path = this.currentRoute.replace(regex, '').replace(/\/$/, '');
          file.forEach((f) => {
            filename.push(path.length > 0 ? `${path}/${f.name}` : f.name);
          });
          dir.forEach((f) => {
            if (f.name.length > 0) {
              dirname.push(path.length > 0 ? `${path}/${f.name}` : f.name);
            }
          });
          if (filename.length > 0) {
            let options = {
              bucket: this.bucketName,
              filename: filename,
              method: 'delete'
            };
            this.appService.post(`${this.gateway}${this.bucketApi}${this.method.post}`, options)
            .subscribe({
              next: (data: any) => {
                this.showSnackBar(data.result, 'Rock');
                this.checkAll = false;
                this.result.map((res) => res.check = false);
                this.refreshItems();
              },
              error: (error: any) => this.showSnackBar(error, 'Rock')
            });
          }
          if (dirname.length > 0) {
            let options = {
              bucket: this.bucketName,
              directory: dirname,
              method: 'deleteFolder'
            };
            this.appService.post(`${this.gateway}${this.bucketApi}${this.method.post}`, options)
            .subscribe({
              next: (data: any) => {
                this.showSnackBar(data.result, 'Rock');
                this.checkAll = false;
                this.result.map((res) => res.check = false);
                this.refreshItems();
              },
              error: (error: any) => this.showSnackBar(error, 'Rock')
            });
          }
        }
      }
    });
  }

  showSnackBar(message: string, action: string | undefined) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  changeAccess(type = 'private') {
    let filename: string[] = [];
    const regex = new RegExp(`${this.bucketBase}/${this.bucketName}/?`);
    const path = this.currentRoute.replace(regex, '');
    this.dataSource.forEach((el) => {
      if (el.check) {
        filename.push(path.length > 0 ? `${path}${el.name}` : el.name);
      }
    });
    if (filename.length > 0) {
      let options = {
        bucket: this.bucketName,
        filename: filename,
        method: type === 'public' ? 'makePublic' : 'makePrivate'
      };
      this.appService.post(`${this.gateway}${this.bucketApi}${this.method.post}`, options)
      .subscribe({
        next: (data: any) => {
          this.showSnackBar(data.result, 'Rock');
          this.checkAll = false;
          this.result.map((res) => res.check = false);
          this.noneSelected();
        },
        error: (error: any) => this.showSnackBar(error, 'Rock')
      });
    }
  }

  folder() {
    this.openDialog({title: `What is the name of the new folder?`, type: 'folder', placeholder: 'Folder name'}, (resp: { name: string; }) => {
      if (resp) {
        console.log(resp);
        const regex = new RegExp(`${this.bucketBase}/${this.bucketName}/?`);
        const path = this.currentRoute.replace(regex, '').replace(/\/+$/, '');
        let directory = resp.name.replace(/\//g, '');
        let options = {
          bucket: this.bucketName,
          acl: 'public-read',
          directory: path.length > 0 ? `${path}/${directory}/placeholder.txt` : `${directory}/placeholder.txt`,
          method: 'makeFolder'
        };
        this.appService.post(`${this.gateway}${this.bucketApi}${this.method.post}`, options)
        .subscribe({
          next: (data: any) => {
            this.showSnackBar(data.result, 'Rock');
            this.checkAll = false;
            this.result.map((res) => res.check = false);
            this.refreshItems();
          },
          error: (error: any) => this.showSnackBar(error, 'Rock')
        });
      }
    });
  }

  jumpTo() {
    this.openDialog({title: `Specify absolute path to folder?`, type: 'folder', placeholder: 'Folder name'}, (resp: { name: string; }) => {
      if (resp) {
        console.log(resp);
        let directory = `${resp.name.replace(/\/S/, '')}`;
        this.currentRoute = directory.replace(/[^\/]+$/, '');
        let url = `${this.bucketBase}/${this.bucketName}/${directory}/`;
        this.router.navigateByUrl(url,
        {state: {bucketName: this.bucketName, bucketApi: this.bucketApi}});
        this.appService.broadcast({
          type: 'setBreadcrumb',
          payload: url
        });
      }
    });
  }

  upload(event: { target: { files: any; }; }) {
    let $upload: any = {};
    let $files: any = {};
    const opts = {'Content-Type': 'application/x-www-form-urlencoded'};
    const regex = new RegExp(`${this.bucketBase}/${this.bucketName}/?`);
    const path = this.currentRoute.replace(regex, '');
    const files = event.target.files;
    for (let i = files.length - 1; i >= 0; i--) {
      $files[files[i]] = this.readFile(path, files[i]);
    }
    forkJoin($files)
    .subscribe((res: any) => {
      res.forEach((data: any, idx: number) => {
        $upload[idx] = this.appService.post(`${this.gateway}${this.bucketApi}${this.method.post}`, data);
      });
      forkJoin($upload)
      .subscribe({
        next: (data: any) => {
          this.showSnackBar(`${data.length} file(s) uploaded.`, 'Rock');
          this.refreshItems();
        },
        error: (error: any) => this.showSnackBar(error, 'Rock')
      });
    });
  }

  readFile(path: string | any[], file: any) {
    const reader = new FileReader();
    const formData = new FormData();
    let data = {
      bucket: this.bucketName,
      method: 'upload',
      filename: path.length > 0 ? `${path}/${file.name}` : file.name,
      acl: 'public-read'
    };
    data.filename = data.filename.replace(/\/\//g, '\/');
    return new Observable((observer: { next: (arg0: FormData) => void; complete: () => void; }) => {
      reader.onload = (e: any) => {
        formData.append('file', e.target.result);
        formData.append('config', JSON.stringify(data));
        observer.next(formData);
        observer.complete();
      };
      reader.onloadend = (e) => {
        console.log(reader);
      };
      reader.readAsDataURL(file);
    });
  }
}
