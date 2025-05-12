import { NgModule } from '@angular/core';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { SharedModule } from 'src/app/pages/configurations/shared.module';
import { DataGridComponent } from './data-grid.component';


@NgModule({
  declarations: [
    DataGridComponent
  ],
  imports: [
    SharedModule,
    DxDataGridModule,
    DxTemplateModule,
  ],
  exports: [DataGridComponent]
})
export class DataGridModule { }
