import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SettlementComponent } from './settlement.component';
import { SettlementRoutingModule } from './settlement-routing.module';
import { SharedModule } from './shared.module';

@NgModule({

    declarations: [SettlementComponent],
    imports: [CommonModule, SettlementRoutingModule, SharedModule],
    exports: [SettlementComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

})

export class SettlementModule {

}