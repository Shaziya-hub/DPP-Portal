import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxTemplateModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular';
import { UploadsComponent } from './uploads.component';
import { UploadsRoutingModule } from './uploads-routing.module';
import { SharedModule } from './shared.module';

@NgModule({
  declarations: [
    UploadsComponent
  ],
  imports: [
    CommonModule,
    UploadsRoutingModule,
    SharedModule,
    DxTemplateModule,
    DxDataGridModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UploadsModule { }
