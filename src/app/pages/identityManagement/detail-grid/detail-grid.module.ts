import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { DetailGridComponent } from './detail-grid.component';
import { SharedModule } from '../shared.module';



@NgModule({
  declarations: [
    DetailGridComponent
  ],
  imports: [
    DxDataGridModule,
    DxTemplateModule,
    SharedModule
  ],
  exports: [DetailGridComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DetailGridModule { }
