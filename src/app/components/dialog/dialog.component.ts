import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  type: string;
  name: string;
  placeholder: string;
  path: string;
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
  }

}
