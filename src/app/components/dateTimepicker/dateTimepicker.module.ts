import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { NgbDatepickerModule, NgbModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

//import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
//import { DateTimepickerComponent } from './dateTimepicker.component';
import { DateTimepickerComponent } from './dateTimepicker.component';
import { ClickOutsideModule } from 'ng4-click-outside';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { HandlingClicksDirective } from '../HandlingClicks/HandlingClicks.directive';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({

    declarations: [DateTimepickerComponent, HandlingClicksDirective],
    imports: [CommonModule, FormsModule,
        ReactiveFormsModule, NgbDatepickerModule, NgbTimepickerModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        ClickOutsideModule,
        NgbModule,
        TranslateModule

    ],
    exports: [DateTimepickerComponent, HandlingClicksDirective],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

})

export class DateTimepickerModule {

}