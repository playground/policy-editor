import { NgModule } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  exports: [
    // Material
    FormsModule,
    MatTableModule,
    MatToolbarModule,
    MatButtonModule,
    MatSelectModule,
    MatSidenavModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatCheckboxModule
  ]
})
export class MaterialModule {}