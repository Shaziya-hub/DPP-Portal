import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentityManagementComponent } from './identityManagement.component';

const routes: Routes = [{ path: '', component: IdentityManagementComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdentityManagementRoutingModule { }
