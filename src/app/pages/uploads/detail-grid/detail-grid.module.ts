import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { SharedModule } from 'src/app/pages/transactions/shared.module';
import { DetailGridComponent } from './detail-grid.component';



@NgModule({
  declarations: [
    DetailGridComponent
  ],
  imports: [
    SharedModule,
    DxDataGridModule,
    DxTemplateModule
  ],
  exports: [DetailGridComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DetailGridModule { }
