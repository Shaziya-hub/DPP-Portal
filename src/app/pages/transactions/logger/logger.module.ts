
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { SharedModule } from 'src/app/pages/transactions/shared.module';
//import { LoggerComponent } from "./logger.component";
import { RouterModule } from '@angular/router';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BrowserModule } from '@angular/platform-browser'

@NgModule({

    declarations: [],
    imports: [
    ],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})

export class LoggerModule {

}