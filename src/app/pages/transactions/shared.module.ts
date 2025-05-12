import { CommonModule, DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DxDataGridModule, DxDropDownBoxModule, DxTemplateModule } from 'devextreme-angular';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ColumnSettingsModalComponent } from '../../components/column-settings/column-settings-modal.component';
import { DownloadManagerComponent } from '../../components/download-manager/download-manager.component';
import { DataGridComponent } from './data-grid/data-grid.component';
import { DetailGridComponent } from './detail-grid/detail-grid.component';
import { AccountsFilterComponent } from './filters/accounts/accounts-filter.component';
import { BatchesFilterComponent } from './filters/batches/batches-filter.component';
import { BillsFilterComponent } from './filters/bills/bills-filter.component';
import { FiltersComponent } from './filters/filters.component';
import { NonSadadFilterComponent } from './filters/nonsadad/nonsadad-filter.component';
import { PaymentsFilterComponent } from './filters/payments/payments-filter.component';
import { RefundsFilterComponent } from './filters/refunds/refunds-filter.component';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { DateTimepickerModule } from 'src/app/components/dateTimepicker/dateTimepicker.module';
import { DragScrollModule } from 'ngx-drag-scroll';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ClickOutsideModule } from 'ng4-click-outside';
import { LoggerComponent } from './logger/logger.component';
//import { LoggerModule } from './logger/logger.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonHeadingModule } from 'src/app/shared/common-heading.module';
import { EInvoicesComponent } from './filters/e-invoices/e-invoices.component';
import { PayoutsFilterComponent } from './filters/payouts-filter/payouts-filter.component';
import { PayrollsComponent } from './filters/payrolls/payrolls.component';





@NgModule({
    declarations: [LoggerComponent,
        DataGridComponent, FiltersComponent, DetailGridComponent, DownloadManagerComponent, ColumnSettingsModalComponent, BillsFilterComponent, NonSadadFilterComponent, AccountsFilterComponent, RefundsFilterComponent, BatchesFilterComponent, PaymentsFilterComponent, EInvoicesComponent,PayoutsFilterComponent,PayrollsComponent],
    imports: [CommonModule, NgbPaginationModule, NgbCollapseModule, DxDataGridModule, DxTemplateModule, AngularMultiSelectModule, FormsModule, TranslateModule, OwlDateTimeModule, OwlNativeDateTimeModule, PaginationModule, DateTimepickerModule, DragScrollModule, BsDropdownModule.forRoot(), ClickOutsideModule, DxDropDownBoxModule, ModalModule.forRoot(), NgxSpinnerModule, CommonHeadingModule],
    exports: [LoggerComponent,
        DataGridComponent, FiltersComponent, DetailGridComponent, DownloadManagerComponent, ColumnSettingsModalComponent, BillsFilterComponent, NonSadadFilterComponent, AccountsFilterComponent, RefundsFilterComponent, BatchesFilterComponent, PaymentsFilterComponent, EInvoicesComponent,PayoutsFilterComponent,PayrollsComponent],
    providers: [
        DatePipe

    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],

})
export class SharedModule {

}