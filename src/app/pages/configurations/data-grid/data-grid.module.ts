import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { SharedModule } from 'src/app/pages/configurations/shared.module';
import { DetailGridModule } from '../detail-grid/detail-grid.module';
import { DataGridComponent } from './data-grid.component';


@NgModule({
  declarations: [
    DataGridComponent
  ],
  imports: [
    SharedModule,
    DxDataGridModule,
    DxTemplateModule,
    DetailGridModule
  ],
  exports: [DataGridComponent]
})
export class DataGridModule { }
