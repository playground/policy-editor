import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BucketRoutingModule } from './bucket-routing.module';
import { BucketComponent } from './bucket.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [BucketComponent],
  imports: [
    CommonModule,
    BucketRoutingModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    HttpClientModule
  ]
})
export class BucketModule { }
