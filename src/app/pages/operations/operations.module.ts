import { CommonModule } from '@angular/common';
import { OperationsRoutingModule } from './operations-routing.module';
import { SharedModule } from './shared.module';
import { OperationsComponent } from './operations.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';



@NgModule({
  declarations: [
    OperationsComponent
  ],
  imports: [
    CommonModule,
    OperationsRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class OperationsModule { }
