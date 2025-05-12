import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FiltersComponent } from './filters/filters.component';
import { StandardReportsComponent } from './filters/standard/standardreports.component';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimepickerModule } from 'src/app/components/dateTimepicker/dateTimepicker.module';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { DataGridComponent } from './data-grid/data-grid.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DragScrollModule } from 'ngx-drag-scroll';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommonHeadingModule } from 'src/app/shared/common-heading.module';

@NgModule({

  declarations: [FiltersComponent, StandardReportsComponent, DataGridComponent],
  imports: [CommonModule, FormsModule, TranslateModule, DateTimepickerModule, PaginationModule, NgbPaginationModule, NgbCollapseModule,
    DxDataGridModule, DxTemplateModule, DragScrollModule,
    PopoverModule.forRoot(),
    TooltipModule.forRoot(),
    BsDropdownModule,
    ModalModule.forRoot(),
    CommonHeadingModule
  ],
  exports: [FiltersComponent, StandardReportsComponent, DataGridComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DatePipe
  ],

})




export class SharedModule {

}