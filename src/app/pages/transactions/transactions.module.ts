import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';
import { SharedModule } from 'src/app/pages/transactions/shared.module';


@NgModule({
  declarations: [
    TransactionsComponent
  ],
  imports: [
    CommonModule,
    TransactionsRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [
    DatePipe

  ],
})
export class TransactionsModule { }
