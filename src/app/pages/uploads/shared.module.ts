import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { DataGridComponent } from './data-grid/data-grid.component';
import { DetailGridComponent } from './detail-grid/detail-grid.component';
import { SadadFilterComponent } from './filters/sadad/sadad-filter.component';
import { BillFilterComponent } from './filters/bill-filter/bill-filter.component';
import { AccountsFilterComponent } from './filters/accounts-filter/accounts-filter.component';
import { UploadFilterComponent } from './filters/upload-filter.component';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DateTimepickerModule } from 'src/app/components/dateTimepicker/dateTimepicker.module';
import { DragScrollModule } from 'ngx-drag-scroll';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CommonHeadingModule } from 'src/app/shared/common-heading.module';

@NgModule({
    declarations: [
        SadadFilterComponent,
        UploadFilterComponent,
        DataGridComponent,
        DetailGridComponent,
        BillFilterComponent,
        AccountsFilterComponent

    ],
    imports: [
        CommonModule,
        NgbPaginationModule,
        NgbCollapseModule,
        DxDataGridModule,
        DxTemplateModule,
        AngularMultiSelectModule,
        FormsModule,
        TranslateModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        PaginationModule,
        DragScrollModule,
        DateTimepickerModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule,
        CommonHeadingModule
    ],
    exports: [SadadFilterComponent, UploadFilterComponent, DataGridComponent, DetailGridComponent, BillFilterComponent, AccountsFilterComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],  //it is used when you get element not known error on the  <selector>
    providers: [
        DatePipe

    ],
})

export class SharedModule {

}