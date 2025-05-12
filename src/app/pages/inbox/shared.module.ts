import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { FiltersComponent } from "./filters/filters.component";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { DateTimepickerModule } from "src/app/components/dateTimepicker/dateTimepicker.module";
import { DxDataGridModule } from "devextreme-angular";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { PaginationModule } from "src/app/shared/pagination.module"
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RejectionModalService } from "./rejection-modal/rejection-modal-service.service";
import { RejectionModalComponent } from "./rejection-modal/rejection-modal.component";
import { RefundsComponent } from "./filters/refunds/refunds.component";
import { CommonHeadingModule } from "src/app/shared/common-heading.module";


@NgModule({
    declarations: [FiltersComponent, RejectionModalComponent, RefundsComponent],
    imports: [CommonModule, FormsModule, TranslateModule, AngularMultiSelectModule, DateTimepickerModule, DxDataGridModule, BsDropdownModule.forRoot(), PaginationModule, CommonHeadingModule],
    exports: [FiltersComponent, RejectionModalComponent, RefundsComponent],
    providers: [DatePipe, RejectionModalService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})

export class SharedModule {

}