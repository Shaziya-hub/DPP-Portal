import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FiltersComponent } from './filters/filters.component';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimepickerModule } from 'src/app/components/dateTimepicker/dateTimepicker.module';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
//import { DataGridComponent } from './data-grid/data-grid.component';
import { PaymentsFilterComponent } from './filters/payments-filter/payments-filter.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DashboardPaymentModalComponent } from './payment-modal/payment-modal.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { DashBoardBillComponent } from './filters/bills-filter/bills-filter.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonHeadingModule } from 'src/app/shared/common-heading.module';

@NgModule({

  declarations: [FiltersComponent, PaymentsFilterComponent, DashboardPaymentModalComponent, DashBoardBillComponent],
  imports: [CommonModule, FormsModule, TranslateModule, DateTimepickerModule, PaginationModule, NgbPaginationModule, NgbCollapseModule,
    DxDataGridModule, DxTemplateModule, AngularMultiSelectModule, BsDatepickerModule.forRoot(), GoogleChartsModule.forRoot(), TimepickerModule.forRoot(), NgxSpinnerModule,
    CommonHeadingModule
  ],
  exports: [FiltersComponent, PaymentsFilterComponent, DashboardPaymentModalComponent, DashBoardBillComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DatePipe
  ],

})




export class SharedModule {

}