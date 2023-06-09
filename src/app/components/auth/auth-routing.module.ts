import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthTabsComponent } from './auth-tabs/auth-tabs.component';

const routes: Routes = [
  {
    path: '',
    component:AuthTabsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
