import { NgModule } from "@angular/core";
import { ManualRefundsComponent } from "./filters/manual-refunds/manual-refunds.component";
import { CommonModule, DatePipe } from "@angular/common";
import { FiltersComponent } from "./filters/filters.component";
import { DataGridComponent } from "./data-grid/data-grid.component";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { DateTimepickerModule } from "src/app/components/dateTimepicker/dateTimepicker.module";
import { DxDataGridModule } from "devextreme-angular";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { PaginationModule } from "src/app/shared/pagination.module";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RefundProcessComponent } from "./filters/refund-process/refund-process.component";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { GenerateInvoicesComponent } from "./filters/generate-invoices/generate-invoices.component";
import { CommonHeadingModule } from "src/app/shared/common-heading.module";
import { GenerateInvoiceModalComponent } from "./generate-invoice-modal/generate-invoice-modal.component";
import { GenerateInvoiceModalService } from "./generate-invoice-modal/genereate-invoice-modal.service";

@NgModule({
    declarations: [ManualRefundsComponent, FiltersComponent, DataGridComponent, RefundProcessComponent, GenerateInvoicesComponent, GenerateInvoiceModalComponent],
    imports: [CommonModule, FormsModule, TranslateModule, AngularMultiSelectModule, DateTimepickerModule, DxDataGridModule, BsDropdownModule.forRoot(), PaginationModule, NgbTooltipModule, CommonHeadingModule],
    exports: [ManualRefundsComponent, FiltersComponent, DataGridComponent, RefundProcessComponent, GenerateInvoiceModalComponent],
    providers: [DatePipe, GenerateInvoiceModalService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SharedModule {

}