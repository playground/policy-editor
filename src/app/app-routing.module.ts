import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';
import { ExchangeComponent } from './components/exchange/exchange.component';
import { HomeComponent } from './components/home/home.component';
import { SigninComponent } from './components/signin/signin.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'bucket',
    children: [{
      path: '**',
      loadChildren: () => import('./modules/bucket/bucket.module').then(m => m.BucketModule)
    }]
  },
  { path: 'editor', component: EditorComponent },
  { path: 'exchange', component: ExchangeComponent },
  { path: 'signin', component: SigninComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
