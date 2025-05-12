import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IdentityManagementRoutingModule } from './identityManagement-routing.module';
import { IdentityManagementComponent } from './identityManagement.component';
import { SharedModule } from './shared.module';



@NgModule({
  declarations: [
    IdentityManagementComponent
  ],
  imports: [
    CommonModule,
    IdentityManagementRoutingModule,
    SharedModule
  ],
})
export class IdentityManagementModule { }
