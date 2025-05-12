import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/pages/transactions/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
