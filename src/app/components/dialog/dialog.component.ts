import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export class Option {
  name: string;
  placeholder: string;
  okButton: string;
  cancelButton: string;
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
  constructor(
    private ngZone: NgZone,
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
    if (this.data.type !== 'folder') {
      this.notOK = false;
    }
    if(!this.data.options.okButton) {
      this.data.options.okButton = 'OK'
    }
    if(!this.data.options.cancelButton) {
      this.data.options.cancelButton = 'Cancel'
    }
  }

}
