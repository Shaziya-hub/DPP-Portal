import { CommonModule } from '@angular/common';

import { SharedModule } from './shared.module';

import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { InboxComponent } from './inbox.component';
import { InboxRoutingModule } from './inbox-routing.module';



@NgModule({
  declarations: [
    InboxComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    InboxRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class InboxModule { }
