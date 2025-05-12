import { CommonModule, DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { FiltersComponent } from './filters/filters.component';
import { PaymentsFilterComponent } from './filters/payments-filter/payments-filter.component';
import { DataGridComponent } from './data-grid/data-grid.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridModule, DxDropDownBoxModule } from 'devextreme-angular';
import { DxTemplateModule } from 'devextreme-angular';
import { DxSwitchModule } from 'devextreme-angular';
import { HttpClientModule } from '@angular/common/http';
import { ReconciliationSummaryComponent } from './filters/reconciliation-summary/reconciliation-summary.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DateTimepickerModule } from 'src/app/components/dateTimepicker/dateTimepicker.module';
import { LogsUIFilterComponent } from './filters/logs-filter/logsUI-filter.component';
import { DetailGridComponent } from './detail-grid/detail-grid.component';
import { DragScrollModule } from 'ngx-drag-scroll';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CommonHeadingModule } from 'src/app/shared/common-heading.module';
import { EnterPriceLogsFilterComponent } from './filters/enterpriceLogs/enterpriceLogs-filter.component';
import { ReconLoggerComponent } from './reconlogger/reconlogger.component';
import { ClickOutsideModule } from 'ng4-click-outside';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({

  declarations: [FiltersComponent, PaymentsFilterComponent, DataGridComponent, DetailGridComponent, ReconciliationSummaryComponent, LogsUIFilterComponent, EnterPriceLogsFilterComponent, ReconLoggerComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularMultiSelectModule, FormsModule, TranslateModule,
    PaginationModule, NgbPaginationModule, NgbCollapseModule, DxDataGridModule, DxTemplateModule, DxSwitchModule, HttpClientModule,
    DateTimepickerModule, DragScrollModule, BsDropdownModule, DragScrollModule, BsDropdownModule.forRoot(), ClickOutsideModule, DxDropDownBoxModule, ModalModule.forRoot(), NgxSpinnerModule, CommonHeadingModule
  ],

  exports: [FiltersComponent, PaymentsFilterComponent, DataGridComponent, DetailGridComponent, LogsUIFilterComponent, EnterPriceLogsFilterComponent, ReconLoggerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [
    DatePipe

  ],

})

export class SharedModule {

}