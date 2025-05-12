import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfigurationsRoutingModule } from './configurations-routing.module';
import { ConfigurationsComponent } from './configurations.component';
import { SharedModule } from './shared.module';



@NgModule({
  declarations: [
    ConfigurationsComponent
  ],
  imports: [
    CommonModule,
    ConfigurationsRoutingModule,
    SharedModule
  ],
})
export class ConfigurationsModule { }
