import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DxDataGridModule, DxDropDownBoxModule, DxTemplateModule } from 'devextreme-angular';
import { SharedModule } from 'src/app/pages/transactions/shared.module';
import { DetailGridModule } from '../detail-grid/detail-grid.module';
import { DataGridComponent } from './data-grid.component';



@NgModule({
  declarations: [
    DataGridComponent,

  ],
  imports: [
    SharedModule,
    DxDataGridModule,
    DxTemplateModule,
    DetailGridModule,
    DxDropDownBoxModule
  ],
  exports: [DataGridComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DataGridModule { }

platformBrowserDynamic().bootstrapModule(DataGridModule);
