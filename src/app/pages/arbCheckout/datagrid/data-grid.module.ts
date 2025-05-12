import { CommonModule } from "@angular/common";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgModule } from '@angular/core';

import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { DxDataGridModule, DxDropDownBoxModule, DxTemplateModule } from 'devextreme-angular';
import { RouterModule } from '@angular/router';
import { DataGridComponent } from "./data-grid.component";
import { MethodsComponent } from "../methods/methods.component";
import { CreatePaymentsComponent } from "../createPayment/createPayment.component";
import { ArbSuccessComponent } from "../arbSuccess/arbSuccess.component";
// import { SadadPaymentsComponent } from "../sadadPayment/sadadPayment.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { SadadPaymentsComponent } from "../sadadPayment/sadadPayment.component";



@NgModule({

    declarations: [DataGridComponent, MethodsComponent, CreatePaymentsComponent, ArbSuccessComponent, SadadPaymentsComponent],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        RouterModule,
        DxDataGridModule,
        DxTemplateModule,
        DxDropDownBoxModule,
        NgxSpinnerModule
    ],
    exports: [DataGridComponent, MethodsComponent, CreatePaymentsComponent, ArbSuccessComponent, SadadPaymentsComponent],

})

export class arbDataGridModule {

}