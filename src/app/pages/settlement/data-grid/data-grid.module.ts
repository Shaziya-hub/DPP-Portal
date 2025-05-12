import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { SharedModule } from 'src/app/pages/transactions/shared.module';
import { DataGridComponent } from './data-grid.component';

@NgModule({
    declarations: [
        DataGridComponent
    ],
    imports: [
        SharedModule,
        DxDataGridModule,
        DxTemplateModule
    ],
    exports: [DataGridComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class DataGridModule { }
