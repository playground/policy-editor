import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './modules/material/material.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './components/editor/editor.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgJsonEditorModule } from '../../ang-jsoneditor/src/public_api';
import { DialogComponent } from './components/dialog/dialog.component';
import { HomeComponent } from './components/home/home.component';
import { SigninComponent } from './components/signin/signin.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ButtonsComponent } from './components/buttons/buttons.component';
import { ExchangeComponent, SanitizeHtmlPipe } from './components/exchange/exchange.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ActiveComponent } from './components/active/active.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    DialogComponent,
    HomeComponent,
    SigninComponent,
    BreadcrumbComponent,
    ButtonsComponent,
    ExchangeComponent,
    SanitizeHtmlPipe,
    ActiveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgJsonEditorModule,
    NgxJsonViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
