import { CommonModule, DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { FiltersComponent } from './filters/filters.component';
import { PaymentsFilterComponent } from './filters/payments-filter/payments-filter.component';
import { DataGridComponent } from './data-grid/data-grid.component';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridModule } from 'devextreme-angular';
import { DxTemplateModule } from 'devextreme-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ClickOutsideModule } from 'ng4-click-outside';
import { DateTimepickerModule } from 'src/app/components/dateTimepicker/dateTimepicker.module';
import { DragScrollModule } from 'ngx-drag-scroll';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CommonHeadingModule } from 'src/app/shared/common-heading.module';

@NgModule({

  declarations: [FiltersComponent, PaymentsFilterComponent, DataGridComponent],
  imports: [CommonModule, FormsModule, AngularMultiSelectModule, FormsModule, TranslateModule,
    PaginationModule, NgbPaginationModule, NgbCollapseModule, DxDataGridModule, DxTemplateModule, NgbModule, ReactiveFormsModule, BsDatepickerModule, TimepickerModule,
    ClickOutsideModule, DateTimepickerModule, DragScrollModule, BsDropdownModule, CommonHeadingModule],
  exports: [FiltersComponent, PaymentsFilterComponent, DataGridComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DatePipe

  ],

})

export class SharedModule {

}