import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArbCheckoutComponent } from './arbCheckout.component';

const routes: Routes = [{ path: '', component: ArbCheckoutComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArbCheckoutRoutingModule { }