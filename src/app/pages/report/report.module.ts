import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ReportRoutingModule } from './report-routing.module';
import { ReportComponent } from './report.component';
import { SharedModule } from './shared.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({

    declarations: [ReportComponent],
    imports: [CommonModule, ReportRoutingModule, SharedModule,
        PopoverModule.forRoot(),
        TooltipModule.forRoot(),
        TranslateModule     // ReportComponent is declare here

    ],
    exports: [ReportComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})

export class ReportModule {

}