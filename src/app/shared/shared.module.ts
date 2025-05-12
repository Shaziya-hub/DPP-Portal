import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ColumnSettingsModalComponent } from '../components/column-settings/column-settings-modal.component';
import { DownloadManagerComponent } from '../components/download-manager/download-manager.component';
//import { ExtRefDetailsModalComponent } from '../components/ext-ref-details/ext-ref-details-modal.component';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { AccessControlFilterComponent } from '../pages/configurations/filters/access-filter/access-control-filter.component';
import { DataGridComponent } from '../pages/transactions/data-grid/data-grid.component';
import { DetailGridComponent } from '../pages/transactions/detail-grid/detail-grid.component';
import { AccountsFilterComponent } from '../pages/transactions/filters/accounts/accounts-filter.component';
import { BatchesFilterComponent } from '../pages/transactions/filters/batches/batches-filter.component';
import { BillsFilterComponent } from '../pages/transactions/filters/bills/bills-filter.component';
import { FiltersComponent } from '../pages/transactions/filters/filters.component';
import { NonSadadFilterComponent } from '../pages/transactions/filters/nonsadad/nonsadad-filter.component';
import { PaymentsFilterComponent } from '../pages/transactions/filters/payments/payments-filter.component';
import { RefundsFilterComponent } from '../pages/transactions/filters/refunds/refunds-filter.component';


@NgModule({
    declarations: [PaginationComponent, DataGridComponent, FiltersComponent, DetailGridComponent, DownloadManagerComponent, ColumnSettingsModalComponent, BillsFilterComponent, NonSadadFilterComponent, AccountsFilterComponent, RefundsFilterComponent, BatchesFilterComponent, PaymentsFilterComponent, AccessControlFilterComponent],
    imports: [CommonModule, NgbPaginationModule, NgbCollapseModule, DxDataGridModule, DxTemplateModule, AngularMultiSelectModule, FormsModule, TranslateModule, OwlDateTimeModule, OwlNativeDateTimeModule],
    exports: [PaginationComponent, DataGridComponent, FiltersComponent, DetailGridComponent, DownloadManagerComponent, ColumnSettingsModalComponent, BillsFilterComponent, NonSadadFilterComponent, AccountsFilterComponent, RefundsFilterComponent, BatchesFilterComponent, PaymentsFilterComponent, AccessControlFilterComponent],
    providers: [],
})
export class SharedModule { }