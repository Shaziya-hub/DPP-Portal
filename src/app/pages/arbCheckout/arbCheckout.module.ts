import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
//import { DataGridComponent } from "./datagrid/data-grid.component";
import { ArbCheckoutComponent } from "./arbCheckout.component";
import { arbDataGridModule } from "./datagrid/data-grid.module";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ArbCheckoutRoutingModule } from "./arbCheckout-routing.module";

@NgModule({

    declarations: [ArbCheckoutComponent],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        arbDataGridModule,
        ArbCheckoutRoutingModule

    ],
    exports: [ArbCheckoutComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
        DatePipe
    ]

})

export class ArbCheckoutModule {

}