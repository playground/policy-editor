import { Component, OnInit } from '@angular/core';
import { IeamService } from 'src/app/services/ieam.service';

@Component({
  selector: 'app-active',
  templateUrl: './active.component.html',
  styleUrls: ['./active.component.css']
})
export class ActiveComponent implements OnInit {
  displayColumns = ['name', 'type', 'date'];
  highlightRows: any[] = [];
  dataSource!: any[];
  result!: any[];

  constructor(
    private ieamService: IeamService
  ) { }

  ngOnInit(): void {
    this.showContent(this.ieamService.editorStorage)
  }

  showContent(data: any) {
    this.result = [];
    let activeFiles = Object.keys(data).filter((el) => el != 'original')
    // activeFiles.forEach((key) => {
    //   data[key].map((f: { key: string; date: any; size: any; }) => {
    //     this.result.push({check: false, type: 1, name: this.ieamService.getFilename(f.key), date: f.date});
    //   });

    // })
    // Object.keys(data).map((key) => {
    //   if (key === 'files') {
    //     data[key].map((f: { key: string; date: any; size: any; }) => {
    //       this.result.push({check: false, type: 1, name: this.ieamService.getFilename(f.key), date: f.date});
    //     });
    //   } else {
    //     data[key].map((f: string) => {
    //       if (f.indexOf('\/\/') < 0 && f !== '\/') {
    //         this.result.push({check: false, type: 0, name: this.ieamService.getDirectory(f), directory: f});
    //       }
    //     });
    //   }
    // });
    // this.dataSource = this.result;
  }
}
