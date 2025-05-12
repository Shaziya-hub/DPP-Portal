import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from './shared.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';



@NgModule({

    declarations: [DashboardComponent],
    imports: [CommonModule, SharedModule, DashboardRoutingModule


    ],
    exports: [DashboardComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})

export class DashboardModule {

}