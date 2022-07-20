import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { IeamService, Broadcast } from '../../services/ieam.service';
import { IOption } from '../../models/ieam-model';

export class Option {
  name: string;
  placeholder: string;
  okButton: string;
  cancelButton: string;
  extra: IExtra[];
  loaders: IOption[];
}

interface IExtra {
  key: string;
  name: string;
  placeholder: string;
}
export interface DialogData {
  title: string;
  type: string;
  options: Option;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  notOK = true;
  loaders: IOption[] = [];
  loaderControl = new FormControl('');
  filteredOptions: Observable<IOption[]>;

  constructor(
    private ngZone: NgZone,
    public ieamService: IeamService,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  isOK(val) {
    this.notOK = val.length === 0;
  }
  ok() {
    this.dialogRef.close(this.data);
  }
  ngOnInit() {
    this.loaders = this.data.options.loaders;
    this.filteredOptions = this.loaderControl.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value?.id)),
      map(name => (name ? this.ieamService.optionFilter(name, this.loaders) : this.loaders.slice()))
    )

    if (this.data.type !== 'folder') {
      this.notOK = false;
    } else {
      this.notOK = !this.data.options.name
    }
    if(!this.data.options.okButton) {
      this.data.options.okButton = 'OK'
    }
    if(!this.data.options.cancelButton) {
      this.data.options.cancelButton = 'Cancel'
    }
  }
}
