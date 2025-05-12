import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReconciliationComponent } from './reconciliation.component';
import { ReconciliationRoutingModule } from './reconciliation-routing.module';
import { SharedModule } from './shared.module';

@NgModule({

    declarations: [ReconciliationComponent],
    imports: [CommonModule, SharedModule, ReconciliationRoutingModule],
    exports: [ReconciliationComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

})

export class ReconciliationModule {

}